"use client"

import { useState, useEffect, useRef } from "react"
import { Dumbbell, Video, Play, Square, User, Activity, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function GymTrainerPage() {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [lastRepCount, setLastRepCount] = useState(0)
  const [userId, setUserId] = useState("user123")
  const [exerciseChoice, setExerciseChoice] = useState("1")
  const [webcamConnected, setWebcamConnected] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [currentState, setCurrentState] = useState("Ready")
  const [feedback, setFeedback] = useState("Get into position and start your exercise")
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [exercises, setExercises] = useState([
    { id: "1", name: "Squat" },
    { id: "2", name: "Arm Curl" },
    { id: "3", name: "Sit-up" },
    { id: "4", name: "Lunge" },
    { id: "5", name: "Push-up" },
  ])

  const webcamRef = useRef<HTMLVideoElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const API_BASE_URL = "http://localhost:8000/api/gymtrainer"
  const FRAME_INTERVAL = 100 // milliseconds between frame captures

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const initWebcam = async () => {
  // First make sure the video element is rendered
  if (!webcamRef.current) {
    console.error("Video element not available yet");
    toast.error("Webcam Error", {
      description: "Video element not ready. Please try again.",
    });
    return false;
  }

  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user",
      },
    });

    console.log("Got media stream:", mediaStream);

    // Now we know webcamRef.current exists
    webcamRef.current.srcObject = mediaStream;

    // Make sure the video plays
    webcamRef.current.onloadedmetadata = () => {
      webcamRef.current?.play()
        .catch(err => console.error("Error playing video:", err));
    };

    setStream(mediaStream);
    setWebcamConnected(true);
    return true;
  } catch (error) {
    console.error("Error accessing webcam:", error);
    toast.error("Webcam Error", {
      description: "Could not access your camera. Please check permissions.",
    });
    return false;
  }
};

  const captureFrame = () => {
    if (!webcamRef.current) return null

    const canvas = document.createElement("canvas")
    canvas.width = webcamRef.current.videoWidth
    canvas.height = webcamRef.current.videoHeight

    const context = canvas.getContext("2d")
    if (context) {
      context.drawImage(webcamRef.current, 0, 0, canvas.width, canvas.height)
    }

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8)
    })
  }

  const processFrame = async () => {
    if (!isSessionActive) return

    try {
      const blob = await captureFrame()
      if (!blob) return

      const formData = new FormData()
      formData.append("file", blob)
      formData.append("user_id", userId)
      formData.append("exercise_choice", exerciseChoice)

      setProcessing(true)

      // This would be a real API call in production
      // For now, we'll simulate a response
      // const response = await fetch(`${API_BASE_URL}/process-frame`, {
      //   method: 'POST',
      //   body: formData
      // })

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Simulate response
      const data = simulateResponse(lastRepCount)

      setProcessing(false)
      updateUI(data)
    } catch (error) {
      console.error("Error processing frame:", error)
      setProcessing(false)
      toast.error("Processing Error", {
        description: "Failed to process video frame.",
      })
    }
  }

  // Simulate API response for demo purposes
  const simulateResponse = (currentReps: number) => {
    const shouldIncrement = Math.random() > 0.8
    const newReps = shouldIncrement ? currentReps + 1 : currentReps

    const states = ["Starting", "Down Position", "Up Position", "Holding", "Resting"]
    const feedbacks = [
      "Good form! Keep your back straight.",
      "Go deeper on your squat for better results.",
      "Remember to breathe properly during exercise.",
      "Maintain proper form for maximum benefit.",
      "Great job! Keep up the pace.",
    ]

    return {
      reps: newReps,
      state: states[Math.floor(Math.random() * states.length)],
      feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
      exercise_type: exercises.find((ex) => ex.id === exerciseChoice)?.name || "Exercise",
    }
  }

  const updateUI = (data: any) => {
    if (data.reps !== lastRepCount) {
      setLastRepCount(data.reps)
      toast.success("Rep Completed!", {
        description: `You've completed ${data.reps} reps.`,
      })
    }

    setFeedback(data.feedback)
    setCurrentState(data.state)
  }

  const startSession = async () => {
    if (!userId.trim()) {
      toast.error("Missing User ID", {
        description: "Please enter a user ID to continue.",
      })
      return
    }

    if (!webcamConnected) {
      const success = await initWebcam()
      if (!success) return
    }

    setLoading(true)

    try {
      // This would be a real API call in production
      // For now, we'll simulate a response
      // const response = await fetch(`${API_BASE_URL}/start-session`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     user_id: userId,
      //     exercise_choice: parseInt(exerciseChoice)
      //   })
      // })

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsSessionActive(true)
      setLastRepCount(0)
      setCurrentState("Starting")
      setFeedback(`Starting ${exercises.find((ex) => ex.id === exerciseChoice)?.name || "exercise"}. Get in position.`)
      setShowSummary(false)

      // Start processing frames
      intervalRef.current = setInterval(processFrame, FRAME_INTERVAL)

      toast.success("Session Started", {
        description: "Your workout session has begun. Get ready!",
      })
    } catch (error) {
      console.error("Error starting session:", error)
      toast.error("Session Error", {
        description: "Failed to start workout session. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const endSession = async () => {
    setLoading(true)

    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      setIsSessionActive(false)

      // This would be a real API call in production
      // For now, we'll simulate a response
      // const response = await fetch(`${API_BASE_URL}/end-session`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     user_id: userId
      //   })
      // })

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate mock summary
      const mockSummary = {
        total_reps: lastRepCount,
        exercise_counts: {
          [exercises.find((ex) => ex.id === exerciseChoice)?.name || "Exercise"]: lastRepCount,
        },
        overall_feedback:
          "Great workout! You maintained good form throughout most of your session. Consider increasing intensity next time for better results.",
        muscles_worked: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
      }

      setSummary(mockSummary)
      setShowSummary(true)

      toast.success("Session Completed", {
        description: "Your workout session has been saved.",
      })
    } catch (error) {
      console.error("Error ending session:", error)
      toast.error("Session Error", {
        description: "Failed to end workout session. Your data may not be saved.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-full">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Dumbbell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gym Trainer AI</h1>
            <p className="text-muted-foreground">Your personal AI workout assistant</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Webcam Section */}
          <div className="flex flex-col gap-4">
            <Card className="backdrop-blur-sm bg-white/30 dark:bg-gray-950/30 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  <span>Workout Camera</span>
                </CardTitle>
                <CardDescription>Your AI trainer will analyze your form in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-black/10 dark:bg-black/30 rounded-lg overflow-hidden">
                  {!webcamConnected ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Video className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                      <Button onClick={initWebcam}>Enable Camera</Button>
                    </div>
                  ) : (
                    <>
                      <video ref={webcamRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-md text-sm">
                        {currentState}
                      </div>
                      {processing && (
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary" className="bg-amber-500/80 text-white animate-pulse">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Processing
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {showSummary && summary && (
              <Card className="backdrop-blur-sm bg-white/30 dark:bg-gray-950/30 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <span>Workout Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/10 rounded-lg p-4 text-center">
                      <h3 className="text-sm font-medium text-muted-foreground">Total Reps</h3>
                      <p className="text-3xl font-bold text-primary">{summary.total_reps}</p>
                    </div>

                    {Object.entries(summary.exercise_counts).map(([exercise, count]: [string, any]) => (
                      <div key={exercise} className="bg-primary/10 rounded-lg p-4 text-center">
                        <h3 className="text-sm font-medium text-muted-foreground">{exercise}</h3>
                        <p className="text-3xl font-bold text-primary">{count} reps</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Feedback</h3>
                    <p className="text-sm">{summary.overall_feedback}</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Muscles Worked</h3>
                    <div className="flex flex-wrap gap-2">
                      {summary.muscles_worked.map((muscle: string) => (
                        <Badge key={muscle} variant="secondary" className="bg-primary/20">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => setShowSummary(false)}>
                    Start New Session
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Controls Section */}
          <div className="flex flex-col gap-4">
            <Card className="backdrop-blur-sm bg-white/30 dark:bg-gray-950/30 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Session Setup</span>
                </CardTitle>
                <CardDescription>Configure your workout session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">User ID</label>
                  <Input
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    disabled={isSessionActive}
                    placeholder="Enter your user ID"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Exercise</label>
                  <Select value={exerciseChoice} onValueChange={setExerciseChoice} disabled={isSessionActive}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercises.map((exercise) => (
                        <SelectItem key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4 pt-4">
                  {!isSessionActive ? (
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={startSession}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Session
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={endSession} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Square className="mr-2 h-4 w-4" />
                          End Session
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/30 dark:bg-gray-950/30 border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <span>Workout Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="text-6xl font-bold text-primary mb-2">{lastRepCount}</div>
                  <div className="text-sm text-muted-foreground">Repetitions</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current State</span>
                    <span className="font-medium">{currentState}</span>
                  </div>
                  <Progress value={isSessionActive ? 66 : 0} className="h-2" />
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {isSessionActive ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="font-medium mb-1">Feedback</h3>
                      <p className="text-sm">{feedback}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

