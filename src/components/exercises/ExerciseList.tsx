import { useState } from "react";
import { Exercise } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mic, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExercisePlayer from "./ExercisePlayer";

interface ExerciseListProps {
  exercises: Exercise[];
  onExerciseComplete: (exerciseId: string) => void;
}

export default function ExerciseList({
  exercises,
  onExerciseComplete,
}: ExerciseListProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const filteredExercises = exercises.filter((exercise) => {
    if (activeTab === "all") return true;
    if (activeTab === "pronunciation") return exercise.type === "pronunciation";
    if (activeTab === "articulation") return exercise.type === "articulation";
    return true;
  });

  const handleExerciseComplete = () => {
    if (selectedExercise) {
      onExerciseComplete(selectedExercise.id);
      setSelectedExercise(null);
    }
  };

  if (selectedExercise) {
    return (
      <ExercisePlayer
        exercise={selectedExercise}
        onComplete={handleExerciseComplete}
        onExit={() => setSelectedExercise(null)}
      />
    );
  }

  return (
    <div className="space-y-6 bg-white">
      <h2 className="text-2xl font-bold">Your Exercises</h2>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
          <TabsTrigger value="articulation">Articulation</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => (
                <Card key={exercise.id} className="overflow-hidden">
                  <div
                    className={`h-2 ${exercise.difficulty === "easy" ? "bg-green-500" : exercise.difficulty === "medium" ? "bg-amber-500" : "bg-red-500"}`}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{exercise.title}</CardTitle>
                        <CardDescription>
                          {exercise.description}
                        </CardDescription>
                      </div>
                      <div>
                        {exercise.requiresMicrophone && (
                          <Mic className="h-4 w-4 text-blue-500" />
                        )}
                        {exercise.requiresCamera && (
                          <Camera className="h-4 w-4 text-purple-500 mt-1" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{exercise.progress}%</span>
                      </div>
                      <Progress value={exercise.progress} className="h-2" />
                      <Button
                        className="w-full mt-4"
                        variant={
                          exercise.progress === 100 ? "outline" : "default"
                        }
                        onClick={() => setSelectedExercise(exercise)}
                      >
                        {exercise.progress === 100
                          ? "Practice Again"
                          : "Continue Practice"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-muted-foreground">No exercises found</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
