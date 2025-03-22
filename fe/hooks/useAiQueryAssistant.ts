import { useState } from "react";

interface MedicalQuery {
  user_id: string;
  query: string;
  conversation_history?: { role: string; content: string }[];
}

interface MedicalResponse {
  status: string;
  data?: any;
  error?: string;
}

const API_BASE_URL = " http://127.0.0.1:8000"; 

export function useMedicalQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<MedicalResponse | null>(null);

  const processMedicalQuery = async (queryData: MedicalQuery) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryData),
      });

      const data: MedicalResponse = await response.json();
      console.log("Response data:", data);
      if (response.ok) {
        setResponse(data);
      } else {
        throw new Error(data.error || "Failed to process query");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return {
    response,
    loading,
    error,
    processMedicalQuery,
  };
}
