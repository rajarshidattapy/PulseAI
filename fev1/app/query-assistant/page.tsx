"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMedicalQuery } from "@/hooks/useAiQueryAssistant";
import { Heart, Search, AlertCircle, Activity, Stethoscope, Shield } from "lucide-react";

interface MedicalResponse {
  status: string;
  data?: {
    answer: string;
    possible_conditions?: string[];
    recommendations?: string;
    doctor_referrals?: string[];
    precautions?: string;
    disclaimer: string;
    doctors?: { name: string; Specialty: string; Location: string; Contact: string }[];
  };
}

export default function HealthAssistant() {
  const [query, setQuery] = useState<string>("");
  const { response, loading, error, processMedicalQuery } = useMedicalQuery();
  const [displayResponse, setDisplayResponse] = useState<MedicalResponse["data"] | null>(null);

  useEffect(() => {
    if (response?.status === "success" && response.data) {
      setDisplayResponse(response.data);
    }
  }, [response]);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    await processMedicalQuery({ user_id: "123", query });
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="text-center mb-2 animate-fade-in">
        <p className="text-muted-foreground max-w-md">
          Ask any medical question and get AI-powered insights and recommendations
        </p>
      </div>
      
      <div className="flex gap-2 w-full relative">
        <Input
          type="text"
          placeholder="Ask a medical question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-10 shadow-sm border-blue-100 dark:border-slate-700 focus-visible:ring-blue-400"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
        >
          {loading ? "Loading..." : "Ask"}
        </Button>
      </div>
      
      <Card className="w-full max-w-md border-blue-100 dark:border-slate-700 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2" />
        <CardContent className="p-6">
          {error ? (
            <div className="flex items-start gap-3 text-red-500">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p>Error: {error}</p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              </div>
              <p className="text-muted-foreground mt-4">Analyzing your question...</p>
            </div>
          ) : displayResponse ? (
            <div className="space-y-4">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{displayResponse.answer}</p>
              {displayResponse.possible_conditions?.length > 0 && (
                <div className="space-y-2 bg-blue-50 dark:bg-slate-800/50 p-3 rounded-md">
                  <h2 className="font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Stethoscope className="h-5 w-5" /> Possible Conditions:
                  </h2>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                    {displayResponse.possible_conditions.map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                </div>
              )}
              {displayResponse.recommendations && (
                <div className="space-y-2">
                  <h2 className="font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Heart className="h-5 w-5" /> Recommendations:
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{displayResponse.recommendations}</p>
                </div>
              )}
              {displayResponse.doctor_referrals?.length > 0 && (
                <div className="space-y-2">
                  <h2 className="font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Stethoscope className="h-5 w-5" /> Doctor Referrals:
                  </h2>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                    {displayResponse.doctor_referrals.map((doctor, index) => (
                      <li key={index}>{doctor}</li>
                    ))}
                  </ul>
                </div>
              )}
              {displayResponse.precautions && (
                <div className="space-y-2 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                  <h2 className="font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <Shield className="h-5 w-5" /> Precautions:
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{displayResponse.precautions}</p>
                </div>
              )}
              <div className="border-t pt-3 mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  <strong>Disclaimer:</strong> {displayResponse.disclaimer}
                </p>
                <ul>
                  {displayResponse.doctors?.map((doctor, index) => (
                    <li key={index}>
                      <strong>{doctor.name}</strong> - {doctor.Specialty}, {doctor.Location} ({doctor.Contact})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10 text-muted-foreground">
              <Stethoscope className="h-12 w-12 mb-4 text-blue-200" />
              <p>Ask a medical question to get started</p>
              <p className="text-sm mt-2">Example: "What are the symptoms of the flu?"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
