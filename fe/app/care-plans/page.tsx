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

  const [dietPlan, setDietPlan] = useState<any>(null);
  const [healthPredictions, setHealthPredictions] = useState<any>(null);

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
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Dietician Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label className="block font-semibold capitalize">{key.replace("_", " ")}</label>
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        ))}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded w-full"
          disabled={loading}
        >
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

     <div>
     {dietPlan && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-lg font-bold">Diet Plan</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded">{JSON.stringify(dietPlan, null, 2)}</pre>
        </div>
      )}
     </div>

     <div>
     {healthPredictions && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-lg font-bold">Health Predictions</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded">{JSON.stringify(healthPredictions, null, 2)}</pre>
        </div>
      )}
    </div>
     </div>
  );
};

export default DietPlanForm;
