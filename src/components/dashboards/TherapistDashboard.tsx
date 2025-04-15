import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { TherapistUser } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Calendar,
  Search,
  Plus,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock patients data
const mockPatients = [
  {
    id: "child-1",
    name: "Alex Johnson",
    age: 8,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    progress: 65,
    lastSession: "2 days ago",
    nextSession: "Tomorrow, 4:00 PM",
    focusAreas: ["S Sound", "R Sound"],
  },
  {
    id: "child-2",
    name: "Sam Taylor",
    age: 6,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
    progress: 42,
    lastSession: "1 week ago",
    nextSession: "Friday, 3:30 PM",
    focusAreas: ["L Sound", "Th Sound"],
  },
  {
    id: "child-3",
    name: "Jamie Smith",
    age: 9,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie",
    progress: 78,
    lastSession: "Yesterday",
    nextSession: "Next Monday, 5:00 PM",
    focusAreas: ["Fluency", "Articulation"],
  },
];

// Mock upcoming sessions
const mockSessions = [
  {
    id: "session-1",
    patientName: "Alex Johnson",
    patientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    date: "Today",
    time: "4:00 PM",
    duration: "30 min",
    type: "In-person",
  },
  {
    id: "session-2",
    patientName: "Jamie Smith",
    patientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie",
    date: "Tomorrow",
    time: "3:30 PM",
    duration: "45 min",
    type: "Virtual",
  },
  {
    id: "session-3",
    patientName: "Sam Taylor",
    patientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
    date: "Friday",
    time: "3:30 PM",
    duration: "30 min",
    type: "In-person",
  },
];

export default function TherapistDashboard() {
  const { user } = useAuth();
  const therapistUser = user as TherapistUser;
  const [activeTab, setActiveTab] = useState("patients");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  // Filter patients based on search query
  const filteredPatients = mockPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 bg-white">
      {/* Welcome section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {therapistUser.name}</h1>
          <p className="text-muted-foreground">
            Manage your patients and therapy sessions
          </p>
        </div>
        <img
          src={
            therapistUser.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${therapistUser.name}`
          }
          alt={therapistUser.name}
          className="w-12 h-12 rounded-full"
        />
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Patients
                </p>
                <p className="text-2xl font-bold">{mockPatients.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Today's Sessions
                </p>
                <p className="text-2xl font-bold">
                  {mockSessions.filter((s) => s.date === "Today").length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Progress
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    mockPatients.reduce(
                      (acc, patient) => acc + patient.progress,
                      0,
                    ) / mockPatients.length,
                  )}
                  %
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                  ↑
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs
        defaultValue="patients"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4 mt-6">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patients..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>

          {selectedPatient ? (
            // Patient detail view
            <div className="space-y-4">
              <Button
                variant="ghost"
                className="-ml-4"
                onClick={() => setSelectedPatient(null)}
              >
                <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                Back to patients
              </Button>

              {/* Patient details */}
              {(() => {
                const patient = mockPatients.find(
                  (p) => p.id === selectedPatient,
                );
                if (!patient) return null;

                return (
                  <>
                    <div className="flex items-center space-x-4">
                      <img
                        src={patient.avatar}
                        alt={patient.name}
                        className="w-16 h-16 rounded-full border-2 border-purple-200"
                      />
                      <div>
                        <h2 className="text-xl font-bold">{patient.name}</h2>
                        <p className="text-muted-foreground">
                          Age: {patient.age}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Progress Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Overall Progress</span>
                                <span>{patient.progress}%</span>
                              </div>
                              <Progress
                                value={patient.progress}
                                className="h-2"
                              />
                            </div>

                            <div>
                              <h4 className="text-sm font-medium mb-2">
                                Focus Areas
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {patient.focusAreas.map((area, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                                  >
                                    {area}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Session Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Last Session
                            </span>
                            <span className="text-sm">
                              {patient.lastSession}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Next Session
                            </span>
                            <span className="text-sm">
                              {patient.nextSession}
                            </span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full">
                            Schedule New Session
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Assigned Exercises</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 border rounded">
                              <div>
                                <h4 className="font-medium">
                                  S Sound Practice
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Pronunciation exercise
                                </p>
                              </div>
                              <div className="flex items-center">
                                <span className="text-sm mr-2">75%</span>
                                <Button variant="outline" size="sm">
                                  Adjust
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded">
                              <div>
                                <h4 className="font-medium">
                                  R Sound Practice
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Pronunciation exercise
                                </p>
                              </div>
                              <div className="flex items-center">
                                <span className="text-sm mr-2">30%</span>
                                <Button variant="outline" size="sm">
                                  Adjust
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Assign New Exercise
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            // Patient list view
            <div className="space-y-4">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <Card
                    key={patient.id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setSelectedPatient(patient.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={patient.avatar}
                          alt={patient.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{patient.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Age: {patient.age}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">
                              {patient.progress}%
                            </span>
                            <Progress
                              value={patient.progress}
                              className="h-2 w-16"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Next: {patient.nextSession.split(",")[0]}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No patients found</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>

          <div className="space-y-4">
            {mockSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="min-w-24 text-center">
                      <p className="font-bold">{session.date}</p>
                      <p className="text-sm">{session.time}</p>
                    </div>
                    <div className="flex-1 flex items-center">
                      <img
                        src={session.patientAvatar}
                        alt={session.patientName}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <h3 className="font-medium">{session.patientName}</h3>
                        <div className="flex text-xs text-muted-foreground space-x-2">
                          <span>{session.duration}</span>
                          <span>•</span>
                          <span>{session.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                      <Button size="sm">Start Session</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 border rounded bg-muted/20">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="font-medium">Calendar View</p>
                <p className="text-sm text-muted-foreground">
                  Weekly schedule will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Exercise Library</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Exercise
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="h-2 bg-green-500" />
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>S Sound Practice</CardTitle>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Easy
                  </span>
                </div>
                <CardDescription>
                  Pronunciation exercise for the "S" sound
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Practice making the "S" sound at the beginning of words
                </p>
                <div className="flex items-center mt-4">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                    Microphone
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded">
                    Offline Available
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  Preview
                </Button>
                <Button size="sm">Assign</Button>
              </CardFooter>
            </Card>

            <Card>
              <div className="h-2 bg-amber-500" />
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>R Sound Practice</CardTitle>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                    Medium
                  </span>
                </div>
                <CardDescription>
                  Pronunciation exercise for the "R" sound
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Practice making the "R" sound in the middle of words
                </p>
                <div className="flex items-center mt-4">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                    Microphone
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded">
                    Offline Available
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  Preview
                </Button>
                <Button size="sm">Assign</Button>
              </CardFooter>
            </Card>

            <Card>
              <div className="h-2 bg-red-500" />
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>Tongue Placement</CardTitle>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Hard
                  </span>
                </div>
                <CardDescription>
                  Articulation exercise for tongue placement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Practice correct tongue placement for difficult sounds
                </p>
                <div className="flex items-center mt-4">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded mr-2">
                    Camera
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded">
                    Offline Available
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  Preview
                </Button>
                <Button size="sm">Assign</Button>
              </CardFooter>
            </Card>

            <Card className="border-dashed bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="font-medium">Create New Exercise</p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Add a custom exercise to your library
                </p>
                <Button className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Exercise
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
