import cv2
import mediapipe as mp
import numpy as np
import time

mp_pose = mp.solutions.pose
FALLEN_THRESHOLD = 40


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
        right_shoulder = lm[mp_pose.PoseLandmark.RIGHT_SHOULDER]
        left_ankle = lm[mp_pose.PoseLandmark.LEFT_ANKLE]
        right_ankle = lm[mp_pose.PoseLandmark.RIGHT_ANKLE]

        # Calculate body angle (shoulder–ankle)
        dy_left = left_shoulder.y - left_ankle.y
        dy_right = right_shoulder.y - right_ankle.y
        dx_left = left_shoulder.x - left_ankle.x
        dx_right = right_shoulder.x - right_ankle.x
        angle = min(np.arctan2(abs(dy_left), abs(dx_left)), np.arctan2(abs(dy_right), abs(dx_right))) * 180 / np.pi  # POSITIVE degrees
        
        print("\n\nAngle: " + str(angle) + "\n\n")

        # Save posture history (optional)
        self.last_positions.append((time.time(), angle))
        self.last_positions = self.last_positions[-10:]  # keep last 10 frames

        # Heuristic: if body angle is near horizontal and was recently upright
        # angle ~ 90° = standing, angle ~ 0° = lying down
        if angle < FALLEN_THRESHOLD:
            # Check if they were upright recently
            upright_recent = any(a > 60 for _, a in self.last_positions[-3: -1])
            for _, i in self.last_positions[:-2]:
                print(str(i))
            if upright_recent:
                now = time.time()
                if now - self.last_fall_time > 5:  # prevent duplicate alerts
                    self.last_fall_time = now
                return True
        return False
