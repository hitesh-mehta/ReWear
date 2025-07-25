from fastapi import FastAPI, Query, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests, os, time, uuid
from pathlib import Path

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = "put-your-api-key-here"

TEMP_DIR = "temp_images"
os.makedirs(TEMP_DIR, exist_ok=True)

# ========== UTILS ==========

def prepare_upload(image_path: str):
    size = os.path.getsize(image_path)
    content_type = "image/jpeg" if image_path.endswith(".jpg") else "image/png"
    return {
        "uploadType": "imageUrl",
        "size": size,
        "contentType": content_type
    }

def get_upload_url(image_path: str):
    url = "https://api.lightxeditor.com/external/api/v2/uploadImageUrl"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    data = prepare_upload(image_path)
    response = requests.post(url, headers=headers, json=data)
    res = response.json()
    return res["body"]["uploadImage"], res["body"]["imageUrl"]

def upload_to_s3(upload_url: str, image_path: str):
    headers = {"Content-Type": "image/jpeg"}
    with open(image_path, "rb") as f:
        response = requests.put(upload_url, headers=headers, data=f)
    return response.status_code == 200

def request_tryon(person_url: str, cloth_url: str):
    url = "https://api.lightxeditor.com/external/api/v2/aivirtualtryon"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    data = {
        "imageUrl": person_url,
        "styleImageUrl": cloth_url
    }
    response = requests.post(url, headers=headers, json=data)
    return response.json()["body"]["orderId"]

def poll_order_status(order_id: str):
    url = "https://api.lightxeditor.com/external/api/v2/order-status"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    payload = {"orderId": order_id}

    for _ in range(5):
        response = requests.post(url, headers=headers, json=payload)
        res = response.json()
        status = res["body"]["status"]

        if status == "active":
            return res["body"]["output"]
        elif status == "failed":
            raise Exception("❌ Failed to process image.")
        time.sleep(3)

    raise TimeoutError("❌ Timed out waiting for result.")

# ========== API ROUTES ==========

@app.post("/upload-temp-file")
async def upload_temp_file(file: UploadFile = File(...)):
    try:
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(TEMP_DIR, unique_filename)

        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        return {
            "status": "success",
            "file_path": file_path,
            "message": "File uploaded successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@app.get("/tryon")
def try_on(
    person_image_path: str = Query(...),
    cloth_image_path: str = Query(...)
):
    try:
        if person_image_path.startswith("http"):
            person_url = person_image_path
        else:
            upload_url1, person_url = get_upload_url(person_image_path)
            upload_to_s3(upload_url1, person_image_path)

        if cloth_image_path.startswith("http"):
            cloth_url = cloth_image_path
        else:
            upload_url2, cloth_url = get_upload_url(cloth_image_path)
            upload_to_s3(upload_url2, cloth_image_path)

        order_id = request_tryon(person_url, cloth_url)
        result_url = poll_order_status(order_id)

        return {"status": "success", "result_url": result_url}

    except Exception as e:
        return {"status": "error", "message": str(e)}
