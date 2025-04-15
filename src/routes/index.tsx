import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import LoginScreen from "@/components/auth/LoginScreen";
import ChildDashboard from "@/components/dashboards/ChildDashboard";
import ParentDashboard from "@/components/dashboards/ParentDashboard";
import TherapistDashboard from "@/components/dashboards/TherapistDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import UserSettings from "@/components/settings/UserSettings";
import ExerciseList from "@/components/exercises/ExerciseList";
import { mockExercises } from "@/data/mockData";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function AppRoutes() {
  const { user } = useAuth();

  // Redirect to appropriate dashboard based on user role
  const getDashboardRoute = () => {
    if (!user) return <Navigate to="/login" replace />;

    switch (user.role) {
      case "child":
        return <ChildDashboard />;
      case "parent":
        return <ParentDashboard />;
      case "therapist":
        return <TherapistDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>{getDashboardRoute()}</Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/exercises"
        element={
          <ProtectedRoute>
            <Layout>
              <ExerciseList
                exercises={mockExercises}
                onExerciseComplete={(id) =>
                  console.log(`Exercise ${id} completed`)
                }
              />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <UserSettings />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
