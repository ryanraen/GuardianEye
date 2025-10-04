from google import genai
from google.genai import types

GEMINI_MODEL = 'gemini-2.5-flash'
try:
    client = genai.Client()
except Exception as e:
    print(e)

def process_image(image_bytes: base64):
    response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=[
        types.Part.from_bytes(
        data=image_bytes,
        mime_type='image/jpeg',
        ),
        "placeholder LM call",
        ]
    )