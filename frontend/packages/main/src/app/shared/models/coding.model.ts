export enum ProgrammingLanguage {
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  PYTHON = 'python',
  JAVA = 'java',
  CPP = 'cpp',
  CSHARP = 'csharp'
}

export enum CodingTaskType {
  IMPLEMENTATION = 'implementation',
  DEBUGGING = 'debugging',
  CODE_REVIEW = 'code_review'
}

export interface TestCase {
  id?: number;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  order?: number;
}

export interface CodingTask {
  id?: number;
  title: string;
  description: string;
  instructions: string;
  difficulty: string;
  timeLimit: number; // in minutes
  language: ProgrammingLanguage;
  taskType: CodingTaskType;
  initialCode: string;
  solutionCode?: string;
  testCases: TestCase[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CodingSubmission {
  id?: number;
  sessionId: string;
  taskId: number;
  code: string;
  language: ProgrammingLanguage;
  submittedAt?: Date;
  isComplete: boolean;
  executionResults?: TestCaseResult[];
  candidateNotes?: string;
}

export interface TestCaseResult {
  testCaseId: number;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTime?: number; // in milliseconds
}

export interface ExecutionRequest {
  code: string;
  language: ProgrammingLanguage;
  testCases: TestCase[];
}

export interface ExecutionResponse {
  success: boolean;
  results: TestCaseResult[];
  compilationError?: string;
  executionError?: string;
} 