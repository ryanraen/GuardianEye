from backend.services.models.fall_detector import detect_fall
from backend.services.models.fire_detector import detect_fire_and_smoke
import models

import base64
from google import genai
from google.genai import types
import base64
import os
from dotenv import load_dotenv

GEMINI_MODEL = 'gemini-2.5-flash'
PROMPT = f"""
    You are an AI home safety agent. 
    You received the following vision data with context.
    Based on what you see, describe if this looks like a risk or normal behavior.
    Respond concisely and suggest one next step.
    """
    
load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def process_image(frame: str, context: dict) -> list:
    """
    Main app orchestration pipeline
    frame: base64 image of a captured frame from camera feed
    context: dict of e.g., {'room': 'kitchen', 'timestamp': ...}
    """
    results = []
    
    # Convert base64 string to bytes for processing
    frame_bytes = base64.b64decode(frame)
    
    fall_detection = detect_fall(frame_bytes)
    if fall_detection:
        fall_analysis = get_llm_analysis(frame, "fall")
        results.append({
            "incident": "fall",
            "emergency level": "high",
            "summary": fall_analysis
        })
    fire_and_smoke_detection = detect_fire_and_smoke(frame_bytes)
    if len(fire_and_smoke_detection) > 0:
        fire_analysis = get_llm_analysis(frame, "fire")
        results.append({
            "incident": "fire/smoke",
            "emergency level": "high",
            "summary": fire_analysis
        })
    if not(fall_detection) and len(fire_and_smoke_detection) == 0:
        llm_analysis = get_llm_analysis(frame)
        results.append(llm_analysis)
        
    return results

def get_llm_analysis(frame: str, incident_type: str = "general"):
    
    # ambiguous incident case
    response = client.models.generate_content(
    model=GEMINI_MODEL,
    contents=[
        types.Part.from_bytes(
        data=base64.b64decode(frame),
        mime_type='image/png',
        ),
        PROMPT,
        ]
    )
    return response.text