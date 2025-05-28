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
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Question {
  id: number;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN_ENDED';
  category: string;
  difficulty: string;
  orderIndex: number;
  options?: Option[];
}

export interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface InterviewSession {
  id: number;
  token: string;
  startTime: string;
  endTime?: string;
  status: string;
  score?: number;
  evaluationSummary?: string;
  interview: Interview;
  candidate: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Answer {
  id: number;
  textAnswer?: string;
  selectedOptions?: Option[];
  score?: number;
  aiEvaluation?: string;
  submittedAt: string;
  question: Question;
  session: InterviewSession;
} 