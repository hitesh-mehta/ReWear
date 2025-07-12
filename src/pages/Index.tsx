import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shirt, Users, Recycle, Star, ArrowRight, Sparkles, Heart, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Mascot3D from '@/components/3DMascot';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Shirt className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ReWear
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <Link to="/dashboard">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section with Image-based Mascot */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Sustainable Fashion Revolution
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
              Fashion that{' '}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                Rewears
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
              Join India's first sustainable fashion community. Swap, rent, and redeem clothes while earning points and building your eco-friendly wardrobe.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to={user ? "/dashboard" : "/auth"}>
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl text-lg">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/browse">
                <Button size="lg" variant="outline" className="border-2 border-purple-200 hover:border-purple-300 px-8 py-4 rounded-xl text-lg">
                  Explore Items
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Image-based Mascot */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
            <Mascot3D height="400px" className="relative z-10" category="general" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Badge variant="secondary" className="bg-white/80 text-purple-600">
                Meet ReWear Bot! 👋
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            How ReWear Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Transform your wardrobe sustainably with our innovative platform
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md hover:scale-105 transition-transform duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Swap & Share</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                Exchange clothes with trusted community members. One person's unused item becomes another's treasure.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md hover:scale-105 transition-transform duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Rent Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                Access designer pieces for special occasions without the full cost. Sustainable luxury fashion.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md hover:scale-105 transition-transform duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Earn & Redeem</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                Earn points for sustainable actions and redeem them for new items. Rewarding responsible fashion choices.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Impact We're Making Together
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">10,000+</div>
            <div className="text-gray-600 dark:text-gray-300">Items Swapped</div>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">5,000+</div>
            <div className="text-gray-600 dark:text-gray-300">Happy Users</div>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Recycle className="w-10 h-10 text-white" />
            </div>
            <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">50 tons</div>
            <div className="text-gray-600 dark:text-gray-300">Waste Reduced</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Wardrobe?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of fashion enthusiasts building a sustainable future, one outfit at a time.
            </p>
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-xl text-lg">
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ReWear
            </span>
          </div>
          
          <div className="text-gray-600 dark:text-gray-400">
            © 2024 ReWear. Sustainable fashion for everyone.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
