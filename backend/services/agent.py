import os
from strands import Agent
from strands.models.gemini import GeminiModel
from strands.tools.mcp import MCPClient
from mcp.client.stdio import stdio_client, StdioServerParameters
from dotenv import load_dotenv

async def ambiguous_detector(frame: bytes) -> dict:
    """
    Analyze a given image frame using Gemini model and MCP server for safety risks.
    Properly closes all client sessions to avoid aiohttp warnings.
    """

    GEMINI_MODEL = 'gemini-2.5-flash'
    load_dotenv()
    print("Connecting to server...")

    # Use async context manager for proper cleanup
    async with MCPClient(lambda: stdio_client(StdioServerParameters(
        command="python",
        args=["services/mcpserver.py"]
    ))) as mcp_client:

        print("Setting up Gemini model...")
        model = GeminiModel(
            client_args={
                "api_key": os.environ.get("GEMINI_API_KEY")
            },
            model_id=GEMINI_MODEL
        )

        # Define your initial messages with the frame
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

        # Use async context for the Agent as well
        async with Agent(
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

            Note: if there is no incident and behavior is normal, 
            incident should be "None", emergency_level should be "None", 
            summary should be "Everything is normal.", 
            and suggestion should be "No actions needed."
            """,
            messages=initial_messages
        ) as agent:

            print("Analyzing image...")
            result = await agent("Please analyze this image.")
            return str(result.message)
