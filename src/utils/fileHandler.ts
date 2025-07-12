
// File handling utilities for virtual try-on
export const saveImageToFileSystem = async (file: File, filename: string): Promise<string> => {
  return await uploadImageFile(file, filename);
};

export const uploadImageFile = async (file: File, filename: string): Promise<string> => {
  try {
    // Create FormData to send file to backend
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload to your FastAPI backend
    const response = await fetch('http://localhost:8000/upload-temp-file', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.status === 'success') {
      return result.file_path;
    } else {
      throw new Error(result.message || 'Upload failed');
    }
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
