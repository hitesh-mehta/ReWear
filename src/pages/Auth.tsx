import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shirt, Mail, Lock, User, MapPin, Tag, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

const Auth = () => {
  const { user, login, signup, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    bio: '',
    location: '',
    fashionTags: [] as string[]
  });

  const fashionTagOptions = [
    '#GenZ', '#Streetwear', '#ThriftFit', '#Y2K', '#Boho', '#Minimalist', 
    '#Vintage', '#Cottagecore', '#Dark Academia', '#Preppy', '#Grunge', '#Kawaii'
  ];

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔐 Form submission attempt:', { 
      email: formData.email, 
      isSignUp,
      emailLower: formData.email.toLowerCase(),
      isAdminEmail: formData.email.toLowerCase().includes('admin')
    });
    
    try {
      let success = false;
      
      if (isSignUp) {
        success = await signup(formData);
        if (success) {
          toast.success('Welcome to ReWear! 🎉');
        } else {
          toast.error('Failed to create account');
        }
      } else {
        success = await login(formData.email, formData.password);
        if (success) {
          toast.success('Welcome back! ✨');
        } else {
          toast.error('Invalid credentials');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Something went wrong');
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      fashionTags: prev.fashionTags.includes(tag)
        ? prev.fashionTags.filter(t => t !== tag)
        : [...prev.fashionTags, tag]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950 flex items-center justify-center p-4">
      {/* Home Button */}
      <Link 
        to="/"
        className="fixed top-4 left-4 z-50"
      >
        <Button 
          variant="outline" 
          size="icon"
          className="rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90"
        >
          <Home className="w-4 h-4" />
        </Button>
      </Link>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shirt className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ReWear
            </span>
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {isSignUp ? 'Join the Fashion Revolution' : 'Welcome Back!'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isSignUp ? 'Create your sustainable closet community' : 'Continue your sustainable journey'}
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-center">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="rounded-lg"
                  placeholder="your@email.com"
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="rounded-lg"
                    placeholder="fashionista123"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="rounded-lg"
                  placeholder="••••••••"
                />
              </div>

              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="rounded-lg"
                      placeholder="Delhi, India"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Fashion Style Tags
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {fashionTagOptions.map((tag) => (
                        <Badge
                          key={tag}
                          variant={formData.fashionTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Input
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="rounded-lg"
                      placeholder="Fashion lover, sustainability advocate..."
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>

            {!isSignUp && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Demo accounts:</p>
                <div className="space-y-1 text-xs text-gray-400">
                  <div>User: user@demo.com / password</div>
                  <div>Admin: admin@demo.com / password</div>
                  <div>Business: business@demo.com / password</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-purple-600 hover:text-purple-700 text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
