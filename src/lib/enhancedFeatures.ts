
import { itemsAPI, usersAPI, type Item, type User } from './localStorage';

// Wishlist functionality
export interface WishlistItem {
  id: string;
  userId: string;
  itemId: string;
  createdAt: string;
}

export const wishlistAPI = {
  getAll: (): WishlistItem[] => {
    const data = localStorage.getItem('rewear-wishlists');
    return data ? JSON.parse(data) : [];
  },

  getByUserId: (userId: string): WishlistItem[] => {
    const wishlists = wishlistAPI.getAll();
    return wishlists.filter(w => w.userId === userId);
  },

  add: (userId: string, itemId: string): WishlistItem => {
    const wishlists = wishlistAPI.getAll();
    const newWishlistItem: WishlistItem = {
      id: `wishlist-${Date.now()}`,
      userId,
      itemId,
      createdAt: new Date().toISOString()
    };
    
    wishlists.push(newWishlistItem);
    localStorage.setItem('rewear-wishlists', JSON.stringify(wishlists));
    return newWishlistItem;
  },

  remove: (userId: string, itemId: string): boolean => {
    const wishlists = wishlistAPI.getAll();
    const filtered = wishlists.filter(w => !(w.userId === userId && w.itemId === itemId));
    
    if (filtered.length === wishlists.length) return false;
    
    localStorage.setItem('rewear-wishlists', JSON.stringify(filtered));
    return true;
  },

  isInWishlist: (userId: string, itemId: string): boolean => {
    const wishlists = wishlistAPI.getByUserId(userId);
    return wishlists.some(w => w.itemId === itemId);
  }
};

// Reviews functionality
export interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  itemId?: string;
  swapRequestId?: string;
  rating: number;
  comment: string;
  type: 'swap' | 'rent' | 'general';
  createdAt: string;
}

export const reviewsAPI = {
  getAll: (): Review[] => {
    const data = localStorage.getItem('rewear-reviews');
    return data ? JSON.parse(data) : [];
  },

  getByUserId: (userId: string): Review[] => {
    const reviews = reviewsAPI.getAll();
    return reviews.filter(r => r.toUserId === userId);
  },

  getByItemId: (itemId: string): Review[] => {
    const reviews = reviewsAPI.getAll();
    return reviews.filter(r => r.itemId === itemId);
  },

  create: (reviewData: Omit<Review, 'id' | 'createdAt'>): Review => {
    const reviews = reviewsAPI.getAll();
    const newReview: Review = {
      ...reviewData,
      id: `review-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    reviews.push(newReview);
    localStorage.setItem('rewear-reviews', JSON.stringify(reviews));
    
    // Update user rating
    const userReviews = reviewsAPI.getByUserId(reviewData.toUserId);
    const averageRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    usersAPI.update(reviewData.toUserId, { rating: Math.round(averageRating * 10) / 10 });
    
    return newReview;
  },

  getUserAverageRating: (userId: string): number => {
    const reviews = reviewsAPI.getByUserId(userId);
    if (reviews.length === 0) return 5.0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }
};

// Notifications functionality
export interface NotificationData {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'swap' | 'rent' | 'redeem' | 'follow' | 'review' | 'system';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export const notificationsAPI = {
  getAll: (): NotificationData[] => {
    const data = localStorage.getItem('rewear-notifications');
    return data ? JSON.parse(data) : [];
  },

  getByUserId: (userId: string): NotificationData[] => {
    const notifications = notificationsAPI.getAll();
    return notifications.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  create: (notificationData: Omit<NotificationData, 'id' | 'createdAt'>): NotificationData => {
    const notifications = notificationsAPI.getAll();
    const newNotification: NotificationData = {
      ...notificationData,
      id: `notification-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    notifications.push(newNotification);
    localStorage.setItem('rewear-notifications', JSON.stringify(notifications));
    return newNotification;
  },

  markAsRead: (id: string): boolean => {
    const notifications = notificationsAPI.getAll();
    const index = notifications.findIndex(n => n.id === id);
    
    if (index === -1) return false;
    
    notifications[index].read = true;
    localStorage.setItem('rewear-notifications', JSON.stringify(notifications));
    return true;
  },

  markAllAsRead: (userId: string): void => {
    const notifications = notificationsAPI.getAll();
    notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    localStorage.setItem('rewear-notifications', JSON.stringify(notifications));
  }
};

// Enhanced search functionality
export interface SearchFilters {
  category?: string;
  brand?: string;
  size?: string;
  type?: 'swap' | 'rent' | 'redeem';
  condition?: string;
  priceRange?: [number, number];
  pointsRange?: [number, number];
  location?: string;
  tags?: string[];
  isWashed?: boolean;
  minRating?: number;
  sortBy?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'rating' | 'distance';
}

export const enhancedSearchAPI = {
  search: (query: string = '', filters: SearchFilters = {}): Item[] => {
    const items = itemsAPI.getAll().filter(item => item.status === 'approved');
    let results = items;

    // Text search with fuzzy matching
    if (query) {
      const queryLower = query.toLowerCase();
      results = results.filter(item => {
        const searchableText = [
          item.title,
          item.description,
          item.brand || '',
          ...(item.tags || [])
        ].join(' ').toLowerCase();
        
        // Simple fuzzy search - checks if all query words exist
        const queryWords = queryLower.split(' ').filter(word => word.length > 0);
        return queryWords.every(word => searchableText.includes(word));
      });
    }

    // Apply filters
    if (filters.category) {
      results = results.filter(item => item.category === filters.category);
    }
    
    if (filters.brand) {
      results = results.filter(item => item.brand === filters.brand);
    }
    
    if (filters.size) {
      results = results.filter(item => item.size === filters.size);
    }
    
    if (filters.type) {
      results = results.filter(item => item.type === filters.type);
    }
    
    if (filters.condition) {
      results = results.filter(item => item.condition === filters.condition);
    }
    
    if (filters.priceRange && filters.type === 'rent') {
      results = results.filter(item => 
        item.rentPrice && 
        item.rentPrice >= filters.priceRange![0] && 
        item.rentPrice <= filters.priceRange![1]
      );
    }
    
    if (filters.pointsRange && filters.type === 'redeem') {
      results = results.filter(item => 
        item.points && 
        item.points >= filters.pointsRange![0] && 
        item.points <= filters.pointsRange![1]
      );
    }
    
    if (filters.location) {
      results = results.filter(item => 
        item.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(item => 
        item.tags && filters.tags!.some(tag => 
          item.tags.some(itemTag => itemTag.toLowerCase().includes(tag.toLowerCase()))
        )
      );
    }
    
    if (filters.isWashed !== undefined) {
      results = results.filter(item => item.isWashed === filters.isWashed);
    }
    
    if (filters.minRating) {
      results = results.filter(item => {
        const user = usersAPI.getById(item.userId);
        return user && user.rating >= filters.minRating!;
      });
    }

    // Sort results
    if (filters.sortBy) {
      results.sort((a, b) => {
        switch (filters.sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'price-low':
            return (a.rentPrice || 0) - (b.rentPrice || 0);
          case 'price-high':
            return (b.rentPrice || 0) - (a.rentPrice || 0);
          case 'rating':
            const userA = usersAPI.getById(a.userId);
            const userB = usersAPI.getById(b.userId);
            return (userB?.rating || 0) - (userA?.rating || 0);
          default:
            return 0;
        }
      });
    }

    return results;
  },

  getSuggestions: (userId: string): Item[] => {
    const user = usersAPI.getById(userId);
    if (!user) return [];

    // Get user's interaction history
    const wishlistItems = wishlistAPI.getByUserId(userId);
    const userItems = itemsAPI.getByUserId(userId);
    
    // Find categories and brands user is interested in
    const interestCategories = new Set<string>();
    const interestBrands = new Set<string>();
    
    wishlistItems.forEach(w => {
      const item = itemsAPI.getById(w.itemId);
      if (item) {
        interestCategories.add(item.category);
        if (item.brand) interestBrands.add(item.brand);
      }
    });
    
    userItems.forEach(item => {
      interestCategories.add(item.category);
      if (item.brand) interestBrands.add(item.brand);
    });

    // Get suggestions based on interests
    const allItems = itemsAPI.getAll().filter(item => 
      item.status === 'approved' && 
      item.userId !== userId &&
      !wishlistItems.some(w => w.itemId === item.id)
    );

    const suggestions = allItems.filter(item => 
      interestCategories.has(item.category) || 
      (item.brand && interestBrands.has(item.brand))
    );

    return suggestions.slice(0, 20);
  }
};

// Trending functionality
export const trendingAPI = {
  getTrendingItems: (location?: string, ageGroup?: string): Item[] => {
    const items = itemsAPI.getAll().filter(item => item.status === 'approved');
    
    // Simple trending algorithm based on recent activity
    const recentItems = items.filter(item => {
      const itemDate = new Date(item.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDate > weekAgo;
    });

    if (location) {
      return recentItems.filter(item => 
        item.location?.toLowerCase().includes(location.toLowerCase())
      ).slice(0, 10);
    }

    return recentItems.slice(0, 10);
  },

  getPopularCategories: (): Array<{category: string, count: number}> => {
    const items = itemsAPI.getAll().filter(item => item.status === 'approved');
    const categoryCounts = new Map<string, number>();
    
    items.forEach(item => {
      categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
    });

    return Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
};

// Points system
export const pointsAPI = {
  POINT_VALUES: {
    SUCCESSFUL_SWAP: 10,
    ITEM_LISTED: 5,
    PROFILE_COMPLETED: 20,
    FIRST_REVIEW: 15,
    WASH_BEFORE_GIVING: 5,
    DAILY_LOGIN: 2
  },

  awardPoints: (userId: string, action: keyof typeof pointsAPI.POINT_VALUES, reason: string): void => {
    const user = usersAPI.getById(userId);
    if (!user) return;

    const points = pointsAPI.POINT_VALUES[action];
    const newPoints = user.points + points;
    
    usersAPI.update(userId, { points: newPoints });
    
    // Create notification
    notificationsAPI.create({
      userId,
      title: 'Points Earned!',
      message: `You earned ${points} points for ${reason}`,
      type: 'system',
      read: false
    });
  },

  deductPoints: (userId: string, points: number, reason: string): boolean => {
    const user = usersAPI.getById(userId);
    if (!user || user.points < points) return false;

    usersAPI.update(userId, { points: user.points - points });
    
    notificationsAPI.create({
      userId,
      title: 'Points Used',
      message: `You used ${points} points for ${reason}`,
      type: 'system',
      read: false
    });

    return true;
  }
};
