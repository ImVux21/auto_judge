import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  getInterviewAnalytics(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/interview/${id}`);
  }

  getSessionAnalytics(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/session/${id}`);
  }
} 