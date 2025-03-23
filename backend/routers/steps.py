from fastapi import APIRouter, Depends, HTTPException, Body, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime
import os
import requests
import time

# Import steps service
from services.ai_steps import get_steps_count, save_steps_data

router = APIRouter()


class TokenInfo(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: Optional[int] = None


class StepsRequest(BaseModel):
    user_id: str
    token_info: TokenInfo
    time_range: Optional[str] = "today"  # today, week, month


class SaveStepsRequest(BaseModel):
    user_id: str
    steps_data: Dict[str, Any]


@router.post("/get-steps")
async def fetch_steps_count(request: StepsRequest):
    """
    Fetch steps count from Google Fit API
    """
    return await get_steps_count(
        user_id=request.user_id,
        token_info=request.token_info.dict(),
        time_range=request.time_range
    )


@router.post("/save-steps")
async def save_steps(request: SaveStepsRequest):
    """
    Save steps data to database
    """
    result_id = await save_steps_data(
        user_id=request.user_id,
        steps_data=request.steps_data
    )

    return {
        "status": "success",
        "data": {
            "record_id": result_id
        }
    }


@router.get("/summary/{user_id}")
async def get_steps_summary(user_id: str, days: int = 7):
    """
    Get a summary of steps data for a user over a specified number of days
    """
    from database.mongodb import db

    # Calculate date range
    end_date = datetime.utcnow()
    start_date = datetime(end_date.year, end_date.month, end_date.day) - datetime.timedelta(days=days)

    try:
        # Query the database for steps data within the date range
        cursor = db.steps_data.find({
            "user_id": user_id,
            "timestamp": {"$gte": start_date, "$lte": end_date}
        }).sort("timestamp", -1)

        steps_history = []
        async for doc in cursor:
            steps_history.append({
                "date": doc["timestamp"].strftime("%Y-%m-%d"),
                "steps_data": doc["steps_data"]
            })

        return {
            "status": "success",
            "data": {
                "user_id": user_id,
                "days": days,
                "steps_history": steps_history
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch steps summary: {str(e)}")




@router.get("/auth/callback")
async def auth_callback(request: Request, code: str = None, error: str = None):
    """
    Handle OAuth callback from Google
    """
    if error:
        return HTMLResponse(f"<html><body><h1>Error</h1><p>{error}</p></body></html>")

    if not code:
        return HTMLResponse("<html><body><h1>Error</h1><p>No authorization code received</p></body></html>")

    # Return a simple HTML page that closes itself and passes the code back to the opener
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Authentication Successful</title>
        <script>
            // Store the code in local storage
            localStorage.setItem('google_auth_code', '""" + code + """');

            // If opened from another window, pass code back
            if (window.opener) {
                window.opener.postMessage({code: '""" + code + """'}, '*');
                setTimeout(function() {
                    window.close();
                }, 1000);
            } else {
                // If not opened as popup, redirect to main app
                window.location.href = '/';
            }
        </script>
    </head>
    <body>
        <h1>Authentication Successful</h1>
        <p>You can close this window and return to the application.</p>
    </body>
    </html>
    """)


@router.post("/exchange-token")
async def exchange_token(code: str = Body(...)):
    """
    Exchange authorization code for access and refresh tokens
    """
    token_url = "https://oauth2.googleapis.com/token"
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    redirect_uri = "http://localhost:8000/auth/callback"

    payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }

    try:
        response = requests.post(token_url, data=payload)
        token_data = response.json()

        if "error" in token_data:
            return {"status": "error", "message": token_data.get("error_description", token_data["error"])}

        # Calculate expiration time
        if "expires_in" in token_data:
            token_data["expires_at"] = int(time.time()) + token_data["expires_in"]

        return {"status": "success", "data": token_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}