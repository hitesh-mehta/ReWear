
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { followsAPI, usersAPI, type User } from '@/lib/localStorage';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User as UserIcon, 
  UserPlus, 
  UserMinus,
  Search,
  Users,
  Heart,
  MessageCircle
} from 'lucide-react';

interface FollowUser extends User {
  isFollowing?: boolean;
  mutualFollowers?: number;
}

const Followers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [suggestions, setSuggestions] = useState<FollowUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('followers');

  useEffect(() => {
    if (user) {
      loadFollowData();
    }
  }, [user]);

  const loadFollowData = () => {
    if (!user) return;

    // Get followers
    const followerRelations = followsAPI.getFollowers(user.id);
    const followerUsers = followerRelations.map(relation => {
      const followerUser = usersAPI.getById(relation.followerId);
      if (followerUser) {
        return {
          ...followerUser,
          isFollowing: followsAPI.getFollowing(user.id).some(f => f.followingId === followerUser.id)
        };
      }
      return null;
    }).filter(Boolean) as FollowUser[];
    
    setFollowers(followerUsers);

    // Get following
    const followingRelations = followsAPI.getFollowing(user.id);
    const followingUsers = followingRelations.map(relation => {
      const followingUser = usersAPI.getById(relation.followingId);
      if (followingUser) {
        return {
          ...followingUser,
          isFollowing: true
        };
      }
      return null;
    }).filter(Boolean) as FollowUser[];
    
    setFollowing(followingUsers);

    // Generate suggestions (users not followed)
    const allUsers = usersAPI.getAll().filter(u => u.id !== user.id);
    const followingIds = followingUsers.map(u => u.id);
    const suggestionUsers = allUsers
      .filter(u => !followingIds.includes(u.id))
      .slice(0, 10)
      .map(u => ({
        ...u,
        isFollowing: false,
        mutualFollowers: 0 // Could calculate mutual followers here
      }));
    
    setSuggestions(suggestionUsers);
  };

  const handleFollow = (targetUser: FollowUser, action: 'follow' | 'unfollow') => {
    if (!user) return;

    if (action === 'follow') {
      followsAPI.create({
        followerId: user.id,
        followingId: targetUser.id
      });
      
      toast({
        title: "Following",
        description: `You are now following ${targetUser.username}`,
      });
    } else {
      followsAPI.delete(user.id, targetUser.id);
      
      toast({
        title: "Unfollowed",
        description: `You unfollowed ${targetUser.username}`,
      });
    }

    // Reload data
    loadFollowData();
  };

  const filteredUsers = (users: FollowUser[]) => {
    if (!searchQuery) return users;
    return users.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const UserCard = ({ user: targetUser, showFollowButton = true }: { user: FollowUser, showFollowButton?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Link to={`/profile/${targetUser.id}`} className="flex items-center gap-3 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarImage src={targetUser.avatar} />
              <AvatarFallback>
                <UserIcon className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{targetUser.username}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{targetUser.totalSwaps} swaps</span>
                <span>⭐ {targetUser.rating}</span>
                {targetUser.mutualFollowers && targetUser.mutualFollowers > 0 && (
                  <span>{targetUser.mutualFollowers} mutual</span>
                )}
              </div>
            </div>
          </Link>
          
          {showFollowButton && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              
              <Button
                variant={targetUser.isFollowing ? "outline" : "default"}
                size="sm"
                onClick={() => handleFollow(targetUser, targetUser.isFollowing ? 'unfollow' : 'follow')}
              >
                {targetUser.isFollowing ? (
                  <><UserMinus className="w-4 h-4 mr-1" />Unfollow</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-1" />Follow</>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">My Community</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with other fashion enthusiasts and build your sustainable wardrobe network.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="followers">
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({following.length})
            </TabsTrigger>
            <TabsTrigger value="suggestions">
              Suggestions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="mt-6">
            <div className="space-y-4">
              {filteredUsers(followers).map((follower) => (
                <UserCard key={follower.id} user={follower} />
              ))}
              
              {filteredUsers(followers).length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery ? 'No followers found' : 'No followers yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery 
                      ? 'Try adjusting your search query'
                      : 'Start connecting with other users to build your community!'
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="following" className="mt-6">
            <div className="space-y-4">
              {filteredUsers(following).map((followingUser) => (
                <UserCard key={followingUser.id} user={followingUser} />
              ))}
              
              {filteredUsers(following).length === 0 && (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery ? 'No following found' : 'Not following anyone yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery
                      ? 'Try adjusting your search query'
                      : 'Discover users in the suggestions tab!'
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="suggestions" className="mt-6">
            <div className="space-y-4">
              {filteredUsers(suggestions).map((suggestion) => (
                <UserCard key={suggestion.id} user={suggestion} />
              ))}
              
              {filteredUsers(suggestions).length === 0 && (
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery ? 'No suggestions found' : 'No more suggestions'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery
                      ? 'Try adjusting your search query'
                      : 'Check back later for more user suggestions!'
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Followers;
