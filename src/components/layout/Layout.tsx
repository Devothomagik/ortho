import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useOffline } from "@/context/OfflineContext";
import { UserRole } from "@/types";
import { Wifi, WifiOff, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { isOnline } = useOffline();

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "child":
        return "bg-blue-500";
      case "parent":
        return "bg-green-500";
      case "therapist":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Speech Therapy Companion</h1>
            {user && (
              <span
                className={`px-2 py-1 rounded-full text-xs text-white ${getRoleColor(user.role)}`}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection status indicator */}
            <div className="flex items-center">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-amber-500" />
              )}
              <span className="ml-2 text-sm">
                {isOnline ? "Online" : "Offline Mode"}
              </span>
            </div>

            {/* User info and logout */}
            {user && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <img
                    src={
                      user.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                    }
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="ml-2 font-medium">{user.name}</span>
                </div>
                <Link to="/settings">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      <footer className="border-t bg-white py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Speech Therapy Companion &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
