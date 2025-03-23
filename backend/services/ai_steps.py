import os
import json
import datetime
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from database.mongodb import save_conversation

# Load environment variables
load_dotenv()

# Google API configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")


async def get_steps_count(user_id, token_info, time_range="today"):
    """
    Fetch steps count from Google Fit API for a given user and time range.

    Args:
        user_id: The ID of the user
        token_info: OAuth token information for Google Fit API
        time_range: Time range for steps data (today, week, month)

    Returns:
        dict: Steps count data and summary
    """
    try:
        # Create credentials from token info
        credentials = Credentials(
            token=token_info.get("access_token"),
            refresh_token=token_info.get("refresh_token"),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=GOOGLE_CLIENT_ID,
            client_secret=GOOGLE_CLIENT_SECRET
        )

        # Build the Fitness API client
        fitness_service = build('fitness', 'v1', credentials=credentials)

        # Calculate time range
        now = datetime.datetime.utcnow()
        end_time = int(now.timestamp() * 1000000000)  # End time in nanoseconds

        if time_range == "today":
            start_time = int(datetime.datetime(now.year, now.month, now.day, 0, 0, 0).timestamp() * 1000000000)
        elif time_range == "week":
            start_of_week = now - datetime.timedelta(days=now.weekday())
            start_time = int(datetime.datetime(start_of_week.year, start_of_week.month, start_of_week.day, 0, 0,
                                               0).timestamp() * 1000000000)
        elif time_range == "month":
            start_of_month = datetime.datetime(now.year, now.month, 1)
            start_time = int(start_of_month.timestamp() * 1000000000)
        else:
            # Default to today if invalid range specified
            start_time = int(datetime.datetime(now.year, now.month, now.day, 0, 0, 0).timestamp() * 1000000000)

        # Request steps data from Google Fit API
        body = {
            "aggregateBy": [{
                "dataTypeName": "com.google.step_count.delta",
                "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
            }],
            "bucketByTime": {"durationMillis": 86400000},  # 1 day in milliseconds
            "startTimeMillis": start_time // 1000000,  # Convert to milliseconds
            "endTimeMillis": end_time // 1000000  # Convert to milliseconds
        }

        response = fitness_service.users().dataset().aggregate(userId="me", body=body).execute()

        # Process the response
        steps_data = []
        total_steps = 0

        for bucket in response.get("bucket", []):
            start_time_millis = bucket.get("startTimeMillis")
            end_time_millis = bucket.get("endTimeMillis")

            # Convert milliseconds to datetime
            date = datetime.datetime.fromtimestamp(int(start_time_millis) / 1000).strftime('%Y-%m-%d')

            # Extract steps count
            dataset = bucket.get("dataset", [])
            daily_steps = 0

            for data_set in dataset:
                points = data_set.get("point", [])
                for point in points:
                    value = point.get("value", [])
                    if value:
                        daily_steps += value[0].get("intVal", 0)

            steps_data.append({
                "date": date,
                "steps": daily_steps
            })

            total_steps += daily_steps

        # Create response with steps data and summary
        result = {
            "time_range": time_range,
            "total_steps": total_steps,
            "daily_data": steps_data,
            "goal_progress": calculate_goal_progress(total_steps, time_range)
        }

        # Save the data to conversation history
        try:
            conversation_data = {
                "timestamp": datetime.datetime.utcnow(),
                "query": f"Steps count for {time_range}",
                "response": result,
                "metadata": {
                    "time_range": time_range,
                    "total_steps": total_steps
                }
            }
            await save_conversation("steps_conversations", user_id, conversation_data)
        except Exception as e:
            print(f"Error saving steps conversation: {e}")

        return {
            "status": "success",
            "data": result
        }

    except HttpError as error:
        return {
            "status": "error",
            "message": f"Google Fit API error: {str(error)}",
            "error_details": "Authorization may have expired. Please reconnect your Google Fit account."
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to fetch steps data: {str(e)}"
        }


def calculate_goal_progress(steps, time_range):
    """
    Calculate progress towards step goals based on time range.

    Args:
        steps: Total steps count
        time_range: Time range for the data

    Returns:
        dict: Goal progress information
    """
    # Define default goals for different time ranges
    default_goals = {
        "today": 10000,  # 10k steps per day
        "week": 70000,  # 70k steps per week
        "month": 300000  # 300k steps per month
    }

    goal = default_goals.get(time_range, 10000)
    progress_percent = min(round((steps / goal) * 100, 1), 100)

    status = "On Track"
    if progress_percent < 50:
        status = "Behind Target"
    elif progress_percent >= 100:
        status = "Goal Achieved"

    return {
        "goal": goal,
        "progress_percent": progress_percent,
        "status": status,
        "steps_remaining": max(0, goal - steps)
    }


async def save_steps_data(user_id, steps_data):
    """
    Save steps data to the database.

    Args:
        user_id: The ID of the user
        steps_data: Steps count data

    Returns:
        str: The ID of the saved record
    """
    from database.mongodb import db
    try:
        result = await db.steps_data.insert_one({
            "user_id": user_id,
            "timestamp": datetime.datetime.utcnow(),
            "steps_data": steps_data
        })
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error saving steps data to db: {e}")
        return "steps_data_id_error"