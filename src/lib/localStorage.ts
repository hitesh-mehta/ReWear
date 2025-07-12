import { getImage } from './imageUtils';
import { createSampleItems } from './sampleData';

export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  type: 'swap' | 'rent' | 'redeem';
  brand?: string;
  condition: string;
  rentPrice?: number;
  points?: number;
  minRating: number;
  isWashed: boolean;
  tags: string[];
  images: string[]; // Now stores image IDs instead of full base64
  userId: string;
  username: string;
  userAvatar?: string;
  location?: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  rating: number;
  totalSwaps: number;
  points: number;
  createdAt: string;
}

export interface SwapRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromItemId: string;
  toItemId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'swap' | 'system' | 'chat';
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  itemId: string;
  createdAt: string;
}

// Storage utility functions
const safeGetStorage = (key: string): any[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`❌ Error reading ${key} from localStorage:`, error);
    return [];
  }
};

const safeSetStorage = (key: string, data: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`❌ Error writing ${key} to localStorage:`, error);
    if (error instanceof DOMException && error.code === 22) {
      console.warn('⚠️ LocalStorage quota exceeded');
    }
    return false;
  }
};

// Items API
export const itemsAPI = {
  getAll: (): Item[] => {
    const items = safeGetStorage('rewear-items');
    console.log(`📦 Retrieved ${items.length} items from storage`);
    return items;
  },

  getById: (id: string): Item | null => {
    const items = itemsAPI.getAll();
    const item = items.find(item => item.id === id) || null;
    console.log(`🔍 Searching for item ${id}:`, item ? 'found' : 'not found');
    return item;
  },

  getByUserId: (userId: string): Item[] => {
    const items = itemsAPI.getAll();
    const userItems = items.filter(item => item.userId === userId);
    console.log(`👤 Found ${userItems.length} items for user ${userId}`);
    return userItems;
  },

  getByStatus: (status: string): Item[] => {
    const items = itemsAPI.getAll();
    const statusItems = items.filter(item => item.status === status);
    console.log(`📊 Found ${statusItems.length} items with status: ${status}`);
    return statusItems;
  },

  create: (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Item => {
    try {
      const items = itemsAPI.getAll();
      const newItem: Item = {
        ...itemData,
        id: `item-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      items.push(newItem);
      const success = safeSetStorage('rewear-items', items);
      
      if (!success) {
        throw new Error('Failed to save item to storage');
      }
      
      console.log('✅ Created new item:', newItem.id);
      return newItem;
    } catch (error) {
      console.error('❌ Failed to create item:', error);
      throw new Error('Failed to save item. Storage may be full.');
    }
  },

  update: (id: string, updates: Partial<Item>): Item | null => {
    try {
      const items = itemsAPI.getAll();
      const index = items.findIndex(item => item.id === id);
      
      if (index === -1) {
        console.warn(`⚠️ Item ${id} not found for update`);
        return null;
      }
      
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const success = safeSetStorage('rewear-items', items);
      if (!success) {
        console.error('❌ Failed to update item in storage');
        return null;
      }
      
      console.log('✅ Updated item:', items[index].id);
      return items[index];
    } catch (error) {
      console.error('❌ Failed to update item:', error);
      return null;
    }
  },

  updateStatus: (id: string, status: 'pending' | 'approved' | 'rejected' | 'flagged'): Item | null => {
    console.log(`🔄 Updating item ${id} status to: ${status}`);
    return itemsAPI.update(id, { status });
  },

  delete: (id: string): boolean => {
    try {
      const items = itemsAPI.getAll();
      const filteredItems = items.filter(item => item.id !== id);
      
      if (filteredItems.length === items.length) {
        console.warn(`⚠️ Item ${id} not found for deletion`);
        return false;
      }
      
      const success = safeSetStorage('rewear-items', filteredItems);
      if (success) {
        console.log('✅ Deleted item:', id);
      }
      return success;
    } catch (error) {
      console.error('❌ Failed to delete item:', error);
      return false;
    }
  },

  search: (query: string, filters?: { category?: string; type?: string; size?: string }): Item[] => {
    console.log(`🔍 Searching items with query: "${query}", filters:`, filters);
    const items = itemsAPI.getAll().filter(item => item.status === 'approved');
    let filtered = items;

    // Text search
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery) ||
        item.brand?.toLowerCase().includes(lowercaseQuery) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    }

    // Apply filters
    if (filters?.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    if (filters?.type) {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    if (filters?.size) {
      filtered = filtered.filter(item => item.size === filters.size);
    }

    console.log(`📊 Search returned ${filtered.length} results`);
    return filtered;
  },

  // Helper method to get item with actual image data
  getItemWithImages: (id: string): (Item & { imageData: string[] }) | null => {
    const item = itemsAPI.getById(id);
    if (!item) return null;
    
    const imageData = item.images.map(imageId => getImage(imageId)).filter(Boolean);
    return { ...item, imageData };
  }
};

// Wishlist API
export const wishlistAPI = {
  getAll: (): Wishlist[] => {
    const wishlist = localStorage.getItem('rewear-wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
  },

  getByUserId: (userId: string): Wishlist[] => {
    const wishlist = wishlistAPI.getAll();
    return wishlist.filter(item => item.userId === userId);
  },

  add: (userId: string, itemId: string): Wishlist => {
    const wishlist = wishlistAPI.getAll();
    const newWishlistItem: Wishlist = {
      id: Date.now().toString(),
      userId,
      itemId,
      createdAt: new Date().toISOString()
    };
    
    wishlist.push(newWishlistItem);
    localStorage.setItem('rewear-wishlist', JSON.stringify(wishlist));
    return newWishlistItem;
  },

  remove: (userId: string, itemId: string): boolean => {
    const wishlist = wishlistAPI.getAll();
    const filteredWishlist = wishlist.filter(item => 
      !(item.userId === userId && item.itemId === itemId)
    );
    
    if (filteredWishlist.length === wishlist.length) return false;
    
    localStorage.setItem('rewear-wishlist', JSON.stringify(filteredWishlist));
    return true;
  },

  isInWishlist: (userId: string, itemId: string): boolean => {
    const wishlist = wishlistAPI.getByUserId(userId);
    return wishlist.some(item => item.itemId === itemId);
  }
};

// Users API
export const usersAPI = {
  getAll: (): User[] => {
    const users = localStorage.getItem('rewear-users');
    return users ? JSON.parse(users) : [];
  },

  getById: (id: string): User | null => {
    const users = usersAPI.getAll();
    return users.find(user => user.id === id) || null;
  },

  create: (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const users = usersAPI.getAll();
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('rewear-users', JSON.stringify(users));
    return newUser;
  },

  update: (id: string, updates: Partial<User>): User | null => {
    const users = usersAPI.getAll();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates };
    localStorage.setItem('rewear-users', JSON.stringify(users));
    return users[index];
  }
};

// Swap Requests API
export const swapRequestsAPI = {
  getAll: (): SwapRequest[] => {
    const requests = localStorage.getItem('rewear-swap-requests');
    return requests ? JSON.parse(requests) : [];
  },

  getByUserId: (userId: string): SwapRequest[] => {
    const requests = swapRequestsAPI.getAll();
    return requests.filter(req => req.fromUserId === userId || req.toUserId === userId);
  },

  create: (requestData: Omit<SwapRequest, 'id' | 'createdAt' | 'updatedAt'>): SwapRequest => {
    const requests = swapRequestsAPI.getAll();
    const newRequest: SwapRequest = {
      ...requestData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    requests.push(newRequest);
    localStorage.setItem('rewear-swap-requests', JSON.stringify(requests));
    return newRequest;
  },

  update: (id: string, updates: Partial<SwapRequest>): SwapRequest | null => {
    const requests = swapRequestsAPI.getAll();
    const index = requests.findIndex(req => req.id === id);
    
    if (index === -1) return null;
    
    requests[index] = {
      ...requests[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('rewear-swap-requests', JSON.stringify(requests));
    return requests[index];
  }
};

// Notifications API
export const notificationsAPI = {
  getAll: (): Notification[] => {
    const notifications = localStorage.getItem('rewear-notifications');
    return notifications ? JSON.parse(notifications) : [];
  },

  getByUserId: (userId: string): Notification[] => {
    const notifications = notificationsAPI.getAll();
    return notifications.filter(notif => notif.userId === userId);
  },

  create: (notificationData: Omit<Notification, 'id' | 'createdAt'>): Notification => {
    const notifications = notificationsAPI.getAll();
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    notifications.push(newNotification);
    localStorage.setItem('rewear-notifications', JSON.stringify(notifications));
    return newNotification;
  },

  markAsRead: (id: string): boolean => {
    const notifications = notificationsAPI.getAll();
    const index = notifications.findIndex(notif => notif.id === id);
    
    if (index === -1) return false;
    
    notifications[index].read = true;
    localStorage.setItem('rewear-notifications', JSON.stringify(notifications));
    return true;
  }
};

// Chat Messages API
export const chatAPI = {
  getAll: (): ChatMessage[] => {
    const messages = localStorage.getItem('rewear-chat-messages');
    return messages ? JSON.parse(messages) : [];
  },

  getConversation: (userId1: string, userId2: string): ChatMessage[] => {
    const messages = chatAPI.getAll();
    return messages.filter(msg => 
      (msg.fromUserId === userId1 && msg.toUserId === userId2) ||
      (msg.fromUserId === userId2 && msg.toUserId === userId1)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  create: (messageData: Omit<ChatMessage, 'id' | 'createdAt'>): ChatMessage => {
    const messages = chatAPI.getAll();
    const newMessage: ChatMessage = {
      ...messageData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    messages.push(newMessage);
    localStorage.setItem('rewear-chat-messages', JSON.stringify(messages));
    return newMessage;
  }
};

// Follows API
export const followsAPI = {
  getAll: (): Follow[] => {
    const follows = localStorage.getItem('rewear-follows');
    return follows ? JSON.parse(follows) : [];
  },

  getFollowers: (userId: string): Follow[] => {
    const follows = followsAPI.getAll();
    return follows.filter(follow => follow.followingId === userId);
  },

  getFollowing: (userId: string): Follow[] => {
    const follows = followsAPI.getAll();
    return follows.filter(follow => follow.followerId === userId);
  },

  create: (followData: Omit<Follow, 'id' | 'createdAt'>): Follow => {
    const follows = followsAPI.getAll();
    const newFollow: Follow = {
      ...followData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    follows.push(newFollow);
    localStorage.setItem('rewear-follows', JSON.stringify(follows));
    return newFollow;
  },

  delete: (followerId: string, followingId: string): boolean => {
    const follows = followsAPI.getAll();
    const filteredFollows = follows.filter(follow => 
      !(follow.followerId === followerId && follow.followingId === followingId)
    );
    
    if (filteredFollows.length === follows.length) return false;
    
    localStorage.setItem('rewear-follows', JSON.stringify(filteredFollows));
    return true;
  }
};

// Initialize sample data with more items
export const initializeSampleData = () => {
  try {
    const existingItems = itemsAPI.getAll();
    if (existingItems.length < 10) {
      console.log('🌱 Initializing sample data...');
      
      const sampleItems = createSampleItems();

      // Create sample items with error handling
      sampleItems.forEach((item, index) => {
        try {
          itemsAPI.create(item);
        } catch (error) {
          console.warn(`⚠️ Skipping sample item ${index + 1} due to storage constraints`);
        }
      });

      console.log('✅ Sample data initialized successfully');
    } else {
      console.log('📦 Sample data already exists, skipping initialization');
    }
  } catch (error) {
    console.error('❌ Failed to initialize sample data:', error);
  }
};

// Initialize sample data on import
if (typeof window !== 'undefined') {
  initializeSampleData();
}
