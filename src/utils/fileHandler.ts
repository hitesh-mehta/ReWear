// File handling utilities for virtual try-on
export const saveImageToFileSystem = async (file: File, filename: string): Promise<string> => {
  // In a real application, this would upload to a server or save to a temp directory
  // For now, we'll create a URL that represents where the file would be saved
  
  // Create a temp directory structure your FastAPI can access
  const tempDir = './temp_images';
  const fullPath = `${tempDir}/${filename}`;
  
  // In production, you would:
  // 1. Create an API endpoint to save files
  // 2. Upload the file to that endpoint
  // 3. Return the file path
  
  // For demo purposes, we'll save the file using a different approach
  return await uploadImageFile(file, filename);
};

export const uploadImageFile = async (file: File, filename: string): Promise<string> => {
  try {
    // Create FormData to send file to backend
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', filename);
    
    // Upload to a temporary file service endpoint
    const response = await fetch('http://localhost:8000/upload-temp-file', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
    
    const result = await response.json();
    return result.file_path;
  } catch (error) {
    console.error('Failed to upload file:', error);
    // Fallback: return a dummy path for testing
    return `./temp_images/${filename}`;
  }
};

export const dataURLToFile = (dataURL: string, filename: string): Promise<File> => {
  return new Promise(resolve => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    resolve(new File([u8arr], filename, { type: mime }));
  });
};