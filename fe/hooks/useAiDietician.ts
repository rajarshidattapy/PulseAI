import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

interface UserHealthData {
  user_id: string;
  age: number;
  sex: string;
  weight: number;
  height: number;
  health_issues?: string[];
  sleep_hours?: number;
  activity_level?: string;
  dietary_preferences?: string[];
  allergies?: string[];
  family_history?: Record<string, boolean>;
  current_medications?: string[];
  daily_routine?: string;
}

interface DietPlanResponse {
  status: string;
  data: {
    daily_calories: number;
    macronutrient_ratio: Record<string, string>;
    meal_plan: Record<string, string[]>;
    hydration: string;
    supplements?: string;
    lifestyle_recommendations: string[];
  };
}

interface HealthPredictionResponse {
  status: string;
  data: any; // Define structure if known
}

export const useAIDietician = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDietPlan = async (userData: UserHealthData): Promise<DietPlanResponse | null> => {
    setLoading(true);
    setError(null);
    console.log("Fetching diet plan with data:", userData);

    try {
      const response = await axios.post<DietPlanResponse>(`${BASE_URL}/api/dietician/diet-plan`, userData);
      console.log("Diet plan response:", response.data);
      return response.data;
    } catch (err) {
      setError("Error fetching diet plan.");
      console.error("Diet plan error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getHealthPredictions = async (userData: UserHealthData): Promise<HealthPredictionResponse | null> => {
    setLoading(true);
    setError(null);
    console.log("Fetching health predictions with data:", userData);

    try {
      const response = await axios.post<HealthPredictionResponse>(`${BASE_URL}/api/dietician/health-predictions`, userData);
      console.log("Health predictions response:", response.data);
      return response.data;
    } catch (err) {
      setError("Error fetching health predictions.");
      console.error("Health predictions error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getDietPlan, getHealthPredictions, loading, error };
};
