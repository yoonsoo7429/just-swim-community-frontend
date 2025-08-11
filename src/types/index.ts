// Common types
export interface User {
  id: number;
  email: string;
  name: string;
  profileImage?: string;
  provider: string;
  providerId: string;
  level: string;
  createdAt?: string;
  updatedAt?: string;
}

// Community types
export interface Post {
  id: number;
  title: string;
  content: string;
  author: User;
  category: PostCategory;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isLiked?: boolean;
}

export type PostCategory =
  | "기록 공유"
  | "팁 공유"
  | "질문"
  | "훈련 후기"
  | "챌린지"
  | "가이드";

export interface Comment {
  id: number;
  content: string;
  author: User;
  postId: number;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked?: boolean;
}

export interface SwimmingComment {
  id: number;
  content: string;
  user: User;
  swimmingRecordId: number;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked?: boolean;
}

export interface CommunityStats {
  totalMembers: number;
  todayPosts: number;
  todayComments: number;
  activeUsers: number;
}

export interface SwimmingRecord {
  id: number;
  title: string;
  description?: string;
  poolLength: 25 | 50; // 수영장 길이 (25m 또는 50m)
  sessionStartTime: string; // HH:MM 형식
  sessionEndTime: string; // HH:MM 형식
  strokes: StrokeRecord[]; // 여러 영법과 거리
  totalDistance: number; // 총 거리 (미터)
  totalDuration: number; // 총 시간 (분)
  calories?: number;
  sessionDate?: string;
  visibility: string; // public, private, friends
  user?: User;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StrokeRecord {
  style: string;
  distance: string;
}

export interface SwimmingStats {
  totalDistance: number;
  totalDuration: number;
  totalSessions: number;
  averageDistance: number;
  averageDuration: number;
  favoriteStyle: string;
  styleBreakdown: {
    [key: string]: number;
  };
}

export interface TrainingProgram {
  id: number;
  title: string;
  description?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  totalWeeks: number;
  sessionsPerWeek: number;
  visibility: "public" | "private";
  isPublished: boolean;
  userId: number;
  user?: User;
  sessions?: TrainingSession[];
  createdAt: string;
  updatedAt: string;
}

export interface TrainingSession {
  id: number;
  title: string;
  description?: string;
  weekNumber: number;
  sessionNumber: number;
  totalDistance: number;
  estimatedDuration: number;
  workout: string;
  trainingProgramId: number;
  trainingProgram?: TrainingProgram;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingProgramDto {
  title: string;
  description?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  totalWeeks: number;
  sessionsPerWeek: number;
  visibility: "public" | "private";
  isPublished?: boolean;
}

export interface CreateTrainingSessionDto {
  title: string;
  description?: string;
  weekNumber: number;
  sessionNumber: number;
  totalDistance: number;
  estimatedDuration: number;
  workout: string;
  trainingProgramId: number;
}

export interface TrainingExercise {
  id: number;
  sessionId: number;
  name: string;
  description: string;
  distance?: number;
  time?: number;
  sets?: number;
  reps?: number;
  rest?: number;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number; // in minutes
  price: number;
  instructorId: string;
  maxStudents: number;
  currentStudents: number;
  schedule: CourseSchedule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseSchedule {
  id: string;
  courseId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  bio: string;
  specialties: string[];
  experience: number; // years
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  courseId: string;
  scheduleId: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface SignInForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

// UI Component props
export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface InputProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  error?: string;
  label?: string;
  size?: "small" | "medium" | "large";
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
  showCloseButton?: boolean;
}
