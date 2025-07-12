
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { itemsAPI, type Item } from '@/lib/localStorage';
import { 
  Camera, 
  Upload, 
  RotateCcw, 
  Download, 
  Share2,
  Sparkles,
  Shirt,
  User,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

const VirtualTryOn = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState<Item | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (itemId) {
      const foundItem = itemsAPI.getById(itemId);
      setItem(foundItem);
    }
  }, [itemId]);

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 480 }, 
          height: { ideal: 640 },
          facingMode: 'user' 
        } 
      });
      
      setCameraStream(stream);
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });
        videoRef.current.play();
        
        toast({
          title: "Camera Started",
          description: "Position yourself in the frame and click capture when ready",
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error", 
        description: "Unable to access camera. Please check permissions and try again.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip the image horizontally for selfie effect
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0);
        ctx.scale(-1, 1);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setUserImage(imageData);
        stopCamera();
        
        toast({
          title: "Photo Captured!",
          description: "Ready for virtual try-on",
        });
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target?.result as string);
        toast({
          title: "Image Uploaded!",
          description: "Ready for virtual try-on",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const dataURLToBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const uploadImageToBackend = async (imageBlob: Blob, filename: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', imageBlob, filename);
    
    const response = await fetch('http://localhost:8000/upload-temp-file', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    const result = await response.json();
    if (result.status === 'success') {
      return result.file_path;
    } else {
      throw new Error(result.message || 'Upload failed');
    }
  };

  const processVirtualTryOn = async () => {
    if (!userImage || !item) {
      toast({
        title: "Missing Images",
        description: "Please capture or upload your photo first",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Convert user image to blob and upload
      const userImageBlob = dataURLToBlob(userImage);
      const userImagePath = await uploadImageToBackend(userImageBlob, 'user-image.jpg');
      
      // Get cloth image - use the first image from the item
      const clothImageUrl = item.images[0];
      
      console.log('Calling virtual try-on API with:', { userImagePath, clothImageUrl });
      
      // Check if cloth image is a URL or local path
      let clothImagePath = clothImageUrl;
      
      // If it's a URL (starts with http), we'll pass it directly to the backend
      // If it's a local path, we need to upload it first
      if (clothImageUrl && !clothImageUrl.startsWith('http')) {
        // It's a local path, need to upload it
        const clothResponse = await fetch(clothImageUrl);
        const clothBlob = await clothResponse.blob();
        clothImagePath = await uploadImageToBackend(clothBlob, 'cloth-image.jpg');
      }
      
      // Call your FastAPI backend
      const response = await fetch(
        `http://localhost:8000/tryon?person_image_path=${encodeURIComponent(userImagePath)}&cloth_image_path=${encodeURIComponent(clothImagePath)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Try-on API response:', result);
      
      if (result.status === 'success') {
        setTryOnResult(result.result_url);
        toast({
          title: "Virtual Try-On Complete!",
          description: "See how the item looks on you",
        });
      } else {
        throw new Error(result.message || 'Try-on failed');
      }
    } catch (error) {
      console.error('Virtual try-on error:', error);
      toast({
        title: "Try-On Failed",
        description: `Failed to process virtual try-on: ${error.message}. Make sure your backend is running on localhost:8000.`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetTryOn = () => {
    setUserImage(null);
    setTryOnResult(null);
    setIsProcessing(false);
    stopCamera();
  };

  const downloadResult = () => {
    if (tryOnResult) {
      const link = document.createElement('a');
      link.download = `virtual-tryon-${item?.title || 'result'}.jpg`;
      link.href = tryOnResult;
      link.click();
      
      toast({
        title: "Downloaded!",
        description: "Virtual try-on result saved to your device",
      });
    }
  };

  const shareResult = async () => {
    if (tryOnResult && navigator.share) {
      try {
        await navigator.share({
          title: `Virtual Try-On: ${item?.title}`,
          text: 'Check out how this looks on me with ReWear\'s Virtual Try-On!',
          url: tryOnResult
        });
      } catch (error) {
        navigator.clipboard.writeText(tryOnResult);
        toast({
          title: "Link Copied!",
          description: "Virtual try-on result link copied to clipboard",
        });
      }
    } else if (tryOnResult) {
      navigator.clipboard.writeText(tryOnResult);
      toast({
        title: "Link Copied!",
        description: "Virtual try-on result link copied to clipboard",
      });
    }
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p>Item not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-3xl font-bold">Virtual Try-On</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Item Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="w-5 h-5" />
                Item Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={item.images[0] || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{item.description}</p>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{item.category}</Badge>
                  <Badge variant="outline">Size: {item.size}</Badge>
                  <Badge variant="outline">{item.condition}</Badge>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Brand: {item.brand || 'Not specified'}</p>
                  <p>Owner: {item.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Virtual Try-On Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Virtual Try-On
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!userImage && !cameraActive && (
                <div className="text-center space-y-4">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Take a photo or upload an image to start
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={startCamera} className="w-full">
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {cameraActive && (
                <div className="space-y-4">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={capturePhoto} className="flex-1">
                      <Camera className="w-4 h-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {userImage && !tryOnResult && !isProcessing && (
                <div className="space-y-4">
                  <div className="aspect-square overflow-hidden rounded-lg">
                    <img
                      src={userImage}
                      alt="User photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={processVirtualTryOn} className="flex-1">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Try On Item
                    </Button>
                    <Button variant="outline" onClick={resetTryOn}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <RefreshCw className="w-16 h-16 mx-auto text-purple-600 animate-spin mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Processing virtual try-on...
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        This may take up to 15 seconds
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {tryOnResult && (
                <div className="space-y-4">
                  <div className="aspect-square overflow-hidden rounded-lg relative">
                    <img
                      src={tryOnResult}
                      alt="Virtual try-on result"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-white/90 text-gray-800">
                        Virtual Try-On Result
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={downloadResult}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={shareResult}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={resetTryOn}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      How does it look?
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" onClick={() => navigate(`/item/${item.id}`)}>
                        Request to Swap
                      </Button>
                      <Button size="sm" variant="outline">
                        Save to Wishlist
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Tips Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Photo Guidelines:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Stand in good lighting</li>
                  <li>• Face the camera directly</li>
                  <li>• Keep your arms at your sides</li>
                  <li>• Wear form-fitting clothes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Best Practices:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Use a plain background</li>
                  <li>• Take a full-body shot</li>
                  <li>• Avoid shadows and reflections</li>
                  <li>• Ensure good image quality</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VirtualTryOn;
