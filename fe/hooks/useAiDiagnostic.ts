import { useState } from "react";

interface MedicalReport {
  summary: string;
  medications: { name: string; dosage: string; frequency: string; purpose: string }[];
  recommendations: string;
  concerns: string;
}

interface AIDiagnosticHook {
  data: MedicalReport | null;
  loading: boolean;
  error: string | null;
  processMedicalReport: (file: File | null, userId: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

const API_BASE_URL = "http://127.0.0.1:8000";

export default function useAIDiagnostic(): AIDiagnosticHook {
  const [data, setData] = useState<MedicalReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const processMedicalReport = async (file: File | null, userId: string) => {
    if (!file) {
      setError("No file selected");
      return;
    }
  
    console.log("Processing file:", file.name);
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);  
    try {
      const response = await fetch(`${API_BASE_URL}/api/compounder/analyze-report`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to process image: ${errorText}`);
      }
  
      const result = await response.json();
      console.log("API response:", result);
      setData(result);
    } catch (error) {
      console.error("Error processing image:", error);
      setError(error instanceof Error ? error.message : String(error));
    }
  };
  
  
  

  return { data, loading, error, processMedicalReport, selectedFile, setSelectedFile };
}
