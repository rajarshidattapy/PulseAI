import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routers import compounder, doctor, dietician, gymtrainer
from database.mongodb import connect_to_mongo, close_mongo_connection

# Create FastAPI app
app = FastAPI(
    title="Health_sync",
    description="A comprehensive healthcare platform with multiple AI services",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(compounder.router, prefix="/api/compounder", tags=["compounder"])
app.include_router(gymtrainer.router, prefix="/api/gymtrainer", tags=["gymtrainer"])
app.include_router(doctor.router, prefix="/api/doctor", tags=["doctor"])
app.include_router(dietician.router, prefix="/api/dietician", tags=["dietician"])

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {
        "message": "Welcome to AI Healthcare Platform API",
        "services": [
            "ai_compounder - Analyze medical reports",
            "ai_gymtrainer - Exercise tracking and guidance",
            "ai_doctor - Medical consultations and advice",
            "ai_dietician - Diet plans and lifestyle recommendations"
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)