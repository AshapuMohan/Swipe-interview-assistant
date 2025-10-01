// Candidate Types
export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  resumeData?: string; // base64 encoded resume data
  resumeFile?: File;
  position: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  score?: number;
  interviewDate: string;
  interviewId: string;
  answers: Answer[];
  aiSummary?: string;
  createdAt: string;
  updatedAt: string;
}

// Question Types
export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in seconds
  category: string;
  order: number;
}

// Answer Types
export interface Answer {
  questionId: string;
  question: string;
  answer: string;
  timeSpent: number; // in seconds
  score?: number;
  feedback?: string;
  timestamp: string;
}

// Interview Session Types
export interface InterviewSession {
  id: string;
  candidateId: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Answer[];
  startTime: string;
  endTime?: string;
  isComplete: boolean;
  isPaused: boolean;
  totalScore?: number;
  aiSummary?: string;
}

// Resume Data Types
export interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  rawText?: string;
}

// Timer Types
export interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
}

// AI Response Types
export interface AIQuestionResponse {
  questions: Question[];
  totalQuestions: number;
}

export interface AIScoringResponse {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface AISummaryResponse {
  summary: string;
  overallScore: number;
  technicalSkills: number;
  problemSolving: number;
  communication: number;
  recommendation: 'hire' | 'maybe' | 'reject';
}

// Redux State Types
export interface InterviewState {
  currentSession: InterviewSession | null;
  isLoading: boolean;
  error: string | null;
}

export interface CandidateState {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  interview: InterviewState;
  candidates: CandidateState;
}

// API Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}
