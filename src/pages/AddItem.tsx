import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import FileUpload from '@/components/FileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { itemsAPI } from '@/lib/localStorage';
import { toast } from 'sonner';
import { Shirt, Tag, Star, X, Plus } from 'lucide-react';

const AddItem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    size: '', 
    type: 'swap' as 'swap' | 'rent' | 'redeem',
    brand: '',
    condition: '',
    rentPrice: 0,
    points: 0,
    minRating: 1,
    isWashed: false,
    tags: [] as string[]
  });
  const [images, setImages] = useState<string[]>([]);

  const categories = ['Tops', 'Bottoms', 'Dresses', 'Jackets', 'Shoes', 'Accessories', 'Sets'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const conditions = ['Excellent', 'Good', 'Fair', 'Needs TLC'];
  const presetTags = ['#GenZ', '#Streetwear', '#Y2K', '#Boho', '#Minimalist', '#Vintage', '#Cottagecore', '#Dark Academia'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to add items');
      return;
    }

    // Validation
    if (images.length < 4) {
      toast.error('Please upload at least 4 images');
      return;
    }

    if (formData.description.length < 10) {
      toast.error('Description must be at least 10 characters long');
      return;
    }

    if (!formData.title || !formData.category || !formData.size || !formData.condition) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const newItem = itemsAPI.create({
        ...formData,
        images,
        userId: user.id,
        username: user.username,
        userAvatar: user.avatar,
        status: 'pending'
      });

      console.log('Item created successfully:', newItem);
      toast.success('Item submitted for review! 🎉');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to submit item:', error);
      toast.error('Failed to submit item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePresetTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const addCustomTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      const tagToAdd = newTag.trim().startsWith('#') ? newTag.trim() : `#${newTag.trim()}`;
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagToAdd]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shirt className="w-6 h-6" />
              Add New Item
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="images">Item Images * (Minimum 4 required)</Label>
                <FileUpload
                  onImagesChange={setImages}
                  minImages={4}
                  maxImages={10}
                  existingImages={images}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Vintage Denim Jacket"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Levi's, Zara, H&M..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description * (Minimum 10 characters)</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the item, its condition, styling tips..."
                  rows={3}
                  className={formData.description.length > 0 && formData.description.length < 10 ? 'border-red-500' : ''}
                />
                <p className={`text-xs ${formData.description.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.description.length}/10 characters minimum
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Size *</Label>
                  <Select value={formData.size} onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Condition *</Label>
                  <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map(condition => (
                        <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Availability Type *</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Card className={`cursor-pointer transition-all ${formData.type === 'swap' ? 'ring-2 ring-purple-500' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, type: 'swap' }))}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">🔄</div>
                      <div className="font-medium">Swap</div>
                      <div className="text-xs text-gray-500">Exchange items</div>
                    </CardContent>
                  </Card>
                  
                  <Card className={`cursor-pointer transition-all ${formData.type === 'rent' ? 'ring-2 ring-purple-500' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, type: 'rent' }))}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">💰</div>
                      <div className="font-medium">Rent</div>
                      <div className="text-xs text-gray-500">Rent for events</div>
                    </CardContent>
                  </Card>
                  
                  <Card className={`cursor-pointer transition-all ${formData.type === 'redeem' ? 'ring-2 ring-purple-500' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, type: 'redeem' }))}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">⭐</div>
                      <div className="font-medium">Redeem</div>
                      <div className="text-xs text-gray-500">Use points</div>
                    </CardContent>
                  </Card>
                </div>

                {formData.type === 'rent' && (
                  <div className="space-y-2">
                    <Label htmlFor="rentPrice">Rent Price (₹/day)</Label>
                    <Input
                      id="rentPrice"
                      type="number"
                      value={formData.rentPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, rentPrice: parseInt(e.target.value) || 0 }))}
                      placeholder="250"
                    />
                  </div>
                )}

                {formData.type === 'redeem' && (
                  <div className="space-y-2">
                    <Label htmlFor="points">Points Required</Label>
                    <Input
                      id="points"
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                      placeholder="100"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Fashion Tags
                </Label>
                
                <div className="flex flex-wrap gap-2">
                  {presetTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={formData.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => togglePresetTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom tag (e.g., #Boho)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addCustomTag}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900"
                        onClick={() => removeTag(tag)}
                      >
                        {tag}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Washed before giving</Label>
                    <p className="text-sm text-gray-500">Let buyers know it's clean</p>
                  </div>
                  <Switch
                    checked={formData.isWashed}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isWashed: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Minimum Rating Required
                  </Label>
                  <Select 
                    value={formData.minRating.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, minRating: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Star - Anyone</SelectItem>
                      <SelectItem value="2">2 Stars - Basic</SelectItem>
                      <SelectItem value="3">3 Stars - Good</SelectItem>
                      <SelectItem value="4">4 Stars - Very Good</SelectItem>
                      <SelectItem value="5">5 Stars - Excellent Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={isLoading || images.length < 4 || formData.description.length < 10}
              >
                {isLoading ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddItem;
