
from fastapi import FastAPI, File, UploadFile, HTTPException
import os
import uuid
from pathlib import Path

# Add this to your existing FastAPI app

@app.post("/upload-temp-file")
async def upload_temp_file(file: UploadFile = File(...)):
    try:
        # Create temp directory if it doesn't exist
        temp_dir = Path("temp_images")
        temp_dir.mkdir(exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = temp_dir / unique_filename
        
        # Save file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        return {
            "status": "success",
            "file_path": str(file_path),
            "message": "File uploaded successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
