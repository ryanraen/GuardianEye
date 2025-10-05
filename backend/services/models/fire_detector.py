from ultralytics import YOLO
import numpy as np
import cv2

model = YOLO("trained/best.pt") 

def detect_fire_and_smoke(frame, conf_thresh=0.4):
    """
    Detect fire and smoke in an image frame.
    Returns a list of detections, each with class name, confidence, and bounding box.
    """
    nparr = np.fromstring(frame, np.uint8)

    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Failed to decode image from bytes")

    results = model.predict(source=img, conf=conf_thresh, verbose=False)

    detections = []
    for result in results:
        for box in result.boxes:
            cls_id = int(box.cls)
            conf = float(box.conf)
            label = model.names[cls_id]
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            detections.append({
                "label": label,
                "confidence": conf,
                "bbox": [x1, y1, x2, y2]
            })
            
    return detections
