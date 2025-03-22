from fastapi import APIRouter, HTTPException, status, Body
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Import services
from services.ai_dietician import generate_diet_plan, predict_health_metrics, save_diet_plan

router = APIRouter()


class UserHealthData(BaseModel):
    user_id: str
    age: int
    sex: str
    weight: float
    height: float
    health_issues: Optional[List[str]] = None
    sleep_hours: Optional[float] = None
    activity_level: Optional[str] = None
    dietary_preferences: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    family_history: Optional[Dict[str, bool]] = None
    current_medications: Optional[List[str]] = None
    daily_routine: Optional[str] = None


class DietPlan(BaseModel):
    daily_calories: int
    macronutrient_ratio: Dict[str, str]
    meal_plan: Dict[str, List[str]]
    hydration: str
    supplements: Optional[str] = None
    lifestyle_recommendations: List[str]


@router.post("/diet-plan", response_model=dict)
async def create_diet_plan(user_data: UserHealthData):
    """
    Endpoint to generate a personalized diet plan based on user health data.

    - Accepts comprehensive user health information
    - Returns a personalized diet and lifestyle plan
    """
    try:
        # Generate diet plan with AI service
        response = await generate_diet_plan(user_data.dict())

        # Save to database if diet plan generation was successful
        if response["status"] == "success":
            await save_diet_plan(user_data.user_id, response["data"])

        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating diet plan: {str(e)}"
        )


@router.post("/health-predictions", response_model=dict)
async def health_predictions(user_data: UserHealthData):
    """
    Endpoint to predict health metrics like average lifespan and disease risks.

    - Accepts user health data and lifestyle information
    - Returns predicted health metrics and risk assessments
    """
    try:
        # Generate health predictions with AI service
        response = await predict_health_metrics(user_data.dict())
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating health predictions: {str(e)}"
        )


@router.get("/user-diet-plans/{user_id}", response_model=dict)
async def get_user_diet_plans(user_id: str):
    """
    Endpoint to retrieve a user's previous diet plans.
    """
    # This would normally fetch from MongoDB
    # For now, return placeholder data
    return {
        "status": "success",
        "data": {
            "diet_plans": [
                {
                    "id": "sample_diet_plan_id_1",
                    "created_at": "2025-03-02T09:15:00",
                    "title": "Low-carb diet plan for weight management"
                }
            ]
        }
    }