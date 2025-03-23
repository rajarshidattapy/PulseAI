"use client"
import { useState, ChangeEvent, FormEvent } from "react";
import { useAIDietician } from "@/hooks/useAiDietician";

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

interface DietPlanData {
  status: string;
  data: {
    daily_calories: number;
    macronutrient_ratio: Record<string, number>;
    meal_plan: Record<string, string[]>;
    hydration: string;
    supplements?: string;
    lifestyle_recommendations: string[];
  };
}

interface HealthPredictionData {
  status: string;
  data: {
    estimated_lifespan: number;
    disease_risks: Record<string, string>;
    // Add other health prediction fields
  };
}

const DietPlanForm = () => {
  const { getDietPlan, getHealthPredictions, loading, error } = useAIDietician();

  const [formData, setFormData] = useState<Record<string, string>>({
    user_id: "",
    age: "",
    sex: "",
    weight: "",
    height: "",
    health_issues: "",
    sleep_hours: "",
    activity_level: "",
    dietary_preferences: "",
    allergies: "",
    current_medications: "",
    daily_routine: "",
  });

  const [dietPlan, setDietPlan] = useState<DietPlanData | null>(null);
  const [healthPredictions, setHealthPredictions] = useState<HealthPredictionData | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formattedData: UserHealthData = {
      user_id: formData.user_id,
      age: Number(formData.age),
      sex: formData.sex,
      weight: Number(formData.weight),
      height: Number(formData.height),
      sleep_hours: Number(formData.sleep_hours),
      activity_level: formData.activity_level,
      health_issues: formData.health_issues ? formData.health_issues.split(",") : [],
      dietary_preferences: formData.dietary_preferences ? formData.dietary_preferences.split(",") : [],
      allergies: formData.allergies ? formData.allergies.split(",") : [],
      current_medications: formData.current_medications ? formData.current_medications.split(",") : [],
      family_history: formData.family_history ? JSON.parse(formData.family_history) : {},
      daily_routine: formData.daily_routine,
    };

    const dietData = await getDietPlan(formattedData);
    setDietPlan(dietData);

    const healthData = await getHealthPredictions(formattedData);
    setHealthPredictions(healthData);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">AI Dietician</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(formData).map((key) => (
            <div key={key} className="mb-2">
              <label className="block font-semibold capitalize text-gray-700 mb-1">
                {key.replace(/_/g, " ")}
              </label>
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter your ${key.replace(/_/g, " ")}`}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg w-full hover:bg-blue-700 transition duration-300 font-semibold"
          disabled={loading}
        >
          {loading ? "Processing..." : "Generate Diet Plan & Health Predictions"}
        </button>
      </form>

      {error && (
        <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {dietPlan && dietPlan.status === "success" && (
        <div className="mt-8 p-6 border rounded-lg shadow-md bg-blue-50">
          <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b pb-2">Your Personalized Diet Plan</h2>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Daily Calories</h3>
            <p className="text-lg">{dietPlan.data.daily_calories} calories</p>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Macronutrient Ratio</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(dietPlan.data.macronutrient_ratio).map(([nutrient, value]) => (
                <div key={nutrient} className="bg-white p-3 rounded-lg shadow-sm">
                  <span className="font-medium capitalize">{nutrient}: </span>
                  <span>{value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Meal Plan</h3>
            {Object.entries(dietPlan.data.meal_plan).map(([meal, foods]) => (
              <div key={meal} className="mb-3 bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-lg font-medium capitalize mb-2">{meal}</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {foods.map((food, index) => (
                    <li key={index}>{food}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Hydration</h3>
            <p className="bg-white p-3 rounded-lg shadow-sm">{dietPlan.data.hydration}</p>
          </div>

          {dietPlan.data.supplements && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Recommended Supplements</h3>
              <p className="bg-white p-3 rounded-lg shadow-sm">{dietPlan.data.supplements}</p>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Lifestyle Recommendations</h3>
            <ul className="bg-white p-3 rounded-lg shadow-sm list-disc pl-5 space-y-2">
              {dietPlan.data.lifestyle_recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {healthPredictions && healthPredictions.status === "success" && (
        <div className="mt-8 p-6 border rounded-lg shadow-md bg-green-50">
          <h2 className="text-2xl font-bold mb-4 text-green-700 border-b pb-2">Your Health Predictions</h2>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Estimated Lifespan</h3>
            <p className="text-lg bg-white p-3 rounded-lg shadow-sm">
              {healthPredictions.data.estimated_lifespan} years
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Disease Risks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(healthPredictions.data.disease_risks).map(([disease, risk]) => (
                <div key={disease} className="bg-white p-3 rounded-lg shadow-sm">
                  <span className="font-medium capitalize">{disease.replace(/_/g, " ")}: </span>
                  <span className={`font-semibold ${
                    risk === "low" ? "text-green-600" : 
                    risk === "medium" ? "text-yellow-600" : 
                    "text-red-600"
                  }`}>
                    {risk}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlanForm;