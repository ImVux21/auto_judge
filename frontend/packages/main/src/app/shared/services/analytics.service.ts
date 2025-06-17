import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AnalyticsData, AnalyticsSummary } from '../models/analytics.model';
import { ApiService } from '@autojudge/core/dist';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiService = inject(ApiService);

  getCandidateAnalytics(startDate?: Date, endDate?: Date): Observable<AnalyticsData[]> {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    
    return this.apiService.get<AnalyticsData[]>({
      api: 'analytics',
      url: 'candidates',
      query: params
    });
  }

  getAnalyticsSummary(): Observable<AnalyticsSummary> {
    return this.apiService.get<AnalyticsSummary>({
      api: 'analytics',
      url: 'summary'
    });
  }

  trackEvent(eventName: string, eventData: Record<string, any>): Observable<void> {
    return this.apiService.post<void>({
      api: 'analytics',
      url: 'events',
      body: {
        eventName,
        eventData,
        timestamp: new Date().toISOString()
      }
    });
  }

  getDashboardData(): Observable<any> {
    return this.apiService.get<any>({
      api: 'analytics',
      url: 'dashboard'
    });
  }

  getInterviewAnalytics(id: number): Observable<any> {
    return this.apiService.get<any>({
      api: 'analytics',
      url: `interview/${id}`
    });
  }

  getSessionAnalytics(id: number): Observable<any> {
    return this.apiService.get<any>({
      api: 'analytics',
      url: `session/${id}`
    });
  }
  
  getSessionProctorSnapshots(sessionId: number, eventType?: string): Observable<any> {
    const params: any = {};
    if (eventType) params.eventType = eventType;
    return this.apiService.get<any>({
      api: 'analytics',
      url: `session/${sessionId}/proctor/snapshots`,
      query: params
    });
  }
  
  getSessionSuspiciousSnapshots(sessionId: number): Observable<any> {
    return this.apiService.get<any>({
      api: 'analytics',
      url: `session/${sessionId}/proctor/snapshots/suspicious`
    });
  }
  
  getProctorSnapshot(sessionId: number, snapshotId: number): Observable<any> {
    return this.apiService.get<any>({
      api: 'analytics',
      url: `session/${sessionId}/proctor/snapshots/${snapshotId}`
    });
  }
}
