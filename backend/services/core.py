from google import genai
from google.genai import types
import base64

GEMINI_MODEL = 'gemini-2.5-flash'
try:
    client = genai.Client()
except Exception as e:
    print(e)

def process_image(frame: base64, context: dict) -> list[str]:
    """
    Main app orchestration pipeline
    frame: base64 image of a captured frame from camera feed
    context: dict of e.g., {'room': 'kitchen', 'timestamp': ...}
    """
    
    response = []
    
    # ambiguous incident case
    response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=[
        types.Part.from_bytes(
        data=frame,
        mime_type='image/jpeg',
        ),
        "placeholder LM call",
        ]
    )