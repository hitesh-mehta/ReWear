// Utility functions for image handling and compression
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const generateImageId = (): string => {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Storage management utilities
export const clearOldImages = () => {
  try {
    const keys = Object.keys(localStorage);
    const imageKeys = keys.filter(key => key.startsWith('rewear-image-'));
    
    // Keep only recent images (last 50)
    if (imageKeys.length > 50) {
      const keysToRemove = imageKeys.slice(0, imageKeys.length - 50);
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  } catch (error) {
    console.error('Failed to clear old images:', error);
  }
};

export const storeImage = (imageData: string): string => {
  try {
    const imageId = generateImageId();
    localStorage.setItem(`rewear-image-${imageId}`, imageData);
    return imageId;
  } catch (error) {
    console.error('Failed to store image:', error);
    clearOldImages();
    // Try again after clearing
    try {
      const imageId = generateImageId();
      localStorage.setItem(`rewear-image-${imageId}`, imageData);
      return imageId;
    } catch (retryError) {
      console.error('Failed to store image after cleanup:', retryError);
      return '';
    }
  }
};

export const getImage = (imageId: string): string => {
  try {
    return localStorage.getItem(`rewear-image-${imageId}`) || '';
  } catch (error) {
    console.error('Failed to get image:', error);
    return '';
  }
};
