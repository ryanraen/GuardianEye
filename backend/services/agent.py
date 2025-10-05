import os
from strands import Agent
from strands.models.gemini import GeminiModel
from strands.tools.mcp import MCPClient
from mcp.client.stdio import stdio_client, StdioServerParameters
from dotenv import load_dotenv
import tempfile
from PIL import Image
import base64
from google.genai import types

def ambiguous_detector(frame: bytes) -> dict:
    
    GEMINI_MODEL = 'gemini-2.5-flash'
    
    print("Connecting to server...")
    mcp_client = MCPClient(lambda: stdio_client(StdioServerParameters(
        command="python",
        args=["services/mcpserver.py"]
    )))

    print("Setting up Gemini model...")
    load_dotenv()
    model = GeminiModel(
        client_args={
            "api_key": os.environ.get("GEMINI_API_KEY")
            },
        model_id=GEMINI_MODEL
    )

    try:
        with mcp_client:
            initial_messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "image": {
                                "format": "png",
                                "source": {
                                    "bytes": frame
                                }
                            }
                        }
                    ] 
                }
            ]
            
            with Agent(
                model=model,
                system_prompt="""
                You are an AI home safety agent. 
                You received the following vision data with context.
                Based on what you see, describe if this looks like a risk or normal behavior and indicate the level of emergency as either high, medium, or low.
                Respond concisely and suggest one next step.
                Return only a list of dict:
                [
                    {"incident": "Water spill",
                     "emergency_level": "low",
                     "summary": "Water was spilled in bathroom - potential slipping hazard.",
                     "suggestion": "Clean up the spill immediately to avoid injuries."},
                     {"...": "...",
                     ...},
                     ...
                ]
                
                Note: if there is no incident and behavior is normal, incident should be "None", emergency_level should be "None", summary should be "Everything is normal.", and suggestions should be "No actions needed."
                """,
                messages=initial_messages
                ) as agent:
                result = agent("Please analyze this image.")
                return str(result.message)
                
    except Exception as e:
        print("SERVER CONNECTION FAILED: " + str(e.with_traceback(None)))
        