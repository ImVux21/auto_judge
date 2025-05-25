import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = `${environment.apiUrl}/candidate`;

  constructor(private http: HttpClient) { }

  startSession(token: string, deviceInfo: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/session/${token}/start`, deviceInfo);
  }

  getSessionQuestions(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/session/${token}/questions`);
  }

  submitMCQAnswer(token: string, answerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/session/${token}/answer/mcq`, answerData);
  }

  submitOpenEndedAnswer(token: string, answerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/session/${token}/answer/open-ended`, answerData);
  }

  submitProctorSnapshot(token: string, imageBase64: string, timestamp: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/session/${token}/proctor/snapshot?timestamp=${timestamp}`, 
      imageBase64
    );
  }

  completeSession(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/session/${token}/complete`, {});
  }

  getSessionAnswers(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/session/${token}/answers`);
  }
} 