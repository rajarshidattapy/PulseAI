import os
import base64
import json
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# OpenAI API configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)


async def analyze_medical_report(image_data):
    """
    Analyze medical reports and prescriptions using OpenAI's GPT-4o.

    Args:
        image_data: The medical report or prescription image data

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
    # In a real implementation, this would interact with your MongoDB
    # For now, we'll return a placeholder
    return "report_analysis_id_placeholder"