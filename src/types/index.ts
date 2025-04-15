export type UserRole = "child" | "parent" | "therapist" | "admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  organizationId?: string;
  createdBy?: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: "pronunciation" | "articulation";
  difficulty: "easy" | "medium" | "hard";
  completed?: boolean;
  progress?: number;
  requiresCamera?: boolean;
  requiresMicrophone?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  earned: boolean;
  earnedAt?: Date;
}

export interface ChildUser extends User {
  role: "child";
  badges: Badge[];
  exercises: Exercise[];
  avatar: string;
  points: number;
}

export interface ParentUser extends User {
  role: "parent";
  children: ChildUser[];
}

export interface TherapistUser extends User {
  role: "therapist";
  patients: ChildUser[];
}
