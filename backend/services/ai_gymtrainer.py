import mediapipe as mp
import cv2
import numpy as np
import matplotlib.pyplot as plt
import time
import asyncio
from datetime import datetime
import json
from typing import Dict, List, Any, Optional

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose


def calc_angle(x, y, z):
    """Calculate angle between three points."""
    x = np.array(x)
    y = np.array(y)
    z = np.array(z)
    radians = np.arctan2(z[1] - y[1], z[0] - y[0]) - np.arctan2(x[1] - y[1], x[0] - y[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle


class GymTrainerService:
    def __init__(self):
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_pose = mp.solutions.pose
        self.reset_variables()

    def reset_variables(self):
        """Reset all tracking variables."""
        self.exercise_counters = [0, 0, 0, 0, 0, 0]
        self.state = "Up"
        self.feedback = ""
        self.range_flag = True
        self.halfway = False
        self.left_angle = []
        self.right_angle = []
        self.body_angles = []
        self.frames = []
        self.frame_count = 0

    def recognise_squat(self, detection):
        """Recognize squat exercise."""
        try:
            landmarks = detection.pose_landmarks.landmark
            left_hip = [landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].x,
                        landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].y]
            left_knee = [landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                         landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].y]
            left_heel = [landmarks[self.mp_pose.PoseLandmark.LEFT_HEEL.value].x,
                         landmarks[self.mp_pose.PoseLandmark.LEFT_HEEL.value].y]
            right_hip = [landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP.value].x,
                         landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP.value].y]
            right_knee = [landmarks[self.mp_pose.PoseLandmark.RIGHT_KNEE.value].x,
                          landmarks[self.mp_pose.PoseLandmark.RIGHT_KNEE.value].y]
            right_heel = [landmarks[self.mp_pose.PoseLandmark.RIGHT_HEEL.value].x,
                          landmarks[self.mp_pose.PoseLandmark.RIGHT_HEEL.value].y]
            left_shoulder = [landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                             landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            right_shoulder = [landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                              landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
            left = calc_angle(left_hip, left_knee, left_heel)
            right = calc_angle(right_hip, right_knee, right_heel)
            self.left_angle.append(int(left))
            self.right_angle.append(int(right))
            shoulder_dist = left_shoulder[0] - right_shoulder[0]
            knee_dist = left_knee[0] - right_knee[0]
            if shoulder_dist - knee_dist > 0.04:
                self.feedback = 'Open up your knees further apart to shoulder width!'
            else:
                self.feedback = ''
            if left > 170 and right > 170:
                self.state = "Up"
            if left < 165 and right < 165:
                self.feedback = 'Almost there... lower until height of hips!'
            if left < 140 and right < 140 and self.state == "Up":
                self.state = "Down"
                self.exercise_counters[1] += 1
            if self.state == "Down":
                self.feedback = 'Good rep!'
        except:
            self.left_angle.append(180)
            self.right_angle.append(180)

    def recognise_curl(self, detection):
        """Recognize arm curl exercise."""
        try:
            landmarks = detection.pose_landmarks.landmark
            left_wrist = [landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                          landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].y]
            left_shoulder = [landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                             landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            left_elbow = [landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                          landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
            right_wrist = [landmarks[self.mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                           landmarks[self.mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
            right_shoulder = [landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                              landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
            right_elbow = [landmarks[self.mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                           landmarks[self.mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
            left_elbow_angle = calc_angle(left_shoulder, left_elbow, left_wrist)
            right_elbow_angle = calc_angle(right_shoulder, right_elbow, right_wrist)
            self.left_angle.append(int(left_elbow_angle))
            self.right_angle.append(int(right_elbow_angle))
            if left_elbow_angle > 160 and right_elbow_angle > 160:
                if not self.range_flag:
                    self.feedback = 'Did not curl completely.'
                else:
                    self.feedback = 'Good rep!'
                self.state = 'Down'
            elif (left_elbow_angle > 50 and right_elbow_angle > 50) and self.state == 'Down':
                self.range_flag = False
                self.feedback = ''
            elif (left_elbow_angle < 30 and right_elbow_angle < 30) and self.state == 'Down':
                self.state = 'Up'
                self.feedback = ''
                self.range_flag = True
                self.exercise_counters[2] += 1
        except:
            self.left_angle.append(180)
            self.right_angle.append(180)

    def recognise_situp(self, detection):
        """Recognize sit-up exercise."""
        try:
            landmarks = detection.pose_landmarks.landmark
            left_hip = [landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].x,
                        landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].y]
            left_knee = [landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                         landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].y]
            left_heel = [landmarks[self.mp_pose.PoseLandmark.LEFT_HEEL.value].x,
                         landmarks[self.mp_pose.PoseLandmark.LEFT_HEEL.value].y]
            left_shoulder = [landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                             landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            angle_knee = calc_angle(left_hip, left_knee, left_heel)
            angle_body = calc_angle(left_shoulder, left_hip, left_knee)
            self.body_angles.append(int(angle_body))
            if (angle_body < 80 and angle_body > 50) and self.state == "Down":
                self.halfway = True
            if angle_body < 40 and self.state == "Down":
                self.state = "Up"
                self.range_flag = True
            if angle_body > 90 and angle_knee < 60:
                self.state = "Down"
                if self.halfway:
                    if self.range_flag:
                        self.exercise_counters[3] += 1
                        self.feedback = "Good repetition!"
                    else:
                        self.feedback = "Did not perform sit up completely."
                    self.range_flag = False
                    self.halfway = False
            if angle_knee > 70:
                self.feedback = "Keep legs tucked in closer"
        except:
            self.body_angles.append(180)

    def recognise_lunge(self, detection):
        """Recognize lunge exercise."""
        try:
            landmarks = detection.pose_landmarks.landmark
            left_hip = [landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].x,
                        landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].y]
            left_knee = [landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                         landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].y]
            left_ankle = [landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                          landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
            right_hip = [landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP.value].x,
                         landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP.value].y]
            right_knee = [landmarks[self.mp_pose.PoseLandmark.RIGHT_KNEE.value].x,
                          landmarks[self.mp_pose.PoseLandmark.RIGHT_KNEE.value].y]
            right_ankle = [landmarks[self.mp_pose.PoseLandmark.RIGHT_ANKLE.value].x,
                           landmarks[self.mp_pose.PoseLandmark.RIGHT_ANKLE.value].y]

            left_lunge_angle = calc_angle(left_hip, left_knee, left_ankle)
            right_lunge_angle = calc_angle(right_hip, right_knee, right_ankle)

            self.left_angle.append(int(left_lunge_angle))
            self.right_angle.append(int(right_lunge_angle))

            if left_lunge_angle > 160 and right_lunge_angle > 160:
                self.state = "Up"
                self.feedback = ''

            if (left_lunge_angle < 100 and right_lunge_angle < 100) and self.state == "Up":
                self.state = "Down"
                self.exercise_counters[4] += 1
                self.feedback = "Good lunge!"
        except:
            self.left_angle.append(180)
            self.right_angle.append(180)

    def recognise_pushup(self, detection):
        """Recognize push-up exercise."""
        try:
            landmarks = detection.pose_landmarks.landmark
            left_shoulder = [landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                             landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            left_elbow = [landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                          landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
            left_wrist = [landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                          landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].y]
            right_shoulder = [landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                              landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
            right_elbow = [landmarks[self.mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                           landmarks[self.mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
            right_wrist = [landmarks[self.mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                           landmarks[self.mp_pose.PoseLandmark.RIGHT_WRIST.value].y]

            left_elbow_angle = calc_angle(left_shoulder, left_elbow, left_wrist)
            right_elbow_angle = calc_angle(right_shoulder, right_elbow, right_wrist)

            self.left_angle.append(int(left_elbow_angle))
            self.right_angle.append(int(right_elbow_angle))

            if left_elbow_angle > 160 and right_elbow_angle > 160:
                self.state = "Up"
                self.feedback = ''

            if (left_elbow_angle < 90 and right_elbow_angle < 90) and self.state == "Up":
                self.state = "Down"
                self.exercise_counters[5] += 1
                self.feedback = "Good pushup!"
        except:
            self.left_angle.append(180)
            self.right_angle.append(180)

    def get_performance_summary(self, exercise_choice=None):
        """Generate a performance summary."""
        exercise_labels = ['', 'Squats', 'Arm Curls', 'Sit-ups', 'Lunges', 'Pushups']
        total_reps = sum(self.exercise_counters[1:])

        # Build summary data
        summary = {
            "total_reps": total_reps,
            "exercise_counts": {
                exercise_labels[i]: self.exercise_counters[i] for i in range(1, 6)
            },
            "timestamp": datetime.now().isoformat()
        }

        # Add performance evaluation
        if total_reps == 0:
            summary["overall_feedback"] = "No exercises completed. Keep trying!"
        elif total_reps < 10:
            summary["overall_feedback"] = "Good start! Keep practicing."
        elif total_reps < 20:
            summary["overall_feedback"] = "Nice work! You're making progress."
        elif total_reps < 30:
            summary["overall_feedback"] = "Great job! You're getting stronger."
        else:
            summary["overall_feedback"] = "Excellent performance! You're a fitness champion!"

        # Add muscle groups worked
        muscle_groups = {
            1: ["Quadriceps", "Glutes", "Hamstrings"],
            2: ["Biceps", "Forearms"],
            3: ["Core", "Abdominal Muscles"],
            4: ["Quadriceps", "Glutes", "Calves"],
            5: ["Chest", "Triceps", "Core"]
        }

        worked_muscles = set()
        for i in range(1, 6):
            if self.exercise_counters[i] > 0:
                worked_muscles.update(muscle_groups[i])

        summary["muscles_worked"] = list(worked_muscles)

        # Add exercise-specific data if requested
        if exercise_choice and 1 <= exercise_choice <= 5:
            if exercise_choice in [1, 2, 4, 5]:
                summary["angle_data"] = {
                    "left": self.left_angle,
                    "right": self.right_angle,
                    "frames": self.frames
                }
            elif exercise_choice == 3:  # Sit-up
                summary["angle_data"] = {
                    "body": self.body_angles,
                    "frames": self.frames
                }

        return summary

    async def process_frame(self, frame_bytes, user_id, exercise_choice):
        """Process a single frame and return exercise recognition results."""
        # Convert bytes to numpy array
        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Perform pose detection
        with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
            # Convert frame to RGB for MediaPipe
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False

            # Pose detection
            results = pose.process(image)

            # Process landmarks if detected
            if results.pose_landmarks:
                # Call the appropriate exercise recognition function
                if exercise_choice == 1:
                    self.recognise_squat(results)
                elif exercise_choice == 2:
                    self.recognise_curl(results)
                elif exercise_choice == 3:
                    self.recognise_situp(results)
                elif exercise_choice == 4:
                    self.recognise_lunge(results)
                elif exercise_choice == 5:
                    self.recognise_pushup(results)

                self.frames.append(self.frame_count)
                self.frame_count += 1

            # Prepare response
            response = {
                "exercise_type": ['', 'Squat', 'Curl', 'Sit-up', 'Lunge', 'Pushup'][exercise_choice],
                "reps": self.exercise_counters[exercise_choice],
                "feedback": self.feedback,
                "state": self.state
            }

            return response

    async def save_exercise_data(self, user_id, db):
        """Save the current exercise session data to the database."""
        from database.mongodb import save_exercise_data

        for i in range(1, 6):
            if self.exercise_counters[i] > 0:
                exercise_data = {
                    "timestamp": datetime.now().isoformat(),
                    "exercise_type": ['', 'Squat', 'Curl', 'Sit-up', 'Lunge', 'Pushup'][i],
                    "reps": self.exercise_counters[i],
                    "accuracy": 95,  # Placeholder for actual accuracy calculation
                    "feedback": "Session completed successfully"
                }
                await save_exercise_data(user_id, exercise_data)

        # Return summary
        return self.get_performance_summary()


# Create a singleton instance
gym_trainer_service = GymTrainerService()