import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = `${environment.apiUrl}/interview`;

  constructor(private http: HttpClient) { }

  // Interviewer endpoints
  createInterview(interviewData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, interviewData);
  }

  getInterviews(): Observable<any> {
    return this.http.get(`${this.apiUrl}/list`);
  }

  getInterview(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getInterviewQuestions(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/questions`);
  }

  createSession(interviewId: number, sessionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${interviewId}/session/create`, sessionData);
  }

  getInterviewSessions(interviewId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${interviewId}/sessions`);
  }

  activateInterview(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateInterview(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/deactivate`, {});
  }

  // Public endpoints for candidates
  getSessionByToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/public/session/${token}`);
  }
} 