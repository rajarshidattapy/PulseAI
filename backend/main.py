import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi.responses import HTMLResponse
from fastapi import Request
# Load environment variables
load_dotenv()

# Create a single FastAPI app
app = FastAPI(
    title="Health_sync",
    description="A comprehensive healthcare platform with multiple AI services",
    version="1.0.0"
)
@app.get("/auth/callback")
async def root_auth_callback(request: Request, code: str = None, error: str = None):
    """
    Handle OAuth callback from Google at the root level
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
# Import routers
from routers import compounder, doctor, dietician, gymtrainer, steps
from database.mongodb import connect_to_mongo, close_mongo_connection

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers (include the steps auth router correctly)
app.include_router(compounder.router, prefix="/api/compounder", tags=["compounder"])
app.include_router(gymtrainer.router, prefix="/api/gymtrainer", tags=["gymtrainer"])
app.include_router(doctor.router, prefix="/api/doctor", tags=["doctor"])
app.include_router(dietician.router, prefix="/api/dietician", tags=["dietician"])
app.include_router(steps.router, prefix="/api/steps", tags=["steps"])



@app.get("/")
async def root():
    return {
        "message": "Welcome to AI Healthcare Platform API",
        "services": [
            "ai_compounder - Analyze medical reports",
            "ai_gymtrainer - Exercise tracking and guidance",
            "ai_doctor - Medical consultations and advice",
            "ai_dietician - Diet plans and lifestyle recommendations",
            "steps - Track step count from Google Fit"  # Add steps service
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)