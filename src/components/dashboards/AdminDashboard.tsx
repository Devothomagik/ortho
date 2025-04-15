import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, UserRole } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Users,
  Building,
  UserCheck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminDashboard() {
  const { user, createUser, getUsersByRole, assignPatientToParent } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [newUserData, setNewUserData] = useState<
    Partial<User> & { password: string }
  >({
    name: "",
    role: "therapist",
    organizationId: "org-1", // Default organization
    password: "",
  });
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [therapists, setTherapists] = useState<User[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [children, setChildren] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch users when tab changes
  const fetchUsers = async () => {
    try {
      const therapistsData = await getUsersByRole("therapist");
      const parentsData = await getUsersByRole("parent");
      const childrenData = await getUsersByRole("child");

      setTherapists(therapistsData);
      setParents(parentsData);
      setChildren(childrenData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch users when tab changes to users
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "users") {
      fetchUsers();
    }
    // Clear any errors or success messages
    setError("");
    setSuccess("");
  };

  const handleCreateUser = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validation
    if (!newUserData.name || !newUserData.role || !newUserData.password) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    if (newUserData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const newUserId = await createUser(newUserData, newUserData.password);
      if (newUserId) {
        setSuccess(`User ${newUserData.name} created successfully`);
        // Reset form
        setNewUserData({
          name: "",
          role: "therapist",
          organizationId: "org-1",
          password: "",
        });
        // Refresh user lists
        fetchUsers();
      } else {
        setError("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setError("An error occurred while creating the user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignPatient = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!selectedParent || !selectedPatient) {
      setError("Please select both a parent and a patient");
      setIsLoading(false);
      return;
    }

    try {
      const success = await assignPatientToParent(
        selectedPatient,
        selectedParent,
      );
      if (success) {
        setSuccess("Patient assigned to parent successfully");
        setSelectedParent("");
        setSelectedPatient("");
      } else {
        setError("Failed to assign patient to parent");
      }
    } catch (error) {
      console.error("Error assigning patient:", error);
      setError("An error occurred while assigning the patient");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Welcome section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users and organizations
          </p>
        </div>
        <img
          src={
            user?.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`
          }
          alt="Admin"
          className="w-12 h-12 rounded-full"
        />
      </div>

      {/* Main content tabs */}
      <Tabs
        defaultValue="users"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="create">Create User</TabsTrigger>
          <TabsTrigger value="assign">Assign Patients</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Therapists Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="mr-2 h-5 w-5" />
                  Therapists
                </CardTitle>
                <CardDescription>Manage therapist accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {therapists.length > 0 ? (
                    therapists.map((therapist) => (
                      <div
                        key={therapist.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center">
                          <img
                            src={therapist.avatar}
                            alt={therapist.name}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <span>{therapist.name}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No therapists found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Parents Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Parents
                </CardTitle>
                <CardDescription>Manage parent accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {parents.length > 0 ? (
                    parents.map((parent) => (
                      <div
                        key={parent.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center">
                          <img
                            src={parent.avatar}
                            alt={parent.name}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <span>{parent.name}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No parents found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Children Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Patients
                </CardTitle>
                <CardDescription>Manage patient accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {children.length > 0 ? (
                    children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center">
                          <img
                            src={child.avatar}
                            alt={child.name}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <span>{child.name}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No patients found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>
                Add a new therapist, parent, or patient account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 p-3 rounded-md flex items-center text-red-800 text-sm mb-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 p-3 rounded-md flex items-center text-green-800 text-sm mb-4">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter user name"
                    value={newUserData.name}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUserData.role}
                    onValueChange={(value) =>
                      setNewUserData({
                        ...newUserData,
                        role: value as UserRole,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="therapist">Therapist</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="child">Patient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={newUserData.password}
                    onChange={(e) =>
                      setNewUserData({
                        ...newUserData,
                        password: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Select
                    value={newUserData.organizationId}
                    onValueChange={(value) =>
                      setNewUserData({ ...newUserData, organizationId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="org-1">Main Organization</SelectItem>
                      {/* In a real app, this would be populated from a list of organizations */}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleCreateUser}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create User"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assign" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assign Patient to Parent</CardTitle>
              <CardDescription>
                Connect patient accounts to their parents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 p-3 rounded-md flex items-center text-red-800 text-sm mb-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 p-3 rounded-md flex items-center text-green-800 text-sm mb-4">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parent">Parent</Label>
                  <Select
                    value={selectedParent}
                    onValueChange={setSelectedParent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent" />
                    </SelectTrigger>
                    <SelectContent>
                      {parents.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {parent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient">Patient</Label>
                  <Select
                    value={selectedPatient}
                    onValueChange={setSelectedPatient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleAssignPatient}
                  disabled={isLoading || !selectedParent || !selectedPatient}
                >
                  {isLoading ? "Assigning..." : "Assign Patient to Parent"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
