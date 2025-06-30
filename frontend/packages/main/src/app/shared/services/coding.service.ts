import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CodingSubmission, CodingTask, ExecutionRequest, ExecutionResponse } from '../models/coding.model';
import { ApiService } from '@autojudge/core/dist';

@Injectable({
  providedIn: 'root'
})
export class CodingService {
  private apiService = inject(ApiService);

  // Interviewer methods
  getCodingTasks(): Observable<CodingTask[]> {
    return this.apiService.get<CodingTask[]>({
      api: 'coding',
      url: 'tasks',
    });
  }

  getCodingTask(id: number): Observable<CodingTask> {
    return this.apiService.get<CodingTask>({
      api: 'coding',
      url: `tasks/${id}`,
    });
  }

  createCodingTask(task: CodingTask): Observable<CodingTask> {
    return this.apiService.post<CodingTask>({
      api: 'coding',
      url: 'tasks',
      body: task,
    });
  }

  updateCodingTask(id: number, task: CodingTask): Observable<CodingTask> {
    return this.apiService.put<CodingTask>({
      api: 'coding',
      url: `tasks/${id}`,
      body: task,
    });
  }

  deleteCodingTask(id: number): Observable<void> {
    return this.apiService.delete<void>({
      api: 'coding',
      url: `tasks/${id}`,
    });
  }

  // Candidate methods
  getCandidateTask(sessionId: string): Observable<CodingTask> {
    return this.apiService.get<CodingTask>({
      api: 'coding',
      url: `sessions/${sessionId}/task`,
    });
  }

  submitSolution(submission: CodingSubmission): Observable<CodingSubmission> {
    return this.apiService.post<CodingSubmission>({
      api: 'coding',
      url: 'submissions',
      body: submission,
    });
  }

  saveProgress(sessionId: string, taskId: number, code: string): Observable<void> {
    return this.apiService.post<void>({
      api: 'coding',
      url: `sessions/${sessionId}/progress`,
      body: { taskId, code },
    });
  }

  // Execution methods
  executeCode(request: ExecutionRequest): Observable<ExecutionResponse> {
    return this.apiService.post<ExecutionResponse>({
      api: 'coding',
      url: 'execute',
      body: request,
    });
  }

  // Shared methods
  getSubmission(submissionId: number): Observable<CodingSubmission> {
    return this.apiService.get<CodingSubmission>({
      api: 'coding',
      url: `submissions/${submissionId}`,
    });
  }

  getSubmissionsForSession(sessionId: string): Observable<CodingSubmission[]> {
    return this.apiService.get<CodingSubmission[]>({
      api: 'coding',
      url: `sessions/${sessionId}/submissions`,
    });
  }

  getSubmissionsForTask(taskId: number): Observable<CodingSubmission[]> {
    return this.apiService.get<CodingSubmission[]>({
      api: 'coding',
      url: `tasks/${taskId}/submissions`,
    });
  }

  // Interview coding task management
  assignCodingTaskToInterview(interviewId: number, taskId: number): Observable<any> {
    return this.apiService.post<any>({
      api: 'coding',
      url: `interviews/${interviewId}/assign-task`,
      body: { taskId },
    });
  }
  
  assignMultipleCodingTasksToInterview(interviewId: number, taskIds: number[]): Observable<any> {
    return this.apiService.post<any>({
      api: 'coding',
      url: `interviews/${interviewId}/assign-task`,
      body: { taskIds },
    });
  }
  
  getCodingTasksForInterview(interviewId: number): Observable<CodingTask[]> {
    return this.apiService.get<CodingTask[]>({
      api: 'coding',
      url: `interviews/${interviewId}/tasks`,
    });
  }
  
  removeCodingTaskFromInterview(interviewId: number): Observable<any> {
    return this.apiService.delete<any>({
      api: 'coding',
      url: `interviews/${interviewId}/remove-task`,
    });
  }
} 