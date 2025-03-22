from fastapi import APIRouter, HTTPException, status, Body
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Import services
from services.ai_doctor import process_medical_query, save_medical_query, get_doctor_list

router = APIRouter()


class MedicalQuery(BaseModel):
    user_id: str
    query: str
    conversation_history: Optional[List[Dict[str, Any]]] = None


class DoctorReferral(BaseModel):
    name: str
    specialty: str
    contact: str
    location: Optional[str] = None


@router.post("/query", response_model=dict)
async def medical_query(query_data: MedicalQuery):
    """
    Endpoint to process medical queries and provide personalized responses.

    - Accepts a medical query text and optional conversation history
    - Returns personalized medical advice and recommendations
    """
    try:
        # Process the query with AI service
        response = await process_medical_query(
            query_data.user_id,
            query_data.query,
            query_data.conversation_history
        )

        # Save to database if query processing was successful
        if response["status"] == "success":
            await save_medical_query(
                query_data.user_id,
                query_data.query,
                response["data"]
            )

        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing medical query: {str(e)}"
        )


@router.get("/doctors", response_model=Dict[str, List[Dict[str, Any]]])
async def list_doctors():
    """
    Endpoint to retrieve a list of doctors with their specialties and contact information.
    """
    try:
        doctors = await get_doctor_list()
        # Ensure we always return in the expected format with a "doctors" key
        return {"doctors": doctors, "status": "success"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving doctor list: {str(e)}"
        )


@router.get("/user-queries/{user_id}", response_model=dict)
async def get_user_queries(user_id: str):
    """
    Endpoint to retrieve a user's previous medical queries and responses.
    """
    # This would normally fetch from MongoDB
    # For now, return placeholder data
    return {
        "status": "success",
        "data": {
            "queries": [
                {
                    "id": "sample_query_id_1",
                    "timestamp": "2025-03-05T14:22:00",
                    "query": "What could cause persistent headaches?",
                    "response_summary": "Discussed potential causes of headaches and recommended consultation."
                }
            ]
        }
    }