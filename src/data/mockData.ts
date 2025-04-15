import { Exercise, Badge } from "@/types";

// Mock exercises
export const mockExercises: Exercise[] = [
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
export const mockBadges: Badge[] = [
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

// Mock users
export const mockUsers = {
  child: {
    id: "child-1",
    name: "Alex",
    role: "child",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    badges: mockBadges,
    exercises: mockExercises,
    points: 250,
  },
  parent: {
    id: "parent-1",
    name: "Taylor",
    role: "parent",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
    children: [
      {
        id: "child-1",
        name: "Alex",
        role: "child",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        badges: mockBadges,
        exercises: mockExercises,
        points: 250,
      },
    ],
  },
  therapist: {
    id: "therapist-1",
    name: "Dr. Morgan",
    role: "therapist",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan",
    patients: [
      {
        id: "child-1",
        name: "Alex Johnson",
        role: "child",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        badges: mockBadges,
        exercises: mockExercises,
        points: 250,
      },
      {
        id: "child-2",
        name: "Sam Taylor",
        role: "child",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
        badges: [],
        exercises: [],
        points: 100,
      },
    ],
  },
};
