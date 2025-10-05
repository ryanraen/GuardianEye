from typing import Union, List
from pydantic import BaseModel
from datetime import datetime

import cv2
import uvicorn
import numpy as np
import base64
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.core import process_image
from services.models.fire_detector import detect_fire_and_smoke

class DetectionRequest(BaseModel):
    base64_image: str
    location: str
    time: datetime

class DetectionResponse(BaseModel):
    detections: List[dict]

class Camera(BaseModel):
    id: str
    location: str
    status: str
    lastUpdate: str

class Event(BaseModel):
    id: str
    type: str
    severity: str
    timestamp: str
    location: str
    description: str
    cameraId: str

app = FastAPI(
    title="GuardianEye API",
    description="AI-powered home safety monitoring system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.post("/detection/process", response_model=DetectionResponse)
def process(request: DetectionRequest):
    try:
        # Create context for the process_image function
        context = {
            "location": request.location,
            "time": request.time
        }
        frame_bytes = base64.b64decode(request.base64_image)
        detections = process_image(frame_bytes, context)
        # in_danger = any(detection.get("emergency_level") == "high" for detection in detections if isinstance(detection, dict))
        return DetectionResponse(detections=detections)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/cameras", response_model=List[Camera])
def get_cameras():
    """Get all cameras and their status"""
    cameras = [
        {"id": "cam1", "location": "Simon Fraser Uni", "status": "active", "lastUpdate": "2025-01-27 14:30:15"},
        {"id": "cam2", "location": "Room 1", "status": "active", "lastUpdate": "2025-01-27 14:25:42"},
        {"id": "cam3", "location": "Room 2", "status": "active", "lastUpdate": "2025-01-27 14:20:33"},
        {"id": "cam4", "location": "Room 3", "status": "active", "lastUpdate": "2025-01-27 14:18:21"},
        {"id": "cam5", "location": "Room 4", "status": "offline", "lastUpdate": "2025-01-27 13:45:12"},
        {"id": "cam6", "location": "Garden", "status": "active", "lastUpdate": "2025-01-27 14:28:45"},
    ]
    return cameras

@app.get("/events", response_model=List[Event])
def get_events():
    """Get recent events"""
    events = [
        {
            "id": "1",
            "type": "fall",
            "severity": "critical",
            "timestamp": "2025-01-27 14:30:15",
            "location": "Living Room",
            "description": "Elderly resident fall detected - immediate medical attention required",
            "cameraId": "cam1"
        },
        {
            "id": "2",
            "type": "medical",
            "severity": "high",
            "timestamp": "2025-01-27 14:25:42",
            "location": "Kitchen",
            "description": "Unusual movement pattern - potential medical emergency",
            "cameraId": "cam2"
        }
    ]
    return events

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)