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
import json

def ambiguous_detector(frame: bytes) -> list:
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
                system_prompt="""You are an AI home safety agent... (same prompt)""",
                messages=initial_messages
            ) as agent:
                result = agent("Please analyze this image.")

                try:
                    parsed = json.loads(result.message)
                    if isinstance(parsed, list):
                        return parsed
                    else:
                        return [parsed]
                except Exception:
                    return [{
                        "incident": "None",
                        "emergency_level": "None",
                        "summary": "Everything is normal.",
                        "suggestion": "No actions needed."
                    }]
    except Exception as e:
        print("SERVER CONNECTION FAILED:", e)
        return [{
            "incident": "None",
            "emergency_level": "None",
            "summary": "Unable to process image.",
            "suggestion": "Please retry or check the AI service."
        }]