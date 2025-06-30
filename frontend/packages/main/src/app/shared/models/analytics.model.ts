export interface AnalyticsData {
  id: string;
  date: Date;
  type: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface AnalyticsSummary {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  passRate: number;
}

export interface InterviewAnalytics {
  id: number;
  title: string;
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  averageTimeSpent: number;
  questionStats: QuestionStat[];
  passRate: number;
}

export interface SessionAnalytics {
  id: number;
  candidateName: string;
  interviewTitle: string;
  startTime: string;
  endTime: string;
  timeSpent: number;
  score: number;
  answers: AnswerData[];
  proctorData?: ProctorData;
}

export interface CandidateAnalytics {
  id: number;
  name: string;
  email: string;
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  sessionList: SessionSummary[];
}

export interface QuestionStat {
  questionId: number;
  questionText: string;
  averageScore: number;
  correctAnswerRate: number;
}

export interface AnswerData {
  questionId: number;
  questionText: string;
  answerText: string;
  score: number;
  evaluation?: string;
  timeSpent: number;
}

export interface SessionSummary {
  id: number;
  interviewTitle: string;
  date: string;
  score: number;
  status: string;
}

export interface ProctorData {
  totalSnapshots: number;
  flaggedSnapshots: number;
  securityViolations: number;
  securityStatus: string;
  eventStats: EventStats;
  proctorNotes?: string;
}

export interface EventStats {
  [eventType: string]: number;
}

export interface ProctorSnapshot {
  id: number;
  sessionId: number;
  timestamp: number;
  imageData: string;
  eventType: string;
  flagged: boolean;
  flagReason?: string;
}

export interface ProctorEvent {
  id: number;
  sessionId: number;
  eventType: string;
  timestamp: number;
  eventDetails: string;
  severity: number;
}

export interface SecurityStatus {
  secure: boolean;
  violationCount: number;
  statusDetails?: string;
}
