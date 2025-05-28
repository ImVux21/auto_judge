import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  // Auth endpoints
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/signin`, { email, password });
  }

  register(firstName: string, lastName: string, email: string, password: string, roles?: string[]): Observable<any> {
    return this.http.post(`${API_URL}/auth/signup`, { firstName, lastName, email, password, roles });
  }

  // Interviewer endpoints
  createInterview(data: any): Observable<any> {
    return this.http.post(`${API_URL}/interview/create`, data);
  }

  getInterviews(): Observable<any> {
    return this.http.get(`${API_URL}/interview/list`);
  }

  getInterview(id: number): Observable<any> {
    return this.http.get(`${API_URL}/interview/${id}`);
  }

  getInterviewQuestions(id: number): Observable<any> {
    return this.http.get(`${API_URL}/interview/${id}/questions`);
  }

  createSession(interviewId: number, data: any): Observable<any> {
    return this.http.post(`${API_URL}/interview/${interviewId}/session/create`, data);
  }

  getInterviewSessions(interviewId: number): Observable<any> {
    return this.http.get(`${API_URL}/interview/${interviewId}/sessions`);
  }

  activateInterview(id: number): Observable<any> {
    return this.http.put(`${API_URL}/interview/${id}/activate`, {});
  }

  deactivateInterview(id: number): Observable<any> {
    return this.http.put(`${API_URL}/interview/${id}/deactivate`, {});
  }

  // Candidate endpoints
  getSessionByToken(token: string): Observable<any> {
    return this.http.get(`${API_URL}/interview/public/session/${token}`);
  }

  startSession(token: string, deviceInfo: any): Observable<any> {
    return this.http.post(`${API_URL}/candidate/session/${token}/start`, { deviceInfo });
  }

  getSessionQuestions(token: string): Observable<any> {
    return this.http.get(`${API_URL}/candidate/session/${token}/questions`);
  }

  submitMCQAnswer(token: string, questionId: number, selectedOptionIds: number[]): Observable<any> {
    return this.http.post(`${API_URL}/candidate/session/${token}/answer/mcq`, { questionId, selectedOptionIds });
  }

  submitOpenEndedAnswer(token: string, questionId: number, textAnswer: string): Observable<any> {
    return this.http.post(`${API_URL}/candidate/session/${token}/answer/open-ended`, { questionId, textAnswer });
  }

  submitProctorSnapshot(token: string, imageBase64: string, timestamp: number): Observable<any> {
    return this.http.post(`${API_URL}/candidate/session/${token}/proctor/snapshot?timestamp=${timestamp}`, imageBase64);
  }

  completeSession(token: string): Observable<any> {
    return this.http.post(`${API_URL}/candidate/session/${token}/complete`, {});
  }

  getSessionAnswers(token: string): Observable<any> {
    return this.http.get(`${API_URL}/candidate/session/${token}/answers`);
  }

  // Analytics endpoints
  getDashboardData(): Observable<any> {
    return this.http.get(`${API_URL}/analytics/dashboard`);
  }

  getInterviewAnalytics(id: number): Observable<any> {
    return this.http.get(`${API_URL}/analytics/interview/${id}`);
  }

  getSessionAnalytics(id: number): Observable<any> {
    return this.http.get(`${API_URL}/analytics/session/${id}`);
  }
} 