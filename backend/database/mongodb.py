import os
import motor.motor_asyncio
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection settings
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "ai_healthcare_platform")

# Global variables for database connections
client = None
db = None


async def connect_to_mongo():
    """Connect to MongoDB and initialize global db variable."""
    global client, db
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
        db = client[MONGODB_DB_NAME]

        # Verify connection
        await db.command("ping")
        print(f"Connected to MongoDB: {MONGODB_DB_NAME}")

        # Create collections if they don't exist
        if "patient_records" not in await db.list_collection_names():
            await db.create_collection("patient_records")
        if "exercise_records" not in await db.list_collection_names():
            await db.create_collection("exercise_records")
        if "medical_queries" not in await db.list_collection_names():
            await db.create_collection("medical_queries")
        if "diet_plans" not in await db.list_collection_names():
            await db.create_collection("diet_plans")

    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


# Database operations for exercise tracking
async def save_exercise_data(user_id, exercise_data):
    """Save exercise tracking data to MongoDB."""
    exercise_record = {
        "user_id": user_id,
        "timestamp": exercise_data.get("timestamp"),
        "exercise_type": exercise_data.get("exercise_type"),
        "reps": exercise_data.get("reps"),
        "accuracy": exercise_data.get("accuracy"),
        "feedback": exercise_data.get("feedback")
    }
    result = await db.exercise_records.insert_one(exercise_record)
    return result.inserted_id


async def get_user_exercise_history(user_id):
    """Retrieve exercise history for a specific user."""
    cursor = db.exercise_records.find({"user_id": user_id}).sort("timestamp", -1)
    exercise_history = await cursor.to_list(length=100)
    return exercise_history

# Add similar functions for other collections as needed