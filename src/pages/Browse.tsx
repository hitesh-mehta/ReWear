
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import { itemsAPI, Item } from '@/lib/localStorage';
import { Search, Filter, MapPin, User, Star } from 'lucide-react';
import MascotIcon from '@/components/MascotIcon';

const Browse = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    size: '',
    type: '',
    condition: ''
  });

  const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Jackets', 'Shoes', 'Accessories', 'Sets'];
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const types = ['All', 'swap', 'rent', 'redeem'];
  const conditions = ['All', 'Excellent', 'Good', 'Fair', 'Needs TLC'];

  useEffect(() => {
    const allItems = itemsAPI.getAll().filter(item => item.status === 'approved');
    setItems(allItems);
    setFilteredItems(allItems);
  }, []);

  useEffect(() => {
    // Start with all approved items
    let filtered = items.filter(item => item.status === 'approved');

    // Apply search
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery) ||
        item.brand?.toLowerCase().includes(lowercaseQuery) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    }

    // Apply filters
    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    
    if (filters.size && filters.size !== 'All') {
      filtered = filtered.filter(item => item.size === filters.size);
    }
    
    if (filters.type && filters.type !== 'All') {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    
    if (filters.condition && filters.condition !== 'All') {
      filtered = filtered.filter(item => item.condition === filters.condition);
    }

    setFilteredItems(filtered);
  }, [searchQuery, filters, items]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'swap': return '🔄';
      case 'rent': return '💰';
      case 'redeem': return '⭐';
      default: return '👕';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'swap': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'rent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'redeem': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Browse Items</h1>
            <MascotIcon size={60} category={filters.category || 'general'} />
          </div>
          
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.size} onValueChange={(value) => setFilters(prev => ({ ...prev, size: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map(size => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === 'All' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.condition} onValueChange={(value) => setFilters(prev => ({ ...prev, condition: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map(condition => (
                  <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredItems.length} items
          </p>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <Link key={`${item.id}-${index}`} to={`/item/${item.id}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0">
                <div className="aspect-square overflow-hidden rounded-t-lg relative">
                  <img
                    src={item.images[0] || '/placeholder.svg'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Multiple images indicator */}
                  {item.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                      +{item.images.length - 1}
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm truncate flex-1 mr-2">{item.title}</h3>
                    <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)} {item.type}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{item.brand}</span>
                    <span>{item.size}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs">{item.username}</span>
                    </div>
                    
                    {item.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {item.type === 'rent' && item.rentPrice && (
                    <div className="mt-2 text-sm font-medium text-green-600">
                      ₹{item.rentPrice}/day
                    </div>
                  )}
                  
                  {item.type === 'redeem' && item.points && (
                    <div className="mt-2 text-sm font-medium text-purple-600">
                      {item.points} points
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags?.slice(0, 2).map((tag, tagIndex) => (
                      <Badge key={`${tag}-${tagIndex}`} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <MascotIcon size={120} category={filters.category || 'general'} className="mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
