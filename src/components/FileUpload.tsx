
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Camera, Image } from 'lucide-react';
import { toast } from 'sonner';
import { compressImage, storeImage } from '@/lib/imageUtils';

interface FileUploadProps {
  onImagesChange: (images: string[]) => void;
  minImages?: number;
  maxImages?: number;
  existingImages?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onImagesChange, 
  minImages = 4,
  maxImages = 8, 
  existingImages = [] 
}) => {
  const [images, setImages] = useState<string[]>(existingImages);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const newImageIds: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const compressedImage = await compressImage(file, 600, 0.7);
          const imageId = storeImage(compressedImage);
          if (imageId) {
            newImageIds.push(imageId);
          }
        }
      }
      
      const updatedImages = [...images, ...newImageIds];
      setImages(updatedImages);
      onImagesChange(updatedImages);
      
      if (newImageIds.length > 0) {
        toast.success(`${newImageIds.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Failed to process images:', error);
      toast.error('Failed to process images. Please try smaller files.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const isMinimumMet = images.length >= minImages;

  return (
    <div className="space-y-4">
      <Card 
        className={`border-2 border-dashed p-8 text-center transition-colors ${
          dragOver 
            ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/20' 
            : !isMinimumMet 
            ? 'border-red-300 bg-red-50 dark:bg-red-950/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          {uploading ? 'Processing images...' : 'Drop images here or click to upload'}
        </p>
        <p className={`text-sm mb-4 ${!isMinimumMet ? 'text-red-500' : 'text-gray-500'}`}>
          {!isMinimumMet 
            ? `Required: ${minImages} images minimum (${images.length}/${minImages})`
            : `Images: ${images.length}/${maxImages}`
          }
        </p>
        
        <div className="flex gap-2 justify-center">
          <Button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Image className="w-4 h-4 mr-2" />
            {uploading ? 'Processing...' : 'Choose Files'}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="w-4 h-4 mr-2" />
            Camera
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </Card>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((imageId, index) => {
            const imageData = localStorage.getItem(`rewear-image-${imageId}`) || '';
            return (
              <div key={imageId} className="relative group">
                <img
                  src={imageData}
                  alt={`Upload ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
                <div className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                  #{index + 1}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
