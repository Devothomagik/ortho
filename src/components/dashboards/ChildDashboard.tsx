import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ChildUser, Exercise } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, Mic, Camera, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock exercises
const mockExercises: Exercise[] = [
  {
    id: "ex1",
    title: "S Sound Practice",
    description: 'Practice making the "S" sound at the beginning of words',
    type: "pronunciation",
    difficulty: "easy",
    requiresMicrophone: true,
    progress: 75,
  },
  {
    id: "ex2",
    title: "R Sound Practice",
    description: 'Practice making the "R" sound in the middle of words',
    type: "pronunciation",
    difficulty: "medium",
    requiresMicrophone: true,
    progress: 30,
  },
  {
    id: "ex3",
    title: "Tongue Placement",
    description: "Practice correct tongue placement for difficult sounds",
    type: "articulation",
    difficulty: "hard",
    requiresCamera: true,
    progress: 10,
  },
];

// Mock badges
const mockBadges = [
  {
    id: "badge1",
    name: "First Exercise",
    description: "Completed your first exercise",
    image: "🏆",
    earned: true,
    earnedAt: new Date("2023-06-15"),
  },
  {
    id: "badge2",
    name: "Practice Streak",
    description: "Practiced for 3 days in a row",
    image: "🔥",
    earned: true,
    earnedAt: new Date("2023-06-18"),
  },
  {
    id: "badge3",
    name: "Sound Master",
    description: "Mastered a difficult sound",
    image: "🌟",
    earned: false,
  },
];

export default function ChildDashboard() {
  const { user } = useAuth();
  const childUser = user as ChildUser;
  const [activeTab, setActiveTab] = useState("exercises");

  return (
    <div className="space-y-6 bg-white">
      {/* Welcome section with avatar */}
      <div className="flex items-center space-x-4">
        <img
          src={
            childUser.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${childUser.name}`
          }
          alt={childUser.name}
          className="w-16 h-16 rounded-full border-4 border-blue-200"
        />
        <div>
          <h1 className="text-2xl font-bold">Hi, {childUser.name}!</h1>
          <p className="text-muted-foreground">Ready for today's practice?</p>
        </div>
      </div>

      {/* Points and progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Your Points
                </p>
                <p className="text-2xl font-bold">250</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Badges Earned
                </p>
                <p className="text-2xl font-bold">
                  {mockBadges.filter((b) => b.earned).length}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Weekly Progress
                </p>
                <p className="text-2xl font-bold">65%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  4/7
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs
        defaultValue="exercises"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="avatar">My Avatar</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">Your Exercises</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockExercises.map((exercise) => (
              <Card key={exercise.id} className="overflow-hidden">
                <div
                  className={`h-2 ${exercise.difficulty === "easy" ? "bg-green-500" : exercise.difficulty === "medium" ? "bg-amber-500" : "bg-red-500"}`}
                />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{exercise.title}</CardTitle>
                      <CardDescription>{exercise.description}</CardDescription>
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
                    >
                      {exercise.progress === 100
                        ? "Practice Again"
                        : "Continue Practice"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">Your Badges</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mockBadges.map((badge) => (
              <Card
                key={badge.id}
                className={`${!badge.earned ? "opacity-50" : ""}`}
              >
                <CardHeader className="text-center pb-2">
                  <div className="text-4xl mb-2">{badge.image}</div>
                  <CardTitle className="text-lg">{badge.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {badge.description}
                  </p>
                  {badge.earned ? (
                    <p className="text-xs text-green-600 mt-2">
                      Earned on {badge.earnedAt?.toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 mt-2">
                      Not yet earned
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="avatar" className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">Customize Your Avatar</h2>
          <div className="flex flex-col items-center space-y-6">
            <div className="border-4 border-blue-200 rounded-full p-2">
              <img
                src={
                  childUser.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${childUser.name}`
                }
                alt="Your Avatar"
                className="w-32 h-32 rounded-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <Button variant="outline">Change Style</Button>
              <Button>Save Avatar</Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Earn more points to unlock special avatar items!
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
