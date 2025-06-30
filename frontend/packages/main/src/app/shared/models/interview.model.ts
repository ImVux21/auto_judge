export interface Interview {
  id: number;
  title: string;
  jobRole: string;
  description: string;
  timeLimit: number;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  mcqCount: number;
  openEndedCount: number;
  codingTaskId?: number;
  codingTaskIds?: number[];
  hasCodingChallenge?: boolean;
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export enum InterviewStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Question {
  id: number;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN_ENDED';
  category: string;
  difficultyLevel: string;
  orderIndex: number;
  options?: Option[];
}

export interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface InterviewTemplate {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewSession {
  id: number;
  accessToken: string;
  startTime: string;
  endTime?: string;
  status: string;
  score?: number;
  evaluationSummary?: string;
  interview: Interview;
  hasCodingChallenge?: boolean;
  codingTaskId?: number;
  candidate: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}
