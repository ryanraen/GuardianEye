import os
import tempfile
from mcp.server import FastMCP
from dotenv import load_dotenv
import json
from PIL import Image
from google import genai
from google.genai.types import (
    HttpOptions,
)
import base64
import cv2

mcp = FastMCP(name="MCP Server",
              stateless_http=False)

mcp.run(transport="stdio")