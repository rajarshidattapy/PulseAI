import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# OpenAI API configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)


async def generate_diet_plan(user_data):
    """
    Generate a personalized diet plan based on user data using OpenAI's GPT-4o.

    Args:
        user_data: User health information including weight, age, sex,
                  health issues, sleep patterns, and lifestyle

    Returns:
        dict: Personalized diet plan and lifestyle recommendations
    """
    try:
        # Construct the prompt for GPT-4o
        prompt = f"""
        Generate a personalized diet plan for a {user_data.get('age')}-year-old {user_data.get('sex')} 
        with the following characteristics:
        - Weight: {user_data.get('weight')} kg
        - Height: {user_data.get('height')} cm
        - Health issues: {', '.join(user_data.get('health_issues', ['None reported']))}
        - Sleep patterns: {user_data.get('sleep_hours', 'Not specified')} hours per night
        - Activity level: {user_data.get('activity_level', 'Not specified')}
        - Dietary preferences: {', '.join(user_data.get('dietary_preferences', ['None specified']))}
        - Allergies: {', '.join(user_data.get('allergies', ['None reported']))}

        Please include:
        1. Daily calorie recommendation
        2. Macronutrient ratio (protein, carbs, fats)
        3. Meal plan with specific food suggestions
        4. Hydration recommendations
        5. Supplement suggestions if appropriate
        6. Lifestyle recommendations

        Format your response as a structured JSON with these fields:
        - daily_calories: recommended daily calorie intake
        - macronutrient_ratio: object with protein, carbohydrates, and fats percentages
        - meal_plan: object with arrays for breakfast, lunch, dinner, and snacks
        - hydration: water intake recommendation
        - supplements: any recommended supplements
        - lifestyle_recommendations: array of lifestyle suggestions
        """

        # Call the OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a nutritionist and dietitian assistant."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )

        # Extract and parse the JSON response
        diet_plan = json.loads(response.choices[0].message.content)

        return {
            "status": "success",
            "data": diet_plan
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to generate diet plan: {str(e)}"
        }


async def predict_health_metrics(user_data):
    """
    Predict health metrics like average lifespan and disease risks using OpenAI's GPT-4o.

    Args:
        user_data: User health information and lifestyle data

    Returns:
        dict: Predicted health metrics and risk assessments
    """
    try:
        # Construct the prompt for GPT-4o
        prompt = f"""
        Based on the following health information, provide predictions about potential health metrics 
        and disease risks for a {user_data.get('age')}-year-old {user_data.get('sex')}:

        - Weight: {user_data.get('weight')} kg
        - Height: {user_data.get('height')} cm
        - Health issues: {', '.join(user_data.get('health_issues', ['None reported']))}
        - Sleep patterns: {user_data.get('sleep_hours', 'Not specified')} hours per night
        - Activity level: {user_data.get('activity_level', 'Not specified')}
        - Family history: {json.dumps(user_data.get('family_history', {}))}
        - Current medications: {', '.join(user_data.get('current_medications', ['None']))}
        - Daily routine: {user_data.get('daily_routine', 'Not specified')}

        Please include:
        1. Estimated lifespan based on statistical averages
        2. Risk assessment for common conditions (heart disease, diabetes, etc.)
        3. Health improvement suggestions
        4. A clear disclaimer about the statistical nature of these predictions

        Format your response as a structured JSON with these fields:
        - estimated_lifespan: numerical estimate
        - disease_risks: object with different conditions and their risk levels
        - health_improvement_suggestions: array of actionable suggestions
        - disclaimer: clear statement about limitations of these predictions
        """

        # Call the OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system",
                 "content": "You are a health analytics assistant. Provide health predictions based on statistical averages while clearly stating limitations."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )

        # Extract and parse the JSON response
        health_predictions = json.loads(response.choices[0].message.content)

        return {
            "status": "success",
            "data": health_predictions
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to predict health metrics: {str(e)}"
        }


async def save_diet_plan(user_id, diet_plan):
    """
    Save the generated diet plan to the database.

    Args:
        user_id: The ID of the user
        diet_plan: The generated diet plan

    Returns:
        str: The ID of the saved diet plan
    """
    # In a real implementation, this would save to MongoDB
    # For now, we'll return a placeholder
    return "diet_plan_id_placeholder"