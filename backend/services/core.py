from services.models.fall_detector import FallDetector
from services.models.fire_detector import detect_fire_and_smoke
from services.agent import ambiguous_detector
from util.helpers import fall_detector
from google import genai
import os
from dotenv import load_dotenv
import json

GEMINI_MODEL = 'gemini-2.5-flash'
PROMPT = f"""
    You are an AI home safety agent. 
    You received the following vision data with context.
    Based on what you see, describe if this looks like a risk or normal behavior.
    Respond concisely and suggest one next step.
    """
    
load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

<<<<<<< HEAD
def process_image(frame: str, context: dict) -> str:
=======
def process_image(frame: str, context) -> list:
>>>>>>> refs/remotes/origin/main
    """
    Main app orchestration pipeline
    frame: base64 image of a captured frame from camera feed
    context: dict of e.g., {'room': 'kitchen', 'timestamp': ...}
    """
    results = []

    # run specialized detectors
    fall_detected = fall_detector.detect_fall(frame)
<<<<<<< HEAD
 
=======

    if fire_detected:
        results.append({"incident": "Fire",
                        "emergency_level": "high",
                        "summary": f"An active fire with visible flames and smoke is occurring in {context["room"]}.",
                        "suggestion": "Immediately evacuate all occupants, then call emergency services (911/fire department)."})
        
>>>>>>> refs/remotes/origin/main
    if fall_detected:
        results.append({"incident": "Person Fallen",
                        "emergency_level": "high",
                        "summary": f"A person has fallen in {context["room"]}.",
                        "suggestion": "Immediately check on the person and call for emergency services if they are unresponsive or in distress."})
    
    # use LLM to detect ambiguous cases
    if not fall_detected:
        response = ambiguous_detector(frame)
        results.extend(response)
    
    return json.dumps(results)