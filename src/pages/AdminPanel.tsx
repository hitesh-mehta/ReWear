
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  Flag, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  BarChart3,
  AlertTriangle,
  Clock,
  MapPin,
  Eye
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { itemsAPI, Item } from '@/lib/localStorage';
import { toast } from 'sonner';

const AdminPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('pending');
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [allItems, searchTerm, selectedTab]);

  const loadItems = () => {
    const items = itemsAPI.getAll();
    setAllItems(items);
    console.log('Loaded items for admin:', items);
  };

  const filterItems = () => {
    let filtered = allItems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status based on selected tab
    switch (selectedTab) {
      case 'pending':
        filtered = filtered.filter(item => item.status === 'pending');
        break;
      case 'flagged':
        filtered = filtered.filter(item => item.status === 'flagged');
        break;
      case 'approved':
        filtered = filtered.filter(item => item.status === 'approved');
        break;
      case 'rejected':
        filtered = filtered.filter(item => item.status === 'rejected');
        break;
    }

    setFilteredItems(filtered);
  };

  const handleApprove = (itemId: string) => {
    try {
      const updatedItem = itemsAPI.updateStatus(itemId, 'approved');
      if (updatedItem) {
        toast.success('Item approved successfully!');
        loadItems();
      }
    } catch (error) {
      console.error('Failed to approve item:', error);
      toast.error('Failed to approve item');
    }
  };

  const handleReject = (itemId: string) => {
    try {
      const updatedItem = itemsAPI.updateStatus(itemId, 'rejected');
      if (updatedItem) {
        toast.success('Item rejected');
        loadItems();
      }
    } catch (error) {
      console.error('Failed to reject item:', error);
      toast.error('Failed to reject item');
    }
  };

  const handleFlag = (itemId: string) => {
    try {
      const updatedItem = itemsAPI.updateStatus(itemId, 'flagged');
      if (updatedItem) {
        toast.success('Item flagged for review');
        loadItems();
      }
    } catch (error) {
      console.error('Failed to flag item:', error);
      toast.error('Failed to flag item');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>;
      case 'flagged':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Flagged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const analytics = {
    totalItems: allItems.length,
    pendingItems: allItems.filter(item => item.status === 'pending').length,
    approvedItems: allItems.filter(item => item.status === 'approved').length,
    flaggedItems: allItems.filter(item => item.status === 'flagged').length,
    rejectedItems: allItems.filter(item => item.status === 'rejected').length,
    totalUsers: new Set(allItems.map(item => item.userId)).size
  };

  const ListingCard = ({ item, showActions = true }: { item: Item, showActions?: boolean }) => (
    <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {item.images && item.images.length > 0 ? (
              <img 
                src={item.images[0]} 
                alt={item.title}
                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">by {item.username}</p>
                <p className="text-sm text-gray-500">User ID: {item.userId}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(item.status)}
                <Badge variant="outline">{item.category}</Badge>
                <Badge variant="secondary">{item.condition}</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
              <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
              <span>🔄 {item.type}</span>
              <span>📏 {item.size}</span>
              {item.type === 'rent' && item.rentPrice && <span>💰 ₹{item.rentPrice}/day</span>}
              {item.type === 'redeem' && item.points && <span>⭐ {item.points} pts</span>}
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
              {item.description}
            </p>

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {item.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {showActions && (
              <div className="flex gap-3">
                {item.status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(item.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleReject(item.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleFlag(item.id)}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Flag
                    </Button>
                  </>
                )}
                
                {item.status === 'approved' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleFlag(item.id)}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Flag
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleReject(item.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}

                {item.status === 'flagged' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(item.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleReject(item.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}

                <Button size="sm" variant="ghost">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Manage user listings and platform content
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analytics.totalItems}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Listings</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analytics.pendingItems}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analytics.approvedItems}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Flag className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analytics.flaggedItems}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Flagged</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analytics.rejectedItems}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search listings, users, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button variant="outline" className="h-12" onClick={loadItems}>
                <Filter className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Listings Management */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({analytics.pendingItems})
            </TabsTrigger>
            <TabsTrigger value="flagged" className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Flagged ({analytics.flaggedItems})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved ({analytics.approvedItems})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected ({analytics.rejectedItems})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold capitalize">{selectedTab} Listings</h2>
              <Badge variant="secondary">{filteredItems.length} items</Badge>
            </div>
            
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold mb-2">No {selectedTab} listings</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedTab === 'pending' ? 'All caught up! No listings waiting for review.' : 
                   selectedTab === 'flagged' ? 'No flagged items need attention.' :
                   selectedTab === 'approved' ? 'No approved listings yet.' :
                   'No rejected listings.'}
                </p>
              </div>
            ) : (
              filteredItems.map(item => (
                <ListingCard key={item.id} item={item} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
