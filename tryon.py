from fastapi import FastAPI, Query
from pydantic import BaseModel
import requests, os, time

app = FastAPI()

API_KEY = "530d811337d44e59b55bd17567328723_9b7da23f09654574b7cd24f63be9d4c2_andoraitools"

# ========== UTILS ==========

def prepare_upload(image_path):
    size = os.path.getsize(image_path)
    content_type = "image/jpeg" if image_path.endswith(".jpg") else "image/png"
    return {
        "uploadType": "imageUrl",
        "size": size,
        "contentType": content_type
    }

def get_upload_url(image_path):
    url = "https://api.lightxeditor.com/external/api/v2/uploadImageUrl"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    data = prepare_upload(image_path)
    response = requests.post(url, headers=headers, json=data)
    res = response.json()
    return res["body"]["uploadImage"], res["body"]["imageUrl"]

def upload_to_s3(upload_url, image_path):
    headers = {"Content-Type": "image/jpeg"}
    with open(image_path, "rb") as f:
        response = requests.put(upload_url, headers=headers, data=f)
    return response.status_code == 200

def request_tryon(person_url, cloth_url):
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

def poll_order_status(order_id):
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

# ========== API ROUTE ==========

@app.get("/tryon")
def try_on(person_image_path: str = Query(...), cloth_image_path: str = Query(...)):
    try:
        # Upload both images
        upload_url1, person_url = get_upload_url(person_image_path)
        upload_to_s3(upload_url1, person_image_path)

        upload_url2, cloth_url = get_upload_url(cloth_image_path)
        upload_to_s3(upload_url2, cloth_image_path)

        # Request try-on
        order_id = request_tryon(person_url, cloth_url)

        # Poll result
        result_url = poll_order_status(order_id)

        return {"status": "success", "result_url": result_url}

    except Exception as e:
        return {"status": "error", "message": str(e)}
