import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useOffline } from "@/context/OfflineContext";
import { createClient } from "@supabase/supabase-js";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login, createAdminUser } = useAuth();
  const { isOnline } = useOffline();
  const [selectedRole, setSelectedRole] = useState<UserRole>("child");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminSignup, setShowAdminSignup] = useState(false);
  const [adminSignupData, setAdminSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Initialize Supabase client
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Check if admin signup has been completed
  useEffect(() => {
    const checkAdminSignup = async () => {
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", "admin_signup_completed")
          .single();

        if (error) throw error;

        // If admin signup is not completed, show the signup form
        if (data && data.value === false) {
          setShowAdminSignup(true);
        }
      } catch (error) {
        console.error("Error checking admin signup status:", error);
      }
    };

    checkAdminSignup();
  }, []);

  const handleLogin = async () => {
    // Clear previous errors
    setError("");
    setIsLoading(true);

    if (!username || !password) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(selectedRole, username, password);
      if (success) {
        navigate("/");
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role as UserRole);
    setError("");
    setSuccess("");
    setUsername("");
    setPassword("");
  };

  const handleAdminSignup = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validation
    if (
      !adminSignupData.name ||
      !adminSignupData.email ||
      !adminSignupData.password ||
      !adminSignupData.confirmPassword
    ) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    if (adminSignupData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (adminSignupData.password !== adminSignupData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Create admin user
      const success = await createAdminUser(
        adminSignupData.name,
        adminSignupData.email,
        adminSignupData.password,
      );

      if (success) {
        // Update the admin signup completed flag
        const { error: updateError } = await supabase
          .from("app_settings")
          .update({ value: true })
          .eq("key", "admin_signup_completed");

        if (updateError) throw updateError;

        setSuccess("Admin account created successfully! You can now log in.");
        setShowAdminSignup(false);
        setAdminSignupData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        setError("Failed to create admin account");
      }
    } catch (error) {
      console.error("Admin signup error:", error);
      setError("An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {showAdminSignup ? (
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Account Setup</CardTitle>
            <CardDescription>
              Create your admin account to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 p-3 rounded-md flex items-center text-red-800 text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 p-3 rounded-md flex items-center text-green-800 text-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Name</Label>
                <Input
                  id="admin-name"
                  value={adminSignupData.name}
                  onChange={(e) =>
                    setAdminSignupData({
                      ...adminSignupData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={adminSignupData.email}
                  onChange={(e) =>
                    setAdminSignupData({
                      ...adminSignupData,
                      email: e.target.value,
                    })
                  }
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={adminSignupData.password}
                  onChange={(e) =>
                    setAdminSignupData({
                      ...adminSignupData,
                      password: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-confirm-password">Confirm Password</Label>
                <Input
                  id="admin-confirm-password"
                  type="password"
                  value={adminSignupData.confirmPassword}
                  onChange={(e) =>
                    setAdminSignupData({
                      ...adminSignupData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full"
              onClick={handleAdminSignup}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Admin Account"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Speech Therapy Companion</CardTitle>
            <CardDescription>Sign in to continue</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 p-3 rounded-md flex items-center text-red-800 text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 p-3 rounded-md flex items-center text-green-800 text-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                {success}
              </div>
            )}

            <Tabs
              defaultValue="child"
              onValueChange={handleRoleChange}
              value={selectedRole}
            >
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="child">Child</TabsTrigger>
                <TabsTrigger value="parent">Parent</TabsTrigger>
                <TabsTrigger value="therapist">Therapist</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </Tabs>
          </CardContent>

          <CardFooter className="flex-col space-y-4">
            <Button
              className="w-full"
              onClick={handleLogin}
              disabled={isLoading || (!isOnline && selectedRole !== "child")}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {!isOnline && (
              <div className="w-full">
                <p className="text-sm text-amber-600 text-center">
                  You are currently offline. Only child accounts can login in
                  offline mode.
                </p>
              </div>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
