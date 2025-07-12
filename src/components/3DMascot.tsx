
import UnifiedMascot from './UnifiedMascot';

interface MascotProps {
  className?: string;
  height?: string;
  showText?: boolean;
  category?: string;
}

const Mascot3D: React.FC<MascotProps> = ({ 
  className = "", 
  height = "300px", 
  showText = false,
  category = "general"
}) => {
  return (
    <UnifiedMascot
      category={category}
      customHeight={height}
      showText={showText}
      textMessage="Hi! I'm ReWear Bot! 🌟"
      className={className}
      animate="bounce"
    />
  );
};

export default Mascot3D;
