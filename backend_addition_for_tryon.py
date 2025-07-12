# ADD THIS TO YOUR EXISTING tryon.py FastAPI CODE:

from fastapi import FastAPI, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

# Add this after your existing FastAPI initialization
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory if it doesn't exist
TEMP_DIR = "temp_images"
os.makedirs(TEMP_DIR, exist_ok=True)

# ADD THIS NEW ENDPOINT for uploading images:
@app.post("/upload-images")
async def upload_images(
    user_image: UploadFile = File(...),
    cloth_image: UploadFile = File(...)
):
    try:
        # Save user image
        user_image_path = os.path.join(TEMP_DIR, f"user_{user_image.filename}")
        with open(user_image_path, "wb") as buffer:
            shutil.copyfileobj(user_image.file, buffer)
        
        # Save cloth image
        cloth_image_path = os.path.join(TEMP_DIR, f"cloth_{cloth_image.filename}")
        with open(cloth_image_path, "wb") as buffer:
            shutil.copyfileobj(cloth_image.file, buffer)
        
        return {
            "status": "success",
            "user_image_path": user_image_path,
            "cloth_image_path": cloth_image_path
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Your existing tryon endpoint stays the same