import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# OpenAI API configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)


async def process_medical_query(user_id, query, conversation_history=None):
    """
    Process a medical query using OpenAI's GPT-4o and provide personalized answers.
    Also includes a list of available doctors in the response.

    Args:
        user_id: The ID of the user
        query: The medical query text
        conversation_history: Previous conversation for context

    Returns:
        dict: Medical advice, potential diagnoses, doctor recommendations, and a list of available doctors
    """
    try:
        # Prepare messages for the API
        messages = [
            {"role": "system", "content": """
            You are an AI medical assistant. Provide helpful information about medical conditions and symptoms.
            Always include appropriate disclaimers that you are not a replacement for professional medical advice.
            Format your response as a structured JSON with the following fields:
            - answer: Your informative response to the query
            - possible_conditions: An array of potential conditions related to the described symptoms
            - recommendations: General advice and suggestion to consult with a healthcare provider
            - doctor_referrals: An array of specialist types that would be appropriate to consult
            - precautions: Immediate steps or precautions the person should take
            - disclaimer: A clear medical disclaimer
            """}
        ]

        # Add conversation history if available
        if conversation_history:
            for message in conversation_history:
                messages.append({
                    "role": message.get("role", "user"),
                    "content": message.get("content", "")
                })

        # Add the current query
        messages.append({"role": "user", "content": query})

        # Call the OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            response_format={"type": "json_object"}
        )

        # Extract and parse the JSON response
        medical_response = json.loads(response.choices[0].message.content)

        # Format doctor referrals if not in expected format
        if "doctor_referrals" in medical_response and not isinstance(medical_response["doctor_referrals"], list):
            medical_response["doctor_referrals"] = [
                {
                    "name": "Healthcare Provider",
                    "specialty": medical_response["doctor_referrals"],
                    "contact": "Consult local directory"
                }
            ]

        # Get the list of doctors
        doctors = await get_doctor_list()

        # Filter doctors based on recommended specialties if possible
        recommended_specialties = []
        if "doctor_referrals" in medical_response and isinstance(medical_response["doctor_referrals"], list):
            for referral in medical_response["doctor_referrals"]:
                if isinstance(referral, str):
                    recommended_specialties.append(referral.lower())
                elif isinstance(referral, dict) and "specialty" in referral:
                    recommended_specialties.append(referral["specialty"].lower())

        # If we have specialties to filter by, create a relevant_doctors list
        relevant_doctors = []
        if recommended_specialties:
            for doctor in doctors:
                if "specialty" in doctor and any(
                        specialty in doctor["specialty"].lower() for specialty in recommended_specialties):
                    # Mark this doctor as particularly relevant
                    doctor_copy = doctor.copy()
                    doctor_copy["relevant"] = True
                    relevant_doctors.append(doctor_copy)

            # Add the relevant flag to all other doctors (setting to False)
            for doctor in doctors:
                if not any(d["name"] == doctor["name"] for d in relevant_doctors):
                    doctor["relevant"] = False

        # Include both the medical response and the doctor list in the return value
        return {
            "status": "success",
            "data": medical_response,
            "doctors": doctors,
            "relevant_doctors": relevant_doctors if recommended_specialties and relevant_doctors else None
        }
    except Exception as e:
        # Try to still provide a doctor list even if the medical query processing fails
        try:
            doctors = await get_doctor_list()
            return {
                "status": "partial_success",
                "message": f"Failed to process medical query: {str(e)}",
                "doctors": doctors
            }
        except Exception as doc_error:
            return {
                "status": "error",
                "message": f"Failed to process medical query: {str(e)}. Also failed to retrieve doctor list: {str(doc_error)}"
            }

async def save_medical_query(user_id, query, response):
    """
    Save the medical query and response to the database.

    Args:
        user_id: The ID of the user
        query: The original query
        response: The response provided

    Returns:
        str: The ID of the saved record
    """
    # In a real implementation, this would save to MongoDB
    # For now, we'll return a placeholder
    return "medical_query_id_placeholder"


async def get_doctor_list():
    """
    Retrieve a list of doctors with their specialties and contact information.

    Returns:
        list: List of doctors with their details
    """
    try:
        # Call the OpenAI API to generate a list of doctors
        # This would typically come from a database in a real application
        prompt = """
        Generate a list of 5 example doctors with different specialties.
        Include their name, specialty, contact information, and location.
        Format the response as a JSON array of doctor objects.
        """

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an assistant helping to generate sample doctor data."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )

        # Extract and parse the JSON response
        result = json.loads(response.choices[0].message.content)

        # Ensure we have a list of doctors
        if "doctors" in result:
            return result["doctors"]
        else:
            return result
    except Exception as e:
        # Fallback to sample data if API call fails
        return [
            {
                "name": "Dr. Jane Smith",
                "specialty": "General Practitioner",
                "contact": "555-1234",
                "location": "Central Medical Center"
            },
            {
                "name": "Dr. John Johnson",
                "specialty": "Cardiologist",
                "contact": "555-5678",
                "location": "Heart Health Clinic"
            },
            {
                "name": "Dr. Sarah Williams",
                "specialty": "Dermatologist",
                "contact": "555-9012",
                "location": "Skin Care Center"
            }
        ]