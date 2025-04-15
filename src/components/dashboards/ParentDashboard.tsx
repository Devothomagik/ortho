import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ParentUser, ChildUser } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Bell, BarChart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock child data
const mockChildData = {
  name: "Alex",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  weeklyProgress: 65,
  lastPractice: "2 hours ago",
  nextSession: "Tomorrow, 4:00 PM",
  badges: 2,
  exercises: [
    { name: "S Sound Practice", progress: 75, lastPracticed: "2 hours ago" },
    { name: "R Sound Practice", progress: 30, lastPracticed: "1 day ago" },
    { name: "Tongue Placement", progress: 10, lastPracticed: "3 days ago" },
  ],
  weeklyStats: [
    { day: "Mon", minutes: 15 },
    { day: "Tue", minutes: 20 },
    { day: "Wed", minutes: 10 },
    { day: "Thu", minutes: 15 },
    { day: "Fri", minutes: 0 },
    { day: "Sat", minutes: 0 },
    { day: "Sun", minutes: 0 },
  ],
};

// Mock reminders
const mockReminders = [
  { id: 1, time: "4:00 PM", days: ["Mon", "Wed", "Fri"], active: true },
  { id: 2, time: "5:30 PM", days: ["Tue", "Thu"], active: false },
];

export default function ParentDashboard() {
  const { user, getUsersByRole } = useAuth();
  const parentUser = user as ParentUser;
  const [activeTab, setActiveTab] = useState("progress");
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [assignedChildren, setAssignedChildren] = useState<ChildUser[]>([]);

  // Fetch assigned children
  useEffect(() => {
    // In a real app, this would fetch from a database
    // For now, we'll use the mock data and the getUsersByRole function
    const allChildren = getUsersByRole ? getUsersByRole("child") : [];

    // Filter children that are assigned to this parent
    // In a real app, this would be based on a relationship in the database
    // For now, we'll just use the children array on the parent user if it exists
    const children = parentUser.children || [];
    const childrenIds = Array.isArray(children) ? children : [];

    const assignedChildrenData = allChildren.filter((child) =>
      childrenIds.includes(child.id),
    ) as ChildUser[];

    // If we have assigned children, select the first one by default
    if (assignedChildrenData.length > 0 && !selectedChild) {
      setSelectedChild(assignedChildrenData[0].id);
    }

    setAssignedChildren(assignedChildrenData);
  }, [parentUser, getUsersByRole, selectedChild]);

  // Get the currently selected child data
  const currentChildData = selectedChild
    ? assignedChildren.find((child) => child.id === selectedChild)
    : assignedChildren[0];

  return (
    <div className="space-y-6 bg-white">
      {/* Welcome section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {parentUser.name}</h1>
          <p className="text-muted-foreground">
            Monitor your child's speech therapy progress
          </p>
        </div>
        <img
          src={
            parentUser.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${parentUser.name}`
          }
          alt={parentUser.name}
          className="w-12 h-12 rounded-full"
        />
      </div>

      {/* Child selector (if multiple children) */}
      {assignedChildren.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Your Children
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {assignedChildren.map((child) => (
                <Button
                  key={child.id}
                  variant={selectedChild === child.id ? "default" : "outline"}
                  className="flex items-center"
                  onClick={() => setSelectedChild(child.id)}
                >
                  <img
                    src={
                      child.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.name}`
                    }
                    alt={child.name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  {child.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Child overview */}
      {currentChildData ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Child Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <img
                src={currentChildData.avatar || mockChildData.avatar}
                alt={currentChildData.name}
                className="w-16 h-16 rounded-full border-2 border-blue-200"
              />
              <div className="flex-1">
                <h3 className="font-medium">{currentChildData.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Last practice: {mockChildData.lastPractice}</span>
                </div>
              </div>
              <div>
                <div className="text-right">
                  <span className="text-sm font-medium">Weekly Progress</span>
                  <div className="flex items-center justify-end">
                    <span className="text-lg font-bold mr-2">
                      {mockChildData.weeklyProgress}%
                    </span>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        4/7
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No children assigned to your account yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please contact your therapist or administrator.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main content tabs */}
      {currentChildData && (
        <Tabs
          defaultValue="progress"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4 mt-6">
            <h2 className="text-xl font-semibold">Exercise Progress</h2>
            <div className="space-y-4">
              {mockChildData.exercises.map((exercise, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{exercise.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          Last: {exercise.lastPracticed}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Progress
                          value={exercise.progress}
                          className="h-2 flex-1"
                        />
                        <span className="text-sm font-medium">
                          {exercise.progress}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h2 className="text-xl font-semibold mt-8">Weekly Activity</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-end justify-between h-32">
                  {mockChildData.weeklyStats.map((day, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center space-y-2"
                    >
                      <div
                        className="w-8 bg-blue-500 rounded-t"
                        style={{
                          height: `${(day.minutes / 20) * 100}%`,
                          minHeight: day.minutes > 0 ? "4px" : "0",
                        }}
                      ></div>
                      <span className="text-xs font-medium">{day.day}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Target: 15 minutes daily
                  </div>
                  <div className="text-sm font-medium">
                    Total: 60 minutes this week
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Practice Reminders</h2>
              <Button size="sm">Add Reminder</Button>
            </div>

            <div className="space-y-4">
              {mockReminders.map((reminder) => (
                <Card
                  key={reminder.id}
                  className={!reminder.active ? "opacity-60" : ""}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 mr-3 text-blue-500" />
                        <div>
                          <h3 className="font-medium">{reminder.time}</h3>
                          <p className="text-sm text-muted-foreground">
                            {reminder.days.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button
                          variant={reminder.active ? "default" : "outline"}
                          size="sm"
                        >
                          {reminder.active ? "Active" : "Inactive"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/50 border-dashed">
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-6">
                <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-medium">Next Therapy Session</h3>
                <p className="text-muted-foreground">
                  {mockChildData.nextSession}
                </p>
                <Button variant="outline" className="mt-4" size="sm">
                  Add to Calendar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Progress Reports</h2>
              <Button variant="outline" size="sm">
                Download Report
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
                <CardDescription>May 2023</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      Overall Progress
                    </h4>
                    <div className="flex items-center space-x-4">
                      <Progress value={65} className="h-2 flex-1" />
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        Practice Sessions
                      </h4>
                      <p className="text-2xl font-bold">
                        18{" "}
                        <span className="text-sm text-muted-foreground font-normal">
                          sessions
                        </span>
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        Total Practice Time
                      </h4>
                      <p className="text-2xl font-bold">
                        4.5{" "}
                        <span className="text-sm text-muted-foreground font-normal">
                          hours
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      Therapist Notes
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {currentChildData.name} is making good progress with the
                      "S" sound. Continue daily practice with the assigned
                      exercises. We'll focus on the "R" sound in our next
                      session.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sound Mastery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">S Sound</span>
                      <Progress value={75} className="h-2 w-32" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">R Sound</span>
                      <Progress value={30} className="h-2 w-32" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">L Sound</span>
                      <Progress value={90} className="h-2 w-32" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Th Sound</span>
                      <Progress value={50} className="h-2 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Consistency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          className="text-muted stroke-current"
                          strokeWidth="10"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                        <circle
                          className="text-blue-500 stroke-current"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${65 * 2.51} 251`}
                          strokeDashoffset="0"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">65%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Practice consistency this month
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
