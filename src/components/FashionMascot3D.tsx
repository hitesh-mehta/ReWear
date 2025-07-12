
import UnifiedMascot from './UnifiedMascot';

interface FashionMascot3DProps {
  className?: string;
  height?: string;
  showText?: boolean;
  category?: string;
}

const FashionMascot3D: React.FC<FashionMascot3DProps> = ({ 
  className = "", 
  height = "400px", 
  showText = false,
  category = "general"
}) => {
  return (
    <UnifiedMascot
      category={category}
      customHeight={height}
      showText={showText}
      textMessage="Hi! I'm your ReWear fashion assistant! ✨👗"
      className={`${className} animate-fade-in`}
      animate="float"
    />
  );
};

export default FashionMascot3D;
