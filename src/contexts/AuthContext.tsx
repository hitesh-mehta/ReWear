import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  points: number;
  badges: string[];
  followers: number;
  following: number;
  trustScore: number;
  avatar?: string;
  role: 'user' | 'admin' | 'business';
  fashionTags: string[];
  location?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Partial<User> & { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'rewear-user',
  TOKEN: 'rewear-token'
} as const;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          console.log('🔄 Restored user session:', userData);
          
          if (userData.id && userData.email && userData.username) {
            setUser(userData);
          } else {
            console.warn('⚠️ Invalid user data structure, clearing session');
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
          }
        } else {
          console.log('📝 No existing session found');
        }
      } catch (error) {
        console.error('❌ Failed to restore session:', error);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login for:', email);
      
      if (!email || !password) {
        console.error('❌ Email and password are required');
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (password.length < 3) {
        console.error('❌ Password too short');
        return false;
      }
      
      const emailLower = email.toLowerCase().trim();
      console.log('🔍 Checking email for role determination:', emailLower);
      
      let userRole: 'user' | 'admin' | 'business' = 'user';
      
      if (emailLower === 'admin@demo.com') {
        userRole = 'admin';
        console.log('✅ ADMIN role detected for:', emailLower);
      } else if (emailLower === 'business@demo.com') {
        userRole = 'business';
        console.log('✅ BUSINESS role detected for:', emailLower);
      } else {
        console.log('✅ USER role assigned for:', emailLower);
      }
      
      const mockUser: User = {
        id: userRole === 'admin' ? 'admin-1' : userRole === 'business' ? 'business-1' : `user-${Date.now()}`,
        email: emailLower,
        username: emailLower.split('@')[0],
        points: userRole === 'admin' ? 1000 : userRole === 'business' ? 500 : 150,
        badges: userRole === 'admin' ? ['Admin', 'Trusted Moderator'] : userRole === 'business' ? ['Business Verified'] : ['Trusted Swapper'],
        followers: userRole === 'admin' ? 500 : userRole === 'business' ? 200 : 24,
        following: userRole === 'admin' ? 100 : userRole === 'business' ? 50 : 18,
        trustScore: 5.0,
        role: userRole,
        fashionTags: ['#GenZ', '#Streetwear'],
        location: 'Delhi, India',
        bio: userRole === 'admin' ? 'Platform administrator' : userRole === 'business' ? 'Fashion business owner' : 'Fashion enthusiast'
      };

      console.log('✅ Final user object created:', {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        username: mockUser.username
      });

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
      localStorage.setItem(STORAGE_KEYS.TOKEN, `mock-jwt-token-${Date.now()}`);
      setUser(mockUser);
      
      console.log('✅ Login successful with role:', mockUser.role);
      return true;
    } catch (error) {
      console.error('❌ Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Partial<User> & { email: string; password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('📝 Attempting signup for:', userData.email);
      
      if (!userData.email || !userData.password) {
        console.error('❌ Email and password are required');
        return false;
      }

      if (userData.password.length < 3) {
        console.error('❌ Password too short');
        return false;
      }

      const existingUsers = JSON.parse(localStorage.getItem('rewear-all-users') || '[]');
      const userExists = existingUsers.some((user: User) => user.email === userData.email.toLowerCase());
      
      if (userExists) {
        console.error('❌ User already exists');
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: userData.email.toLowerCase(),
        username: userData.username || userData.email.split('@')[0],
        bio: userData.bio || '',
        points: 50,
        badges: ['New Member'],
        followers: 0,
        following: 0,
        trustScore: 5.0,
        role: 'user',
        fashionTags: userData.fashionTags || [],
        location: userData.location || ''
      };

      existingUsers.push(newUser);
      localStorage.setItem('rewear-all-users', JSON.stringify(existingUsers));
      
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_KEYS.TOKEN, `mock-jwt-token-${Date.now()}`);
      setUser(newUser);
      
      console.log('✅ Signup successful:', newUser);
      return true;
    } catch (error) {
      console.error('❌ Signup failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      console.log('🚪 Logging out user:', user?.email);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        
        const existingUsers = JSON.parse(localStorage.getItem('rewear-all-users') || '[]');
        const userIndex = existingUsers.findIndex((u: User) => u.id === user.id);
        if (userIndex !== -1) {
          existingUsers[userIndex] = updatedUser;
          localStorage.setItem('rewear-all-users', JSON.stringify(existingUsers));
        }
        
        console.log('✅ User updated:', updatedUser);
      } catch (error) {
        console.error('❌ Failed to update user:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
