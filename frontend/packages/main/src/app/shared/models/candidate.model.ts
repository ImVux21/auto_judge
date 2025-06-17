export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resume?: string;
  status: CandidateStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum CandidateStatus {
  NEW = "new",
  INVITED = "invited",
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  PASSED = "passed",
  FAILED = "failed",
  WITHDRAWN = "withdrawn",
}

export interface CandidateSession {
  id: string;
  candidateId: string;
  interviewId: string;
  startTime: Date;
  endTime?: Date;
  status: SessionStatus;
  score?: number;
  feedback?: string;
}

export enum SessionStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
