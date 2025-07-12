
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { itemsAPI, usersAPI, followsAPI, wishlistAPI, type User, type Item } from '@/lib/localStorage';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User as UserIcon, 
  MapPin, 
  Star, 
  UserPlus, 
  UserMinus,
  Settings,
  Award,
  Heart,
  Package,
  Users,
  Edit,
  Camera,
  Shield,
  Zap,
  Crown,
  Medal,
  Upload
} from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    location: '',
    socialLinks: {
      instagram: '',
      twitter: ''
    }
  });

  useEffect(() => {
    const targetUserId = userId || currentUser?.id;
    if (targetUserId) {
      const foundUser = usersAPI.getById(targetUserId);
      setUser(foundUser);
      setIsOwnProfile(targetUserId === currentUser?.id);
      
      if (foundUser) {
        setEditForm({
          username: foundUser.username,
          bio: (foundUser as any).bio || '',
          location: (foundUser as any).location || '',
          socialLinks: (foundUser as any).socialLinks || { instagram: '', twitter: '' }
        });
      }
      
      // Get user's items
      const items = itemsAPI.getByUserId(targetUserId);
      setUserItems(items);
      
      // Get follower/following counts
      const userFollowers = followsAPI.getFollowers(targetUserId);
      const userFollowing = followsAPI.getFollowing(targetUserId);
      setFollowers(userFollowers.length);
      setFollowing(userFollowing.length);
      
      // Check if current user follows this user
      if (currentUser && targetUserId !== currentUser.id) {
        const isCurrentlyFollowing = userFollowers.some(f => f.followerId === currentUser.id);
        setIsFollowing(isCurrentlyFollowing);
      }
    }
  }, [userId, currentUser]);

  const handleFollow = () => {
    if (!currentUser || !user) return;
    
    if (isFollowing) {
      followsAPI.delete(currentUser.id, user.id);
      setIsFollowing(false);
      setFollowers(prev => prev - 1);
      toast({
        title: "Unfollowed",
        description: `You unfollowed ${user.username}`,
      });
    } else {
      followsAPI.create({
        followerId: currentUser.id,
        followingId: user.id
      });
      setIsFollowing(true);
      setFollowers(prev => prev + 1);
      toast({
        title: "Following",
        description: `You are now following ${user.username}`,
      });
    }
  };

  const handleSaveProfile = () => {
    if (!user) return;
    
    const updatedUser = usersAPI.update(user.id, {
      username: editForm.username,
      ...(editForm as any)
    });
    
    if (updatedUser) {
      setUser(updatedUser);
      setEditMode(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    }
  };

  const getBadges = () => {
    if (!user) return [];
    
    const badges = [];
    
    if (user.rating >= 4.5) badges.push({ name: "Trusted Swapper", icon: Shield, color: "bg-blue-100 text-blue-800" });
    if (user.totalSwaps >= 50) badges.push({ name: "Sustainable Star", icon: Star, color: "bg-green-100 text-green-800" });
    if ((user as any).verified) badges.push({ name: "Verified Washer", icon: Zap, color: "bg-purple-100 text-purple-800" });
    if (user.points >= 1000) badges.push({ name: "Point Master", icon: Crown, color: "bg-yellow-100 text-yellow-800" });
    if (user.totalSwaps >= 100) badges.push({ name: "Swap Champion", icon: Medal, color: "bg-red-100 text-red-800" });
    
    return badges;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>User not found</p>
        </div>
      </div>
    );
  }

  const badges = getBadges();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-2xl">
                    <UserIcon className="w-16 h-16" />
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="absolute bottom-0 right-0 rounded-full"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Update Profile Photo</DialogTitle>
                      </DialogHeader>
                      <ProfilePhotoUpload userId={user.id} onUpdate={(newAvatar) => setUser({...user, avatar: newAvatar})} />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{user.rating} rating</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{user.totalSwaps} swaps</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>{user.points} points</span>
                      </div>
                    </div>
                    {(user as any).location && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4" />
                        <span>{(user as any).location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => setEditMode(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={handleFollow}
                        variant={isFollowing ? "outline" : "default"}
                      >
                        {isFollowing ? (
                          <><UserMinus className="w-4 h-4 mr-2" />Unfollow</>
                        ) : (
                          <><UserPlus className="w-4 h-4 mr-2" />Follow</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userItems.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{followers}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{following}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Following</div>
                  </div>
                </div>
                
                {/* Bio */}
                {(user as any).bio && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {(user as any).bio}
                  </p>
                )}
                
                {/* Badges */}
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <Badge key={badge.name} className={badge.color}>
                        <badge.icon className="w-3 h-3 mr-1" />
                        {badge.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="items">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="items">Items ({userItems.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img
                      src={item.images[0] || '/placeholder.svg'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge className={`text-xs ${
                        item.type === 'swap' ? 'bg-blue-100 text-blue-800' :
                        item.type === 'rent' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {item.type}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${
                        item.status === 'approved' ? 'text-green-600' :
                        item.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {item.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {userItems.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isOwnProfile ? "Start by adding your first item!" : "This user hasn't added any items yet."}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="text-center py-12">
              <Star className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Reviews will appear here after transactions.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="wishlist" className="mt-6">
            <WishlistTab userId={user.id} isOwnProfile={isOwnProfile} />
          </TabsContent>
          
          <TabsContent value="activity" className="mt-6">
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No recent activity</h3>
              <p className="text-gray-600 dark:text-gray-400">Recent swaps and interactions will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Profile Dialog */}
        <Dialog open={editMode} onOpenChange={setEditMode}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell others about yourself..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Instagram</label>
                <Input
                  value={editForm.socialLinks.instagram}
                  onChange={(e) => setEditForm({ 
                    ...editForm, 
                    socialLinks: { ...editForm.socialLinks, instagram: e.target.value }
                  })}
                  placeholder="@username"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} className="flex-1">Save Changes</Button>
                <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Wishlist Tab Component
const WishlistTab = ({ userId, isOwnProfile }: { userId: string; isOwnProfile: boolean }) => {
  const [wishlistItems, setWishlistItems] = useState<Item[]>([]);

  useEffect(() => {
    const userWishlist = wishlistAPI.getByUserId(userId);
    const items = userWishlist.map(w => itemsAPI.getById(w.itemId)).filter(Boolean) as Item[];
    setWishlistItems(items);
  }, [userId]);

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No wishlist items</h3>
        <p className="text-gray-600 dark:text-gray-400">
          {isOwnProfile ? "Items you like will appear here." : "This user hasn't liked any items yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {wishlistItems.map((item) => (
        <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="aspect-square overflow-hidden rounded-t-lg relative">
            <img
              src={item.images[0] || '/placeholder.svg'}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {item.images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                +{item.images.length - 1}
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold truncate">{item.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.description}</p>
            <div className="flex items-center justify-between mt-2">
              <Badge className={`text-xs ${
                item.type === 'swap' ? 'bg-blue-100 text-blue-800' :
                item.type === 'rent' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {item.type}
              </Badge>
              <span className="text-xs text-gray-500">{item.size}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Profile Photo Upload Component
const ProfilePhotoUpload = ({ userId, onUpdate }: { userId: string; onUpdate: (avatar: string) => void }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const updatedUser = usersAPI.update(userId, { avatar: result });
        if (updatedUser) {
          onUpdate(result);
          toast({
            title: "Profile Photo Updated",
            description: "Your profile photo has been updated successfully.",
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to update profile photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-4">Choose a new profile photo</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
        />
      </div>
      {uploading && (
        <div className="text-center">
          <p className="text-sm text-gray-600">Uploading...</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
