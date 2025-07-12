
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from 'react-router-dom';

const UniversalThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  // Don't show the universal toggle on pages that have a navbar (which includes its own theme toggle)
  const pagesWithNavbar = ['/dashboard', '/profile', '/add-item', '/item', '/browse', '/similarity', '/virtual-try-on', '/followers', '/admin', '/donate', '/chat'];
  const shouldShow = !pagesWithNavbar.some(path => location.pathname.startsWith(path)) && location.pathname !== '/auth';

  if (!shouldShow) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:bg-white/90 dark:hover:bg-gray-800/90 border-2 border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      >
        {theme === 'light' ? (
          <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400 transition-transform duration-300" />
        ) : (
          <Sun className="w-4 h-4 text-yellow-500 transition-transform duration-300" />
        )}
      </Button>
    </div>
  );
};

export default UniversalThemeToggle;
