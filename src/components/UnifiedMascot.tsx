
import { useState } from 'react';
import { getMascotForCategory, getMascotFallback } from '@/utils/mascotUtils';

interface UnifiedMascotProps {
  category?: string;
  size?: 'small' | 'medium' | 'large' | 'custom';
  customSize?: number;
  customHeight?: string;
  showText?: boolean;
  textMessage?: string;
  className?: string;
  animate?: 'float' | 'bounce' | 'pulse' | 'none';
}

const UnifiedMascot: React.FC<UnifiedMascotProps> = ({
  category = 'general',
  size = 'medium',
  customSize,
  customHeight,
  showText = false,
  textMessage = "Hi! I'm your ReWear fashion assistant! ✨👗",
  className = '',
  animate = 'float'
}) => {
  const [imageError, setImageError] = useState(false);
  const mascotImage = getMascotForCategory(category);
  const fallback = getMascotFallback();

  const getSizeClasses = () => {
    if (customSize) return { width: customSize, height: customSize };
    if (customHeight) return { height: customHeight, width: '100%' };
    
    switch (size) {
      case 'small': return { width: 60, height: 60 };
      case 'medium': return { width: 120, height: 120 };
      case 'large': return { width: 200, height: 200 };
      default: return { width: 120, height: 120 };
    }
  };

  const getAnimationClass = () => {
    switch (animate) {
      case 'float': return 'animate-pulse hover:scale-105 transition-transform duration-300';
      case 'bounce': return 'animate-bounce hover:scale-105 transition-all duration-300';
      case 'pulse': return 'animate-pulse';
      default: return 'hover:scale-105 transition-transform duration-200';
    }
  };

  const handleImageError = () => {
    console.log('Failed to load mascot image:', mascotImage);
    setImageError(true);
  };

  const sizeStyles = getSizeClasses();

  return (
    <div className={`${className} relative flex items-center justify-center`} style={sizeStyles}>
      {!imageError ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={mascotImage}
            alt={`Fashion mascot for ${category}`}
            className={`max-w-full max-h-full object-contain ${getAnimationClass()}`}
            onError={handleImageError}
            style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }}
          />
          
          {showText && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-slide-up">
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full px-4 py-2 shadow-xl border border-purple-200 dark:border-purple-700">
                <span className="text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {textMessage}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
          <div className="text-4xl mb-2">{fallback.emoji}</div>
          <p className="text-xs text-gray-500">{fallback.message}</p>
          <p className="text-xs text-gray-400 mt-1">Place {mascotImage.substring(1)} in public folder</p>
        </div>
      )}
    </div>
  );
};

export default UnifiedMascot;
