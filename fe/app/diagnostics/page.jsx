"use client";

import { useState } from "react";
import useAIDiagnostic from "@/hooks/useAiDiagnostic";
import {
  Microscope,
  Upload,
  FileImage,
  FileText,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function DiagnosticsPage() {
  const [uploadState, setUploadState] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    data,
    loading,
    error,
    processMedicalReport,
    selectedFile,
    setSelectedFile,
  } = useAIDiagnostic();

  const handleFileSelect = (event) => {
    if (event.target.files) {
     const file = event.target.files?.[0] || null;
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("No file selected", {
        description: "Please select a medical image to upload.",
      });
      return;
    }
  
    const userId = "123"; // Replace with actual user ID logic
    setUploadState("uploading");
    setProgress(0);
  
    try {
      processMedicalReport(selectedFile, userId);
      setUploadState("complete");
    } catch (err) {
      setUploadState("error");
      toast.error("Upload failed", {
        description: "There was an error processing the medical image.",
      });
    }
  };
  

  
  return (
    <div className="space-y-6 w-[975px]">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground">
          Upload medical images for AI-powered analysis and diagnostic
          assistance.
        </p>
      </div>
      <div className="flex flex-row gap-4">
        <div className="w-[50%] h-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                <span>Upload Medical Images</span>
              </CardTitle>
              <CardDescription>
                Supported formats: DICOM, JPEG, PNG, TIFF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                <FileImage className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium">Select a medical image</h3>
                <input
                  type="file"
                  accept=".dcm, .jpeg, .jpg, .png, .tiff"
                  className="hidden"
                  id="fileInput"
                  onChange={handleFileSelect}
                />
                <Button onClick={() => document.getElementById("fileInput")?.click()}>
                  Select Files
                </Button>
                {selectedFile && (
                  <p className="mt-2 text-sm">{selectedFile.name}</p>
                )}
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-4 max-h-48 w-auto rounded-md border"
                  />
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setImagePreview(null);
                }}
                disabled={!selectedFile}
              >
                Reset
              </Button>
              <Button disabled={!selectedFile || uploadState !== "idle"} onClick={handleFileUpload}>
                Upload
              </Button>
            </CardFooter>
          </Card>
        </div>
        <div className="w-[50%]">
          {loading && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing Image...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={progress} />
              </CardContent>
            </Card>
          )}

{data && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Check className="h-5 w-5 text-green-500" />
        Analysis Complete
      </CardTitle>
    </CardHeader>
    <CardContent>
      <h3 className="text-lg font-semibold">Medical Report Summary</h3>
      <p className="text-sm text-muted-foreground">
        {data?.data?.summary || "No summary available."}
      </p>

      <h4 className="mt-2 font-semibold">Medications:</h4>
      <ul className="list-disc pl-6 text-sm">
  {data?.data?.medications?.map((med, index) => (
    <li key={index}>
      <strong>{med.name}</strong> - {med.dosage}, {med.frequency} ({med.duration})
    </li>
  ))}
</ul>
      <h4 className="mt-2 font-semibold">Recommendations:</h4>
      <p className="text-sm">{data?.data?.recommendations || "No recommendations available."}</p>

      <h4 className="mt-2 font-semibold">Concerns:</h4>
      <p className="text-sm">{data?.data?.summary  || "No concerns noted in the report."}</p>
    </CardContent>
  </Card>
)}
          {error && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Upload Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-500">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
