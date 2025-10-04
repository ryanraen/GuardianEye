from typing import Union

import cv2
import uvicorn
import numpy as np
import base64
from fastapi import FastAPI
from backend.services.core import process_image
from services.models.fire_detector import detect_fire_and_smoke

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.post("/detection/process")
def process(base64_image: str):
    detections = process_image(base64_image)
    in_danger = True
    return {"detections": detections, "danger": in_danger}

    return {"detections": detections}
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000);