
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import { itemsAPI, type Item } from '@/lib/localStorage';
import { 
  Sparkles, 
  Search, 
  Filter,
  Palette,
  Scissors,
  Tag,
  MapPin,
  User,
  Star,
  ArrowRight
} from 'lucide-react';

interface ItemWithSimilarity extends Item {
  similarity: number;
  colorSimilarity: number;
  styleSimilarity: number;
}

const Similarity = () => {
  const { itemId } = useParams();
  const [baseItem, setBaseItem] = useState<Item | null>(null);
  const [similarItems, setSimilarItems] = useState<ItemWithSimilarity[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemWithSimilarity[]>([]);
  const [similarityThreshold, setSimilarityThreshold] = useState([75]);
  const [sortBy, setSortBy] = useState('similarity');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    if (itemId) {
      const item = itemsAPI.getById(itemId);
      setBaseItem(item);
      
      if (item) {
        findSimilarItems(item);
      }
    }
  }, [itemId]);

  useEffect(() => {
    filterAndSortItems();
  }, [similarItems, similarityThreshold, sortBy, filterBy]);

  const calculateSimilarity = (item1: Item, item2: Item): number => {
    let similarity = 0;
    let factors = 0;

    // Category match (40% weight)
    if (item1.category === item2.category) {
      similarity += 40;
    }
    factors += 40;

    // Brand match (20% weight)
    if (item1.brand && item2.brand && item1.brand === item2.brand) {
      similarity += 20;
    }
    factors += 20;

    // Size match (15% weight)
    if (item1.size === item2.size) {
      similarity += 15;
    }
    factors += 15;

    // Tags similarity (15% weight)
    if (item1.tags && item2.tags) {
      const commonTags = item1.tags.filter(tag => item2.tags.includes(tag));
      const totalTags = new Set([...item1.tags, ...item2.tags]).size;
      if (totalTags > 0) {
        similarity += (commonTags.length / totalTags) * 15;
      }
    }
    factors += 15;

    // Condition similarity (5% weight)
    if (item1.condition === item2.condition) {
      similarity += 5;
    }
    factors += 5;

    // Type similarity (5% weight)
    if (item1.type === item2.type) {
      similarity += 5;
    }
    factors += 5;

    return Math.round((similarity / factors) * 100);
  };

  const findSimilarItems = (baseItem: Item) => {
    const allItems = itemsAPI.getAll()
      .filter(item => item.id !== baseItem.id && item.status === 'approved');

    const itemsWithSimilarity: ItemWithSimilarity[] = allItems.map(item => ({
      ...item,
      similarity: calculateSimilarity(baseItem, item),
      colorSimilarity: calculateColorSimilarity(baseItem, item),
      styleSimilarity: calculateStyleSimilarity(baseItem, item)
    }));

    // Sort by similarity and filter out items with very low similarity
    const similar = itemsWithSimilarity
      .filter(item => item.similarity >= 20)
      .sort((a, b) => b.similarity - a.similarity);

    setSimilarItems(similar);
  };

  const calculateColorSimilarity = (item1: Item, item2: Item): number => {
    // Simplified color similarity based on tags
    const colorKeywords = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'brown', 'gray'];
    
    const item1Colors = item1.tags?.filter(tag => 
      colorKeywords.some(color => tag.toLowerCase().includes(color))
    ) || [];
    
    const item2Colors = item2.tags?.filter(tag => 
      colorKeywords.some(color => tag.toLowerCase().includes(color))
    ) || [];

    if (item1Colors.length === 0 || item2Colors.length === 0) return 50;

    const commonColors = item1Colors.filter(color => item2Colors.includes(color));
    return Math.round((commonColors.length / Math.max(item1Colors.length, item2Colors.length)) * 100);
  };

  const calculateStyleSimilarity = (item1: Item, item2: Item): number => {
    const styleKeywords = ['casual', 'formal', 'vintage', 'modern', 'bohemian', 'minimalist', 'edgy', 'classic'];
    
    const item1Styles = item1.tags?.filter(tag => 
      styleKeywords.some(style => tag.toLowerCase().includes(style))
    ) || [];
    
    const item2Styles = item2.tags?.filter(tag => 
      styleKeywords.some(style => tag.toLowerCase().includes(style))
    ) || [];

    if (item1Styles.length === 0 || item2Styles.length === 0) return 50;

    const commonStyles = item1Styles.filter(style => item2Styles.includes(style));
    return Math.round((commonStyles.length / Math.max(item1Styles.length, item2Styles.length)) * 100);
  };

  const filterAndSortItems = () => {
    let filtered = similarItems.filter(item => 
      item.similarity >= similarityThreshold[0]
    );

    if (filterBy === 'same-type') {
      filtered = filtered.filter(item => item.type === baseItem?.type);
    } else if (filterBy === 'same-brand') {
      filtered = filtered.filter(item => item.brand === baseItem?.brand);
    } else if (filterBy === 'same-location') {
      filtered = filtered.filter(item => item.location === baseItem?.location);
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'similarity':
          return b.similarity - a.similarity;
        case 'color':
          return b.colorSimilarity - a.colorSimilarity;
        case 'style':
          return b.styleSimilarity - a.styleSimilarity;
        case 'rating':
          // Would need user ratings - for now use item condition as proxy
          return b.condition.localeCompare(a.condition);
        default:
          return b.similarity - a.similarity;
      }
    });

    setFilteredItems(filtered);
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 80) return 'text-green-600';
    if (similarity >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 90) return 'Excellent Match';
    if (similarity >= 75) return 'Great Match';
    if (similarity >= 60) return 'Good Match';
    if (similarity >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  if (!baseItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>Item not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-3xl font-bold">AI-Powered Similar Items</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Discover items similar to your selected piece using advanced matching algorithms
          </p>
        </div>

        {/* Base Item */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-6">
              <div className="w-32 h-32 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={baseItem.images[0] || '/placeholder.svg'}
                  alt={baseItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{baseItem.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{baseItem.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <Badge>{baseItem.category}</Badge>
                  <span>Size: {baseItem.size}</span>
                  <span>Brand: {baseItem.brand || 'Not specified'}</span>
                  <span>Condition: {baseItem.condition}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Similarity Threshold: {similarityThreshold[0]}%
                </label>
                <Slider
                  value={similarityThreshold}
                  onValueChange={setSimilarityThreshold}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="similarity">Overall Similarity</SelectItem>
                    <SelectItem value="color">Color Similarity</SelectItem>
                    <SelectItem value="style">Style Similarity</SelectItem>
                    <SelectItem value="rating">User Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Filter By</label>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="same-type">Same Type</SelectItem>
                    <SelectItem value="same-brand">Same Brand</SelectItem>
                    <SelectItem value="same-location">Same Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Tabs defaultValue="grid">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Found {filteredItems.length} similar items
            </p>
          </div>
          
          <TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Link key={item.id} to={`/item/${item.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-square overflow-hidden rounded-t-lg relative">
                      <img
                        src={item.images[0] || '/placeholder.svg'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={`${getSimilarityColor(item.similarity)} bg-white/90`}>
                          {item.similarity}% match
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm truncate flex-1 mr-2">{item.title}</h3>
                        <Badge className={`text-xs ${
                          item.type === 'swap' ? 'bg-blue-100 text-blue-800' :
                          item.type === 'rent' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {item.type}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                        {getSimilarityLabel(item.similarity)}
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
                      
                      {/* Similarity breakdown */}
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="flex items-center gap-1">
                            <Palette className="w-3 h-3" />
                            Color
                          </span>
                          <span className={getSimilarityColor(item.colorSimilarity)}>
                            {item.colorSimilarity}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="flex items-center gap-1">
                            <Scissors className="w-3 h-3" />
                            Style
                          </span>
                          <span className={getSimilarityColor(item.styleSimilarity)}>
                            {item.styleSimilarity}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <Link key={item.id} to={`/item/${item.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                          <img
                            src={item.images[0] || '/placeholder.svg'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold truncate">{item.title}</h3>
                            <Badge className={`ml-2 ${getSimilarityColor(item.similarity)} bg-white border`}>
                              {item.similarity}% match
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {item.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span>{item.brand || 'No brand'}</span>
                            <span>Size: {item.size}</span>
                            <span>{item.condition}</span>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{item.username}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1">
                              <Palette className="w-3 h-3" />
                              Color: {item.colorSimilarity}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Scissors className="w-3 h-3" />
                              Style: {item.styleSimilarity}%
                            </span>
                          </div>
                        </div>
                        
                        <ArrowRight className="w-5 h-5 text-gray-400 self-center" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No similar items found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting the similarity threshold or filters to see more results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Similarity;
