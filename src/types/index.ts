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
  // 수영 기록 연동 정보
  swimmingRecord?: {
    id: number;
    title: string;
    totalDistance: number;
    totalDuration: number;
    poolLength: number;
    strokes: StrokeRecord[];
    calories?: number;
  };
  // 훈련 프로그램 연동 정보
  trainingProgram?: {
    id: number;
    title: string;
    difficulty: string;
    description?: string;
    visibility?: string;
    isPublished?: boolean;
  };
  // 훈련 모집 관련 정보 (category가 '훈련 모집'일 때만)
  recruitmentInfo?: {
    // 기본 모집 정보
    maxParticipants: number;
    currentParticipants: number;
    recruitmentDeadline?: string;
    status: "open" | "full" | "closed";

    // 훈련 일정 정보
    trainingType: "regular" | "one-time";
    meetingDays?: string[]; // ['monday', 'wednesday', 'friday']
    meetingTime?: string; // "19:00"
    startDate?: string;
    endDate?: string;

    // 장소 및 연락처
    location: string;
    contactInfo?: string;

    // 추가 요구사항
    requirements?: string;
    equipment?: string;
    cost?: string;

    // 특별 안내
    specialNotes?: string;
  };
}

export type PostCategory =
  | "기록 공유"
  | "팁 공유"
  | "질문"
  | "훈련 후기"
  | "훈련 모집"
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
  poolLength: number; // 수영장 길이 (미터)
  poolName?: string; // 수영장 이름 (예: "올림픽공원 수영장", "잠실 실내수영장")
  poolType?: "indoor" | "outdoor" | "mixed"; // 실내/실외/혼합
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
  visibility: "public" | "private";
  isPublished: boolean;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingSession {
  id: number;
  title: string;
  description?: string;
  // 정기 훈련용 필드들
  weekNumber?: number; // 주차 (정기 훈련일 때만)
  sessionNumber?: number; // 회차 (정기 훈련일 때만)
  // 단기 훈련용 필드들
  order?: number; // 순서 (단기 훈련일 때만)
  // 공통 필드들
  totalDistance: number;
  estimatedDuration: number;
  workout: string;
  trainingProgramId: number;
  trainingProgram?: TrainingProgram;
  userId: number;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingProgramParticipation {
  id: number;
  userId: number;
  user: User;
  trainingProgramId: number;
  trainingProgram: TrainingProgram;
  status: "active" | "completed" | "dropped";
  startDate: string;
  lastSessionDate?: string;
  progress: number; // 진행률 (0-100)
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingProgramDto {
  title: string;
  description?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
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

export interface TrainingSeries {
  id: number;
  title: string;
  description?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  type: "one-time" | "recurring";
  // 반복 설정
  repeatDays?: string[]; // ['monday', 'wednesday', 'friday']
  repeatTime?: string; // "19:00"
  duration?: number; // 분 단위
  startDate?: string;
  endDate?: string;
  // 기본 설정
  defaultLocation?: string;
  defaultMinParticipants: number;
  defaultMaxParticipants: number;
  // 상태
  isActive: boolean;
  isPublished: boolean;
  // 관계
  userId: number;
  user?: User;
  trainingProgramId: number;
  trainingProgram?: TrainingProgram;
  meetings?: TrainingMeeting[];
  createdAt: string;
  updatedAt: string;
}

export interface TrainingMeeting {
  id: number;
  title: string;
  description?: string;
  meetingDate: string;
  startTime: string;
  duration: number;
  location: string;
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;
  status: "open" | "full" | "cancelled" | "completed";
  specialNotes?: string;
  isModified: boolean;
  seriesId: number;
  series?: TrainingSeries;
  participations?: TrainingMeetingParticipation[];
  createdAt: string;
  updatedAt: string;
}

export interface TrainingMeetingParticipation {
  id: number;
  status: "confirmed" | "waiting" | "cancelled";
  notes?: string;
  isRegularParticipant: boolean;
  userId: number;
  user?: User;
  meetingId: number;
  meeting?: TrainingMeeting;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingSeriesDto {
  title: string;
  description?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  type: "one-time" | "recurring";
  repeatDays?: string[];
  repeatTime?: string;
  duration?: number;
  startDate?: string;
  endDate?: string;
  defaultLocation?: string;
  defaultMinParticipants: number;
  defaultMaxParticipants: number;
  trainingProgramId: number;
}

export interface CreateTrainingMeetingDto {
  title: string;
  description?: string;
  meetingDate: string;
  startTime: string;
  estimatedDuration: number;
  location: string;
  minParticipants: number;
  maxParticipants: number;
  specialNotes?: string;
  seriesId: number;
}

export interface JoinMeetingDto {
  meetingId: number;
  isRegularParticipant?: boolean;
  notes?: string;
}
