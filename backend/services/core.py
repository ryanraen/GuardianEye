
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

def process_image(frame: base64, context: dict) -> list[str]:
    """
    Main app orchestration pipeline
    frame: base64 image of a captured frame from camera feed
    context: dict of e.g., {'room': 'kitchen', 'timestamp': ...}
    """
    results = []
    
    # ambiguous incident case
    response = client.models.generate_content(
    model=GEMINI_MODEL,
    contents=[
        types.Part.from_bytes(
        data=frame,
        mime_type='image/png',
        ),
        PROMPT,
        ]
    )
    results.append(response.text)
    return results