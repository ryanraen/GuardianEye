import os
from strands import Agent
from strands.models.gemini import GeminiModel
from strands.tools.mcp import MCPClient
from mcp.client.stdio import stdio_client, StdioServerParameters
from dotenv import load_dotenv
import tempfile
from PIL import Image

def ambiguous_detector(frame: bytes) -> list:
    
    GEMINI_MODEL = 'gemini-2.5-flash'
    
    print("Connecting to server...")
    mcp_client = MCPClient(lambda: stdio_client(StdioServerParameters(
        command="python",
        args=["mcpserver.py"]
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
            agent = Agent(
                model=model,
                system_prompt="""
                You are an AI home safety agent. 
                You received the following vision data with context.
                Based on what you see, describe if this looks like a risk or normal behavior and indicate the level of emergency as either high, medium, or low.
                Respond concisely and suggest one next step.
                Return output as a list of JSONs like:
                [
                    {"incident": "water spill",
                     "emergency_level": "low",
                     "summary": "Water was spilled in bathroom - potential slipping hazard.",
                     "suggestion": "Clean up the spill immediately to avoid injuries."},
                     
                     {"...": "...",
                     ...},
                     
                     ...
                ]
                """,
                )
            result = agent(frame)
            return result.message
                
    except Exception as e:
        print("SERVER CONNECTION FAILED: " + str(e.with_traceback(None)))
        