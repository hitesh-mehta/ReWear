
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import { itemsAPI, Item } from '@/lib/localStorage';
import { Search, Filter, MapPin, User, Star, Image as ImageIcon } from 'lucide-react';
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
    let filtered = [...items];

    // Apply search filter
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery) ||
        (item.brand && item.brand.toLowerCase().includes(lowercaseQuery)) ||
        item.category.toLowerCase().includes(lowercaseQuery) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        item.username.toLowerCase().includes(lowercaseQuery)
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    
    // Apply size filter
    if (filters.size && filters.size !== 'All') {
      filtered = filtered.filter(item => item.size === filters.size);
    }
    
    // Apply type filter
    if (filters.type && filters.type !== 'All') {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    
    // Apply condition filter
    if (filters.condition && filters.condition !== 'All') {
      filtered = filtered.filter(item => item.condition === filters.condition);
    }

    setFilteredItems(filtered);
  }, [searchQuery, filters, items]);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value === 'All' ? '' : value
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      category: '',
      size: '',
      type: '',
      condition: ''
    });
  };

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

  const ItemImageDisplay = ({ item }: { item: Item }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);
    
    const validImages = item.images.filter(img => img && img.trim() !== '');
    const hasValidImages = validImages.length > 0;
    
    if (!hasValidImages || imageError) {
      return (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-xs text-gray-500">No image available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        <img
          src={validImages[currentImageIndex]}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => {
            if (currentImageIndex < validImages.length - 1) {
              setCurrentImageIndex(prev => prev + 1);
            } else {
              setImageError(true);
            }
          }}
        />
        
        {/* Image counter */}
        {validImages.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
            {currentImageIndex + 1}/{validImages.length}
          </div>
        )}
        
        {/* Navigation dots for multiple images */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
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
                  placeholder="Search items, brands, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.category || 'All'} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.size || 'All'} onValueChange={(value) => handleFilterChange('size', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map(size => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.type || 'All'} onValueChange={(value) => handleFilterChange('type', value)}>
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

            <Select value={filters.condition || 'All'} onValueChange={(value) => handleFilterChange('condition', value)}>
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

          {/* Active Filters and Clear Button */}
          {(searchQuery || filters.category || filters.size || filters.type || filters.condition) && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchQuery}"
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  Category: {filters.category}
                </Badge>
              )}
              {filters.size && (
                <Badge variant="secondary" className="gap-1">
                  Size: {filters.size}
                </Badge>
              )}
              {filters.type && (
                <Badge variant="secondary" className="gap-1">
                  Type: {filters.type}
                </Badge>
              )}
              {filters.condition && (
                <Badge variant="secondary" className="gap-1">
                  Condition: {filters.condition}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <Filter className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredItems.length} of {items.length} items
          </p>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <Link key={`${item.id}-${index}`} to={`/item/${item.id}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0">
                <div className="aspect-square overflow-hidden rounded-t-lg relative">
                  <ItemImageDisplay item={item} />
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
                    <span>{item.brand || 'No brand'}</span>
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
            {searchQuery || filters.category || filters.size || filters.type || filters.condition ? (
              <>
                <h3 className="text-xl font-semibold mb-2">No items found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search or filters
                </p>
                <Button onClick={clearFilters}>
                  Clear all filters
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2">No items available</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to add items to the marketplace!
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
