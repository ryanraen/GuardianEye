from typing import Union

import uvicorn
import numpy as np
import base64
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.post("/detection/process")
def process(base64_image: str):
    # call models/libraries on base64_image to analyze the image
    in_danger = True
    return {"danger": in_danger}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000);