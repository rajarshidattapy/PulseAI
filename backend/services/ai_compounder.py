import os
import base64
import json
import datetime
from dotenv import load_dotenv
from openai import OpenAI
from database.mongodb import save_conversation

# Load environment variables
load_dotenv()

# OpenAI API configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)


async def analyze_medical_report(image_data, user_id=None):
    """
    Analyze medical reports and prescriptions using OpenAI's GPT-4o.

    Args:
        image_data: The medical report or prescription image data
        user_id: The ID of the user (optional)

    Returns:
        dict: Analysis results including summary, medications, and recommendations
    """
    try:
        # Convert image data to base64 for OpenAI API
        base64_image = base64.b64encode(image_data).decode('utf-8')

        # Construct the prompt for GPT-4o
        prompt = """
        Please analyze this medical report/prescription and provide the following information:
        1. A clear summary of the report in simple language
        2. List all medications mentioned with their dosages, frequencies, and purposes
        3. Highlight any specific recommendations or instructions for the patient
        4. Note any concerns or potential issues the patient should be aware of

        Format your response as a structured JSON with the following fields:
        - summary: A concise overview of the report
        - medications: An array of medication objects with name, dosage, frequency, and purpose
        - recommendations: Specific actions or follow-ups the patient should take
        - concerns: Any warnings or potential issues to be aware of
        """

        # Call the OpenAI API with the image and prompt
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system",
                 "content": "You are a medical assistant that analyzes medical reports and prescriptions."},
                {"role": "user", "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]}
            ],
            response_format={"type": "json_object"}
        )

        # Extract and parse the JSON response
        analysis_result = json.loads(response.choices[0].message.content)

        # Save the analysis to conversation history if user_id is provided
        if user_id:
            try:
                # We can't save the actual image in the conversation history,
                # so we'll save the analysis results
                conversation_data = {
                    "timestamp": datetime.datetime.utcnow(),
                    "query": "Medical report analysis request",
                    "response": analysis_result,
                    "metadata": {
                        "image_analyzed": True,
                        "image_size": len(image_data)
                    }
                }
                await save_conversation("compounder_conversations", user_id, conversation_data)
            except Exception as e:
                print(f"Error saving medical report analysis conversation: {e}")

        return {
            "status": "success",
            "data": analysis_result
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to analyze medical report: {str(e)}"
        }


async def save_analysis_to_db(user_id, report_data, analysis_result):
    """
    Save the medical report analysis to the database.

    Args:
        user_id: The ID of the user
        report_data: Original report data
        analysis_result: The results of the analysis

    Returns:
        str: The ID of the saved record
    """
    # Updated to actually save to MongoDB
    from database.mongodb import db
    try:
        result = await db.medical_reports.insert_one({
            "user_id": user_id,
            "timestamp": datetime.datetime.utcnow(),
            "report_data": report_data,
            "analysis_result": analysis_result
        })
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error saving analysis to db: {e}")
        return "report_analysis_id_error"