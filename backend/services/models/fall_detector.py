import cv2
import mediapipe as mp
import base64

mp_pose = mp.solutions.pose

def detect_fall(frame: base64):
    with mp_pose.Pose(static_image_mode = True) as pose:
        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)
        if not results.pose_landmarks:
            return None
        