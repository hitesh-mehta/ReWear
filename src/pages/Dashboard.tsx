
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { itemsAPI } from '@/lib/localStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Package, 
  Star,
  Plus,
  Eye,
  MessageSquare,
  Heart,
  Settings,
  Crown,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FashionMascot3D from '@/components/FashionMascot3D';

const Dashboard = () => {
  const { user } = useAuth();
  const [userItems] = useState(() => user ? itemsAPI.getByUserId(user.id) : []);
  const [allItems] = useState(() => itemsAPI.getAll());

  const stats = {
    totalItems: userItems.length,
    totalSwaps: 12,
    points: user?.points || 0,
    rating: user?.trustScore || 5.0
  };

  const recentActivities = [
    { type: 'swap', message: 'New swap request for your vintage jacket', time: '2 hours ago' },
    { type: 'like', message: 'Someone liked your boho dress', time: '4 hours ago' },
    { type: 'message', message: 'New message from Sarah about the designer bag', time: '1 day ago' },
    { type: 'points', message: 'Earned 50 points for completed swap', time: '2 days ago' }
  ];

  console.log('🏠 Dashboard - Current user:', { 
    id: user?.id, 
    email: user?.email, 
    role: user?.role,
    username: user?.username 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950 transition-all duration-500">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6 animate-fade-in">
        {/* Welcome Section with Role-based Styling */}
        <div className="mb-8">
          <div className={`rounded-2xl p-8 glass card-animated ${
            user?.role === 'admin' 
              ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-200' 
              : user?.role === 'business'
              ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-200'
              : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-200'
          }`}>
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center space-x-3 mb-4">
                  <h1 className="text-4xl font-bold gradient-text">
                    Welcome back, {user?.username}!
                  </h1>
                  {user?.role === 'admin' && (
                    <Badge className="bg-red-500 text-white animate-pulse-glow">
                      <Crown className="w-4 h-4 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {user?.role === 'business' && (
                    <Badge className="bg-blue-500 text-white animate-pulse-glow">
                      <Building2 className="w-4 h-4 mr-1" />
                      Business
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  {user?.role === 'admin' 
                    ? 'Manage the ReWear platform and moderate content'
                    : user?.role === 'business'
                    ? 'Grow your sustainable fashion business'
                    : 'Ready to discover amazing fashion finds and make sustainable swaps?'
                  }
                </p>
                <div className="flex flex-wrap gap-3">
                  {user?.role === 'admin' && (
                    <Link to="/admin">
                      <Button className="btn-animated bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Link to="/browse">
                    <Button className="btn-animated bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      <Eye className="w-4 h-4 mr-2" />
                      Browse Items
                    </Button>
                  </Link>
                  <Link to="/add-item">
                    <Button variant="outline" className="btn-animated hover-glow">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Item
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Fashion Mascot with appropriate category */}
              <div className="w-full lg:w-96 h-80 animate-float">
                <FashionMascot3D 
                  showText={true} 
                  category={user?.role === 'admin' ? 'formal' : user?.role === 'business' ? 'formal' : 'general'} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Items', value: stats.totalItems, icon: Package, color: 'from-blue-500 to-cyan-500' },
            { title: 'Total Swaps', value: stats.totalSwaps, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
            { title: 'Points Earned', value: stats.points, icon: Star, color: 'from-yellow-500 to-orange-500' },
            { title: 'Trust Rating', value: `${stats.rating}/5`, icon: Users, color: 'from-purple-500 to-pink-500' }
          ].map((stat, index) => (
            <Card key={stat.title} className={`hover-lift card-animated stagger-item border-0 glass`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                    <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color} shadow-lg animate-pulse-glow`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-animated border-0 glass">
              <CardHeader>
                <CardTitle className="gradient-text">Your Recent Items</CardTitle>
              </CardHeader>
              <CardContent>
                {userItems.length > 0 ? (
                  <div className="space-y-4">
                    {userItems.slice(0, 3).map((item, index) => (
                      <div key={item.id} className={`flex items-center space-x-4 p-4 rounded-lg glass hover-lift stagger-item`}>
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center animate-pulse-glow">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.category} • {item.condition}</p>
                        </div>
                        <Badge className="animate-bounce-in">{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 animate-fade-in">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-float" />
                    <h4 className="text-lg font-semibold mb-2">No items yet</h4>
                    <p className="text-muted-foreground mb-4">Start by adding your first fashion item!</p>
                    <Link to="/add-item">
                      <Button className="btn-animated bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Item
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-animated border-0 glass">
              <CardHeader>
                <CardTitle className="gradient-text">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { title: 'Browse Items', icon: Eye, href: '/browse', color: 'from-blue-500 to-cyan-500' },
                    { title: 'Add Item', icon: Plus, href: '/add-item', color: 'from-green-500 to-emerald-500' },
                    { title: 'Messages', icon: MessageSquare, href: '/chat', color: 'from-purple-500 to-pink-500' },
                    { title: 'Profile', icon: Users, href: '/profile', color: 'from-yellow-500 to-orange-500' }
                  ].map((action, index) => (
                    <Link key={action.title} to={action.href}>
                      <Button 
                        variant="outline" 
                        className={`w-full h-20 btn-animated hover-glow stagger-item flex flex-col items-center justify-center space-y-2`}
                      >
                        <div className={`p-2 rounded-full bg-gradient-to-r ${action.color} mb-1`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium">{action.title}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div>
            <Card className="card-animated border-0 glass">
              <CardHeader>
                <CardTitle className="gradient-text">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className={`flex items-start space-x-3 stagger-item`}>
                      <div className={`p-2 rounded-full ${
                        activity.type === 'swap' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        activity.type === 'like' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                        activity.type === 'message' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                        'bg-gradient-to-r from-yellow-500 to-orange-500'
                      } animate-pulse-glow`}>
                        {activity.type === 'swap' && <TrendingUp className="w-4 h-4 text-white" />}
                        {activity.type === 'like' && <Heart className="w-4 h-4 text-white" />}
                        {activity.type === 'message' && <MessageSquare className="w-4 h-4 text-white" />}
                        {activity.type === 'points' && <Star className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
