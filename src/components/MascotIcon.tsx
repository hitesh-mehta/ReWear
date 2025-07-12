
import UnifiedMascot from './UnifiedMascot';

interface MascotIconProps {
  size?: number;
  className?: string;
  category?: string;
}

const MascotIcon: React.FC<MascotIconProps> = ({ 
  size = 60, 
  className = "",
  category = "general"
}) => {
  return (
    <UnifiedMascot
      category={category}
      customSize={size}
      className={className}
      animate="none"
    />
  );
};

export default MascotIcon;
