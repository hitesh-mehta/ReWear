
// Unified mascot utility for all mascot-related functionality
export const MASCOT_IMAGES = {
  'men': '/mascot1.png',
  'women': '/mascot2.png', 
  'sports': '/mascot3.png',
  'sporty': '/mascot3.png',
  'vintage': '/mascot4.png',
  'oldies': '/mascot4.png',
  'formal': '/mascot5.png',
  'casual': '/mascot6.png',
  'tops': '/mascot2.png',
  'bottoms': '/mascot1.png',
  'dresses': '/mascot2.png',
  'jackets': '/mascot5.png',
  'shoes': '/mascot3.png',
  'accessories': '/mascot6.png',
  'sets': '/mascot2.png',
  'general': '/mascot1.png'
} as const;

export type MascotCategory = keyof typeof MASCOT_IMAGES;

export const getMascotForCategory = (category: string = 'general'): string => {
  const normalizedCategory = category.toLowerCase() as MascotCategory;
  return MASCOT_IMAGES[normalizedCategory] || MASCOT_IMAGES.general;
};

export const getMascotFallback = () => ({
  emoji: '👗',
  message: 'Mascot loading...'
});
