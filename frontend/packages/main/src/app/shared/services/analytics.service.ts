import { Injectable, inject } from '@angular/core';
import { ApiService } from '@autojudge/core/dist';
import { Observable } from 'rxjs';
import { AnalyticsSummary, CandidateAnalytics, CodingAnalytics, InterviewAnalytics, ProctorEvent, ProctorSnapshot, SecurityStatus, SessionAnalytics } from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiService = inject(ApiService);

  // Dashboard and summary analytics
  getAnalyticsSummary(): Observable<AnalyticsSummary> {
    return this.apiService.get<AnalyticsSummary>({
      api: 'analytics',
      url: 'summary'
    });
  }

  getDashboardAnalytics(): Observable<any> {
    return this.apiService.get<any>({
      api: 'analytics',
      url: 'dashboard'
    });
  }

  // Interview analytics
  getInterviewAnalytics(id: number): Observable<InterviewAnalytics> {
    return this.apiService.get<InterviewAnalytics>({
      api: 'analytics',
      url: `interview/${id}`
    });
  }

  // Session analytics
  getSessionAnalytics(id: number): Observable<SessionAnalytics> {
    return this.apiService.get<SessionAnalytics>({
      api: 'analytics',
      url: `session/${id}`
    });
  }

  // Candidate analytics
  getCandidateAnalytics(candidateId: string): Observable<CandidateAnalytics> {
    return this.apiService.get<CandidateAnalytics>({
      api: 'analytics',
      url: `candidates/${candidateId}`
    });
  }

  // Coding analytics
  getCodingAnalytics(sessionId: number): Observable<CodingAnalytics> {
    return this.apiService.get<CodingAnalytics>({
      api: 'analytics',
      url: `coding/${sessionId}`
    });
  }

  getCodingTaskAnalytics(taskId: number): Observable<any> {
    return this.apiService.get<any>({
      api: 'analytics',
      url: `coding/tasks/${taskId}`
    });
  }

  getCodingLanguageDistribution(): Observable<Record<string, number>> {
    return this.apiService.get<Record<string, number>>({
      api: 'analytics',
      url: 'coding/languages'
    });
  }

  // Proctor snapshot methods
  getSessionProctorSnapshots(sessionId: number, eventType?: string): Observable<ProctorSnapshot[]> {
    const url = eventType 
      ? `api/proctor/sessions/${sessionId}/snapshots?eventType=${eventType}`
      : `api/proctor/sessions/${sessionId}/snapshots`;
      
    return this.apiService.get<ProctorSnapshot[]>({
      api: 'proctor',
      url: url
    });
  }
   
  getSessionFlaggedSnapshots(sessionId: number): Observable<ProctorSnapshot[]> {
    return this.apiService.get<ProctorSnapshot[]>({
      api: 'proctor',
      url: `sessions/${sessionId}/snapshots/flagged`
    });
  }
   
  getSessionSuspiciousSnapshots(sessionId: number): Observable<ProctorSnapshot[]> {
    return this.apiService.get<ProctorSnapshot[]>({
      api: 'proctor',
      url: `sessions/${sessionId}/snapshots/suspicious`
    });
  }

  // Proctor event methods
  getSessionProctorEvents(sessionId: number): Observable<ProctorEvent[]> {
    return this.apiService.get<ProctorEvent[]>({
      api: 'proctor',
      url: `sessions/${sessionId}/events`
    });
  }

  // Security status methods
  getSessionSecurityStatus(sessionId: number): Observable<SecurityStatus> {
    return this.apiService.get<SecurityStatus>({
      api: 'proctor',
      url: `sessions/${sessionId}/security/status`
    });
  }

  // Note management
  addProctorNote(sessionId: number, note: string): Observable<any> {
    return this.apiService.post<any>({
      api: 'proctor',
      url: `sessions/${sessionId}/notes`,
      body: { note }
    });
  }

  // Lockdown specific methods
  getSessionViolations(sessionId: number): Observable<{ violationCount: number }> {
    return this.apiService.get<{ violationCount: number }>({
      api: 'lockdown',
      url: `sessions/${sessionId}/violations`
    });
  }

  getSessionSecurityEvents(sessionId: number): Observable<ProctorEvent[]> {
    return this.apiService.get<ProctorEvent[]>({
      api: 'lockdown',
      url: `sessions/${sessionId}/events`
    });
  }

  getDetailedSecurityStatus(sessionId: number): Observable<{ secure: boolean; statusDetails: string }> {
    return this.apiService.get<{ secure: boolean; statusDetails: string }>({
      api: 'lockdown',
      url: `sessions/${sessionId}/status`
    });
  }
}
