# ADD THIS TO YOUR EXISTING tryon.py FastAPI CODE:

from fastapi import FastAPI, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

# Add CORS middleware to your existing app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory if it doesn't exist
TEMP_DIR = "temp_images"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.post("/upload-temp-file")
async def upload_temp_file(file: UploadFile = File(...), filename: str = None):
    try:
        # Use provided filename or generate from uploaded filename
        if not filename:
            filename = file.filename
        
        # Save file to temp directory
        file_path = os.path.join(TEMP_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "status": "success",
            "file_path": file_path,
            "message": f"File saved successfully as {file_path}"
        }
    
    except Exception as e:
        return {
            "status": "error", 
            "message": str(e)
        }

# Your existing /tryon endpoint remains unchanged