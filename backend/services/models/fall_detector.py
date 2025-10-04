import cv2
import mediapipe as mp
import numpy as np
import time

mp_pose = mp.solutions.pose

class FallDetector:
    def __init__(self):
        self.pose = mp_pose.Pose()
        self.last_positions = []
        self.last_fall_time = 0

    def detect_fall(self, frame: bytes):
        """
        Returns confidence or None if no fall detected.
        """
        nparr = np.fromstring(frame, np.uint8)
        img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        image_rgb = cv2.cvtColor(img_np, cv2.COLOR_BGR2RGB)
        results = self.pose.process(image_rgb)

        if not results.pose_landmarks:
            return None

        # Extract key landmarks
        lm = results.pose_landmarks.landmark
        left_shoulder = lm[mp_pose.PoseLandmark.LEFT_SHOULDER]
        left_hip = lm[mp_pose.PoseLandmark.LEFT_HIP]
        left_ankle = lm[mp_pose.PoseLandmark.LEFT_ANKLE]

        # Calculate body angle (shoulder–hip–ankle)
        dy = left_shoulder.y - left_ankle.y
        dx = left_shoulder.x - left_ankle.x
        angle = np.arctan2(dy, dx) * 180 / np.pi  # degrees
        
        print("\n\nAngle: " + angle + "\n\n")

        # Save posture history (optional)
        self.last_positions.append((time.time(), angle))
        self.last_positions = self.last_positions[-10:]  # keep last 10 frames

        # Heuristic: if body angle is near horizontal and was recently upright
        # angle ~ 90° = standing, angle ~ 0° = lying down
        if angle < 30:
            # Check if they were upright recently
            upright_recent = any(a > 60 for _, a in self.last_positions[:-2])
            if upright_recent:
                now = time.time()
                if now - self.last_fall_time > 5:  # prevent duplicate alerts
                    self.last_fall_time = now
                    return 0.9  # confidence
        return None
