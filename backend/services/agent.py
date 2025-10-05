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
            
            agent = Agent(
                model=model,
                system_prompt="""
                You are an AI home safety agent.
                You receive visual context data describing a scene.
                Your task is to identify any safety-related incidents and rate the level of emergency.

                Follow these rules strictly:

                1. Return ONLY a valid JSON array of Python-style dictionaries.
                2. Each dictionary must contain exactly these keys:
                - "incident": string
                - "emergency_level": string ("high", "medium", "low", or "None")
                - "summary": string
                - "suggestion": string
                3. Do NOT include explanations, markdown formatting, or any text outside the JSON array.
                4. If there are no incidents, return exactly this:
                [
                    {
                    "incident": "None",
                    "emergency_level": "None",
                    "summary": "Everything is normal.",
                    "suggestion": "No actions needed."
                    }
                ]

                Example format:
                [{"incident": "Water spill",
                  "emergency_level": "low",
                  "summary": "Water was spilled in the bathroom, creating a slipping hazard.",
                  "suggestion": "Clean up the spill immediately to prevent accidents."},
                 {"incident": "Smoke detected",
                  "emergency_level": "high",
                  "summary": "Smoke observed near the kitchen area, possible fire hazard.",
                  "suggestion": "Evacuate and call emergency services immediately."}]

                Note: DO NOT INCLUDE "\\n" or any whitespace
                """,
                messages=initial_messages
                )
            result = agent("Please analyze this image.")
            print("MESSAGE: \n" + str(result.message["content"][0].get("text")))
            return result.message.get("content")[0].get("text")
                
    except Exception as e:
        print("SERVER CONNECTION FAILED: " + str(e.with_traceback(None)))
        