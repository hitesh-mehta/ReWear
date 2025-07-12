
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { itemsAPI, swapRequestsAPI, wishlistAPI, type Item } from '@/lib/localStorage';
import { 
  ArrowLeft, 
  Heart, 
  HeartHandshake,
  MessageCircle, 
  Star, 
  MapPin, 
  Calendar,
  Droplets,
  Share2,
  ShoppingCart,
  Bookmark,
  CreditCard,
  Sparkles
} from 'lucide-react';

const ItemDetail = () => {
  const { itemId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState<Item | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [swapMessage, setSwapMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (itemId) {
      const foundItem = itemsAPI.getById(itemId);
      setItem(foundItem);
      
      if (foundItem && user) {
        setIsInWishlist(wishlistAPI.isInWishlist(user.id, itemId));
      }
    }
  }, [itemId, user]);

  const handleWishlistToggle = () => {
    if (!user || !item) return;

    if (isInWishlist) {
      wishlistAPI.remove(user.id, item.id);
      setIsInWishlist(false);
      toast({
        title: "Removed from Wishlist",
        description: "Item removed from your wishlist",
      });
    } else {
      wishlistAPI.add(user.id, item.id);
      setIsInWishlist(true);
      toast({
        title: "Added to Wishlist",
        description: "Item added to your wishlist",
      });
    }
  };

  const handleSwapRequest = () => {
    if (!user || !item) return;
    
    setIsLoading(true);
    
    try {
      swapRequestsAPI.create({
        fromUserId: user.id,
        toUserId: item.userId,
        fromItemId: '', // This would typically be selected from user's items
        toItemId: item.id,
        status: 'pending',
        message: swapMessage
      });

      toast({
        title: "Swap Request Sent!",
        description: "Your swap request has been sent to the item owner",
      });
      
      setSwapMessage('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send swap request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReserve = () => {
    if (!user || !item) return;

    if (item.type === 'rent' && item.rentPrice) {
      toast({
        title: "Reserved for Rent",
        description: `Item reserved! Rent price: ₹${item.rentPrice}/day`,
      });
    } else if (item.type === 'redeem' && item.points) {
      if (user.points >= item.points) {
        toast({
          title: "Reserved with Points",
          description: `Item reserved! Cost: ${item.points} points`,
        });
      } else {
        toast({
          title: "Insufficient Points",
          description: `You need ${item.points} points but only have ${user.points}`,
          variant: "destructive"
        });
      }
    }
  };

  const handleChat = () => {
    if (!user || !item) return;
    navigate(`/chat/${item.userId}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item?.title,
        text: item?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Item link copied to clipboard",
      });
    }
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>Item not found</p>
        </div>
      </div>
    );
  }

  const canSwap = item.type === 'swap' && user?.id !== item.userId;
  const canRent = item.type === 'rent' && user?.id !== item.userId;
  const canRedeem = item.type === 'redeem' && user?.id !== item.userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleWishlistToggle}>
              <Heart className={`w-4 h-4 mr-1 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
              {isInWishlist ? 'Saved' : 'Save'}
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={item.images[0] || '/placeholder.svg'}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded bg-gray-100">
                    <img
                      src={image}
                      alt={`${item.title} ${index + 2}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{item.title}</h1>
                <Badge className={`ml-2 ${
                  item.type === 'swap' ? 'bg-blue-100 text-blue-800' :
                  item.type === 'rent' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {item.type === 'swap' ? '🔄 Swap' :
                   item.type === 'rent' ? '💰 Rent' :
                   '⭐ Redeem'}
                </Badge>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                {item.description}
              </p>

              {/* Price/Points */}
              {item.type === 'rent' && item.rentPrice && (
                <div className="text-2xl font-bold text-green-600 mb-4">
                  ₹{item.rentPrice}/day
                </div>
              )}
              
              {item.type === 'redeem' && item.points && (
                <div className="text-2xl font-bold text-purple-600 mb-4">
                  {item.points} points
                </div>
              )}
            </div>

            {/* Item Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Brand:</span>
                    <span>{item.brand || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{item.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Condition:</span>
                    <span>{item.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span>{item.category}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Care Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    <span>{item.isWashed ? 'Freshly washed' : 'Needs washing'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>Min. rating: {item.minRating}/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={item.userAvatar} />
                    <AvatarFallback>{item.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Link 
                      to={`/profile/${item.userId}`}
                      className="font-semibold hover:underline"
                    >
                      {item.username}
                    </Link>
                    {item.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleChat}>
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {canSwap && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <HeartHandshake className="w-5 h-5 mr-2" />
                      Request Swap
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request a Swap</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Send a message to {item.username} about swapping this item.
                      </p>
                      <Textarea
                        placeholder="Hi! I'm interested in swapping for this item..."
                        value={swapMessage}
                        onChange={(e) => setSwapMessage(e.target.value)}
                      />
                      <Button 
                        onClick={handleSwapRequest} 
                        disabled={isLoading}
                        className="w-full"
                      >
                        Send Swap Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {canRent && (
                <Button className="w-full" size="lg" onClick={handleReserve}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Reserve for Rent
                </Button>
              )}

              {canRedeem && (
                <Button className="w-full" size="lg" onClick={handleReserve}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Redeem with Points
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => navigate(`/virtual-try-on/${item.id}`)}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Virtual Try-On
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
