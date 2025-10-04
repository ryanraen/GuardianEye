# services/models/fire_detector.py
from ultralytics import YOLO
import cv2

# Load the YOLOv8 model once globally
model = YOLO("models/fire-detection-yolov8n.pt")  # or path to your custom Roboflow-trained weights

def detect_fire_and_smoke(frame, conf_thresh=0.5):
    """
    Runs YOLOv8 inference on a given frame and returns detected fire/smoke regions.
    :param frame: numpy array (BGR image from OpenCV)
    :param conf_thresh: confidence threshold
    :return: list of detections: [{'label': str, 'confidence': float, 'bbox': [x1, y1, x2, y2]}]
    """
    detections = []
    results = model.predict(source=frame, conf=conf_thresh, verbose=False)

    for result in results:
        for box in result.boxes:
            label = model.names[int(box.cls)]
            conf = float(box.conf)
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            detections.append({
                "label": label,
                "confidence": conf,
                "bbox": [x1, y1, x2, y2]
            })
    return detections
