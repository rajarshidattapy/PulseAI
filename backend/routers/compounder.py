from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
import json

# Import services
from services.ai_compounder import analyze_medical_report, save_analysis_to_db

router = APIRouter()


class AnalysisResponse(BaseModel):
    summary: str
    medications: List[dict]
    recommendations: str
    concerns: Optional[str] = None


@router.post("/analyze-report", response_model=dict)
async def analyze_report(
        file: UploadFile = File(...),
        user_id: str = Form(...),
):
    """
    Endpoint to analyze medical reports and prescriptions.

    - Accepts an uploaded image of a medical report or prescription
    - Returns structured analysis of the report
    """
    try:
        # Read file contents
        contents = await file.read()

        # Process the image with AI service
        analysis_result = await analyze_medical_report(contents)

        # Save to database if analysis was successful
        if analysis_result["status"] == "success":
            report_data = {
                "filename": file.filename,
                "content_type": file.content_type,
                "size": len(contents)
            }
            await save_analysis_to_db(user_id, report_data, analysis_result["data"])

        return analysis_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing report: {str(e)}"
        )


@router.get("/user-reports/{user_id}", response_model=dict)
async def get_user_reports(user_id: str):
    """
    Endpoint to retrieve a user's previous medical report analyses.
    """
    # This would normally fetch from MongoDB
    # For now, return placeholder data
    return {
        "status": "success",
        "data": {
            "reports": [
                {
                    "id": "sample_report_id_1",
                    "date": "2025-03-01T10:30:00",
                    "summary": "Sample medical report analysis"
                }
            ]
        }
    }