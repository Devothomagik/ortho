import { useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types";
import { createClient } from "@supabase/supabase-js";
import { createSafeContext } from "./createSafeContext";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    role: UserRole,
    username?: string,
    password?: string,
  ) => Promise<boolean>;
  logout: () => void;
  createUser: (userData: Partial<User>, password: string) => Promise<string>;
  createAdminUser: (
    name: string,
    email: string,
    password: string,
  ) => Promise<boolean>;
  assignPatientToParent: (
    patientId: string,
    parentId: string,
  ) => Promise<boolean>;
  getUsersByRole: (role: UserRole) => Promise<User[]>;
  getUsersByOrganization: (
    organizationId: string,
    role?: UserRole,
  ) => Promise<User[]>;
  changePassword: (
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) => Promise<boolean>;
}

// Create a context with default values
const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  createUser: async () => "",
  createAdminUser: async () => false,
  assignPatientToParent: async () => false,
  getUsersByRole: async () => [],
  getUsersByOrganization: async () => [],
  changePassword: async () => false,
};

// Create the context
const [AuthContext, useAuth] =
  createSafeContext<AuthContextType>(defaultContext);

// Custom hook to use the auth context is created by createSafeContext

// Provider component
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          // Fetch user profile from users table
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.session.user.id)
            .single();

          if (userError) throw userError;

          if (userData) {
            const userProfile: User = {
              id: userData.id,
              name: userData.name,
              role: userData.role as UserRole,
              avatar: userData.avatar,
              organizationId: userData.organization_id,
              createdBy: userData.created_by,
            };

            setUser(userProfile);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Fetch user profile
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (userError) {
          console.error("User data fetch error:", userError);
          return;
        }

        if (userData) {
          const userProfile: User = {
            id: userData.id,
            name: userData.name,
            role: userData.role as UserRole,
            avatar: userData.avatar,
            organizationId: userData.organization_id,
            createdBy: userData.created_by,
          };

          setUser(userProfile);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    role: UserRole,
    username?: string,
    password?: string,
  ): Promise<boolean> => {
    if (!username || !password) return false;

    try {
      // Special case for admin (for demo purposes)
      if (role === "admin" && username === "admin" && password === "admin") {
        // Create admin session
        const { data, error } = await supabase.auth.signInWithPassword({
          email: "admin@example.com",
          password: "admin123",
        });

        if (error) throw error;
        return !!data.session;
      }

      // For other users, check if username exists and sign in with email/password
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("name", username)
        .eq("role", role)
        .single();

      if (userError) {
        console.error("User lookup error:", userError);
        return false;
      }

      if (userData) {
        // Get the auth user associated with this profile
        const { data: authData, error: authError } = await supabase
          .from("auth_users")
          .select("email")
          .eq("user_id", userData.id)
          .single();

        if (authError) {
          console.error("Auth user lookup error:", authError);
          return false;
        }

        if (authData) {
          // Sign in with email and password
          const { data, error } = await supabase.auth.signInWithPassword({
            email: authData.email,
            password: password,
          });

          if (error) {
            console.error("Sign in error:", error);
            return false;
          }

          return !!data.session;
        }
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const createUser = async (
    userData: Partial<User>,
    password: string,
  ): Promise<string> => {
    if (!user) return "";

    // Only admin can create therapists, and only admin/therapists can create parents/children
    if (userData.role === "therapist" && user.role !== "admin") {
      console.error("Only admin can create therapist accounts");
      return "";
    }

    if (
      (userData.role === "parent" || userData.role === "child") &&
      user.role !== "admin" &&
      user.role !== "therapist"
    ) {
      console.error(
        "Only admin or therapists can create parent/child accounts",
      );
      return "";
    }

    try {
      // Generate a unique email based on the username
      const email = `${userData.name?.toLowerCase().replace(/\s+/g, ".")}@speechtherapy.example.com`;

      // Create auth user
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create auth user");

      const newUserId = authData.user.id;

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: newUserId,
        name: userData.name || "New User",
        role: userData.role,
        avatar:
          userData.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name || newUserId}`,
        organization_id:
          user.role === "admin"
            ? userData.organizationId || user.organizationId
            : user.organizationId,
        created_by: user.id,
      });

      if (profileError) throw profileError;

      // Store the auth user reference
      const { error: authUserError } = await supabase
        .from("auth_users")
        .insert({
          user_id: newUserId,
          email,
        });

      if (authUserError) throw authUserError;

      return newUserId;
    } catch (error) {
      console.error("Create user error:", error);
      return "";
    }
  };

  const assignPatientToParent = async (
    patientId: string,
    parentId: string,
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if both users exist and have correct roles
      const { data: patientData, error: patientError } = await supabase
        .from("users")
        .select("*")
        .eq("id", patientId)
        .eq("role", "child")
        .single();

      if (patientError) throw patientError;

      const { data: parentData, error: parentError } = await supabase
        .from("users")
        .select("*")
        .eq("id", parentId)
        .eq("role", "parent")
        .single();

      if (parentError) throw parentError;

      // Check if user has permission
      if (
        user.role !== "admin" &&
        patientData.created_by !== user.id &&
        parentData.created_by !== user.id
      ) {
        return false;
      }

      // Create or update the relationship
      const { error: relationError } = await supabase
        .from("parent_child_relationships")
        .upsert({
          parent_id: parentId,
          child_id: patientId,
        });

      if (relationError) throw relationError;

      return true;
    } catch (error) {
      console.error("Assign patient error:", error);
      return false;
    }
  };

  const getUsersByRole = async (role: UserRole): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", role);

      if (error) throw error;

      return data.map((userData) => ({
        id: userData.id,
        name: userData.name,
        role: userData.role as UserRole,
        avatar: userData.avatar,
        organizationId: userData.organization_id,
        createdBy: userData.created_by,
      }));
    } catch (error) {
      console.error("Get users by role error:", error);
      return [];
    }
  };

  const getUsersByOrganization = async (
    organizationId: string,
    role?: UserRole,
  ): Promise<User[]> => {
    try {
      let query = supabase
        .from("users")
        .select("*")
        .eq("organization_id", organizationId);

      if (role) {
        query = query.eq("role", role);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((userData) => ({
        id: userData.id,
        name: userData.name,
        role: userData.role as UserRole,
        avatar: userData.avatar,
        organizationId: userData.organization_id,
        createdBy: userData.created_by,
      }));
    } catch (error) {
      console.error("Get users by organization error:", error);
      return [];
    }
  };

  const createAdminUser = async (
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    try {
      // Create auth user
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create admin user");

      const adminId = authData.user.id;

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: adminId,
        name: name,
        role: "admin",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || adminId}`,
        organization_id: "org-1",
      });

      if (profileError) throw profileError;

      // Store the auth user reference
      const { error: authUserError } = await supabase
        .from("auth_users")
        .insert({
          user_id: adminId,
          email,
        });

      if (authUserError) throw authUserError;

      return true;
    } catch (error) {
      console.error("Create admin user error:", error);
      return false;
    }
  };

  const changePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    try {
      // Get the user's email
      const { data: authData, error: authError } = await supabase
        .from("auth_users")
        .select("email")
        .eq("user_id", userId)
        .single();

      if (authError) throw authError;
      if (!authData?.email) return false;

      // Sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authData.email,
        password: currentPassword,
      });

      if (signInError) return false;

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error("Change password error:", error);
      return false;
    }
  };

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    createUser,
    createAdminUser,
    assignPatientToParent,
    getUsersByRole,
    getUsersByOrganization,
    changePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export { useAuth };
export { AuthProvider };
export default AuthContext;
