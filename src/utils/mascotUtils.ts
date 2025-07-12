
// Unified mascot utility for all mascot-related functionality
export const MASCOT_IMAGES = {
  "men": "/men_nobg.jpg",
  "women": "/women_nobg.jpg",
  "sports": "/coolgirl_nobg.png",
  "sporty": "/gymboy_nobg.png",
  "vintage": "/vintage_nobg.png",
  "oldies": "/oldie_nobg.png",
  "formal": "/businessman_nobg.png",
  "casual": "/coolboy_nobg.png",
  "tops": "/top_nobg.png",
  "bottoms": "/jeans_nobg.png",
  "dresses": "/dress_nobg.png",
  "jackets": "/view-3d-cool-mordern-bird_nobg.png",
  "shoes": "/shoes_nobg.png",
  "accessories": "/accessories_nobg.png",
  "sets": "/sets_nobg.png",
  "general": "/cowboy_nobg.png"
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
