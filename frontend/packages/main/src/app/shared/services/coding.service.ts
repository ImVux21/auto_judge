import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CodingSubmission, CodingTask, ExecutionRequest, ExecutionResponse } from '../models/coding.model';
import { BASE_URL } from '@autojudge/core';

@Injectable({
  providedIn: 'root'
})
export class CodingService {
  private http = inject(HttpClient);
  private baseUrl = inject(BASE_URL);
  private apiUrl = `${this.baseUrl}/api/coding`;

  // Interviewer methods
  getCodingTasks(): Observable<CodingTask[]> {
    return this.http.get<CodingTask[]>(`${this.apiUrl}/tasks`);
  }

  getCodingTask(id: number): Observable<CodingTask> {
    return this.http.get<CodingTask>(`${this.apiUrl}/tasks/${id}`);
  }

  createCodingTask(task: CodingTask): Observable<CodingTask> {
    return this.http.post<CodingTask>(`${this.apiUrl}/tasks`, task);
  }

  updateCodingTask(id: number, task: CodingTask): Observable<CodingTask> {
    return this.http.put<CodingTask>(`${this.apiUrl}/tasks/${id}`, task);
  }

  deleteCodingTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`);
  }

  // Candidate methods
  getCandidateTask(sessionId: string): Observable<CodingTask> {
    return this.http.get<CodingTask>(`${this.apiUrl}/sessions/${sessionId}/task`);
  }

  submitSolution(submission: CodingSubmission): Observable<CodingSubmission> {
    return this.http.post<CodingSubmission>(`${this.apiUrl}/submissions`, submission);
  }

  saveProgress(sessionId: string, taskId: number, code: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/sessions/${sessionId}/progress`, { taskId, code });
  }

  // Execution methods
  executeCode(request: ExecutionRequest): Observable<ExecutionResponse> {
    return this.http.post<ExecutionResponse>(`${this.apiUrl}/execute`, request);
  }

  // Shared methods
  getSubmission(submissionId: number): Observable<CodingSubmission> {
    return this.http.get<CodingSubmission>(`${this.apiUrl}/submissions/${submissionId}`);
  }

  getSubmissionsForSession(sessionId: string): Observable<CodingSubmission[]> {
    return this.http.get<CodingSubmission[]>(`${this.apiUrl}/sessions/${sessionId}/submissions`);
  }

  getSubmissionsForTask(taskId: number): Observable<CodingSubmission[]> {
    return this.http.get<CodingSubmission[]>(`${this.apiUrl}/tasks/${taskId}/submissions`);
  }
} 