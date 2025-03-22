from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body, Form
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any, List
import cv2
import numpy as np
import asyncio
import base64
from datetime import datetime
import os

from services.ai_gymtrainer import gym_trainer_service
from database.mongodb import get_user_exercise_history

router = APIRouter()


@router.post("/process-frame")
async def process_exercise_frame(
        file: UploadFile = File(...),
        user_id: str = Form(...),
        exercise_choice: int = Form(...)
):
    """
    Process a single video frame for exercise recognition.

    - **file**: The video frame as an image file
    - **user_id**: Unique identifier for the user
    - **exercise_choice**: 1=Squat, 2=Curl, 3=Sit-up, 4=Lunge, 5=Pushup
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are accepted.")

    # Read file content
    contents = await file.read()

    try:
        # Process the frame using our gym trainer service
        response = await gym_trainer_service.process_frame(contents, user_id, exercise_choice)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing frame: {str(e)}")


@router.post("/start-session")
async def start_exercise_session(
        user_id: str = Body(...),
        exercise_choice: Optional[int] = Body(1)
):
    """
    Start a new exercise tracking session.

    - **user_id**: Unique identifier for the user
    - **exercise_choice**: 1=Squat, 2=Curl, 3=Sit-up, 4=Lunge, 5=Pushup (default: 1)
    """
    try:
        # Reset the exercise tracking state
        gym_trainer_service.reset_variables()

        return {
            "message": "Exercise session started",
            "exercise": ['', 'Squat', 'Curl', 'Sit-up', 'Lunge', 'Pushup'][exercise_choice],
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting session: {str(e)}")


@router.post("/end-session")
async def end_exercise_session(
        user_id: str = Body(...)
):
    """
    End the current exercise session and save the data.

    - **user_id**: Unique identifier for the user
    """
    try:
        # Save the exercise data to the database
        summary = await gym_trainer_service.save_exercise_data(user_id, None)

        # Reset the state for the next session
        gym_trainer_service.reset_variables()

        return {
            "message": "Exercise session completed",
            "summary": summary,
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ending session: {str(e)}")


@router.get("/history/{user_id}")
async def get_exercise_history(user_id: str):
    """
    Get the exercise history for a specific user.

    - **user_id**: Unique identifier for the user
    """
    try:
        exercise_history = await get_user_exercise_history(user_id)
        return {
            "user_id": user_id,
            "history": exercise_history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving exercise history: {str(e)}")


@router.get("/exercises")
async def get_available_exercises():
    """Get a list of available exercises."""
    exercises = [
        {"id": 1, "name": "Squat", "target_muscles": ["Quadriceps", "Glutes", "Hamstrings"]},
        {"id": 2, "name": "Arm Curl", "target_muscles": ["Biceps", "Forearms"]},
        {"id": 3, "name": "Sit-up", "target_muscles": ["Core", "Abdominal Muscles"]},
        {"id": 4, "name": "Lunge", "target_muscles": ["Quadriceps", "Glutes", "Calves"]},
        {"id": 5, "name": "Push-up", "target_muscles": ["Chest", "Triceps", "Core"]}
    ]
    return {"exercises": exercises}