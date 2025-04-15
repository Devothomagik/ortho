import { useState, useEffect } from "react";
import { Exercise } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, Camera, Volume2, CheckCircle, XCircle } from "lucide-react";
import { useOffline } from "@/context/OfflineContext";

interface ExercisePlayerProps {
  exercise: Exercise;
  onComplete: () => void;
  onExit: () => void;
}

export default function ExercisePlayer({
  exercise,
  onComplete,
  onExit,
}: ExercisePlayerProps) {
  const { isOnline } = useOffline();
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const [progress, setProgress] = useState(0);

  // Mock exercise steps
  const steps = [
    {
      word: "Sun",
      image:
        "https://images.unsplash.com/photo-1575881875475-31023242e3f9?w=400&q=80",
      correct: true,
    },
    {
      word: "Snake",
      image:
        "https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=400&q=80",
      correct: true,
    },
    {
      word: "Star",
      image:
        "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=400&q=80",
      correct: false,
    },
    {
      word: "Smile",
      image:
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80",
      correct: true,
    },
    {
      word: "Soup",
      image:
        "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80",
      correct: true,
    },
  ];

  useEffect(() => {
    // Update progress based on current step
    setProgress(Math.round((currentStep / steps.length) * 100));
  }, [currentStep, steps.length]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setFeedback(null);

    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      // Simulate feedback (in a real app, this would be based on actual speech recognition)
      setFeedback(steps[currentStep].correct ? "correct" : "incorrect");
    }, 3000);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setFeedback(null);
    } else {
      // Exercise completed
      onComplete();
    }
  };

  const renderExerciseContent = () => {
    const currentStepData = steps[currentStep];

    return (
      <div className="space-y-6">
        {/* Exercise image */}
        <div className="rounded-lg overflow-hidden aspect-video bg-muted">
          <img
            src={currentStepData.image}
            alt={currentStepData.word}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Word to practice */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2">{currentStepData.word}</h2>
          <p className="text-muted-foreground">Say this word clearly</p>
        </div>

        {/* Recording controls */}
        <div className="flex flex-col items-center space-y-4">
          {feedback ? (
            <div className="flex flex-col items-center">
              {feedback === "correct" ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                  <p className="text-green-600 font-medium">Great job!</p>
                </>
              ) : (
                <>
                  <XCircle className="h-12 w-12 text-red-500 mb-2" />
                  <p className="text-red-600 font-medium">Try again</p>
                </>
              )}
              <Button
                className="mt-4"
                onClick={
                  feedback === "correct" ? handleNextStep : handleStartRecording
                }
              >
                {feedback === "correct" ? "Next Word" : "Try Again"}
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              className={`rounded-full p-6 ${isRecording ? "bg-red-500 hover:bg-red-600" : ""}`}
              onClick={handleStartRecording}
              disabled={isRecording}
            >
              {isRecording ? (
                <div className="flex items-center">
                  <span className="animate-pulse mr-2">Recording...</span>
                  <Mic className="h-5 w-5" />
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2">Start Recording</span>
                  <Mic className="h-5 w-5" />
                </div>
              )}
            </Button>
          )}
        </div>

        {/* Listen to example */}
        <Button variant="outline" className="w-full">
          <Volume2 className="h-4 w-4 mr-2" />
          Listen to Example
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-white">
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{exercise.title}</CardTitle>
              <CardDescription>{exercise.description}</CardDescription>
            </div>
            <div className="flex space-x-1">
              {exercise.requiresMicrophone && (
                <Mic className="h-4 w-4 text-blue-500" />
              )}
              {exercise.requiresCamera && (
                <Camera className="h-4 w-4 text-purple-500" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderExerciseContent()}</CardContent>
        <CardFooter className="flex-col space-y-4">
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex justify-between w-full">
            <Button variant="ghost" onClick={onExit}>
              Exit
            </Button>
            <div className="flex items-center text-xs">
              <span className="text-muted-foreground mr-1">
                {!isOnline && "Offline Mode"}
              </span>
              {!isOnline && (
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
