import { Injectable } from '@angular/core';
import { ApiService } from '@autojudge/core/dist';
import { Observable } from 'rxjs';
import { Candidate, CandidateSession } from '../models/candidate.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  constructor(private apiService: ApiService) {}

  getAllCandidates(): Observable<Candidate[]> {
    return this.apiService.get<Candidate[]>({
      api: 'candidate',
      url: 'candidates',
    });
  }

  getCandidateById(id: string): Observable<Candidate> {
    return this.apiService.get<Candidate>({
      api: 'candidate',
      url: `${id}`,
    });
  }

  createCandidate(candidate: Partial<Candidate>): Observable<Candidate> {
    return this.apiService.post<Candidate>({
      api: 'candidate',
      url: 'candidates',
      body: candidate,
    });
  }

  updateCandidate(id: string, candidate: Partial<Candidate>): Observable<Candidate> {
    return this.apiService.put<Candidate>({
      api: 'candidate',
      url: `${id}`,
      body: candidate,
    });
  }

  deleteCandidate(id: string): Observable<void> {
    return this.apiService.delete<void>({
      api: 'candidate',
      url: `${id}`,
    });
  }

  getCandidateSessions(): Observable<CandidateSession[]> {
    return this.apiService.get<CandidateSession[]>({
      api: 'candidate',
      url: 'sessions',
    });
  }

  getSessionById(sessionId: string): Observable<CandidateSession> {
    return this.apiService.get<CandidateSession>({
      api: 'sessions',
      url: `${sessionId}`,
    });
  }

  startSession(token: string, deviceInfo: any): Observable<CandidateSession> {
    return this.apiService.post<CandidateSession>({
      api: 'candidate',
      url: `session/${token}/start`,
      body: { deviceInfo },
    });
  }

  completeSession(token: string): Observable<CandidateSession> {
    return this.apiService.post<CandidateSession>({
      api: 'candidate',
      url: `session/${token}/complete`,
      body: {},
    });
  }

  getSessionByToken(token: string): Observable<any> {
    return this.apiService.get<any>({
      api: 'interview',
      url: `public/session/${token}`,
    });
  }

  getSessionQuestions(token: string): Observable<any> {
    return this.apiService.get<any>({
      api: 'candidate',
      url: `session/${token}/questions`,
    });
  }

  submitMCQAnswer(token: string, questionId: number, selectedOptionIds: number[]): Observable<any> {
    return this.apiService.post<any>({
      api: 'candidate',
      url: `session/${token}/answer/mcq`,
      body: { questionId, selectedOptionIds },
    });
  }

  submitOpenEndedAnswer(token: string, questionId: number, textAnswer: string): Observable<any> {
    return this.apiService.post<any>({
      api: 'candidate',
      url: `session/${token}/answer/open-ended`,
      body: { questionId, textAnswer },
    });
  }

  submitProctorSnapshot(token: string, imageBase64: string, timestamp: number, eventType: string = 'NORMAL'): Observable<any> {
    return this.apiService.post<any>({
      api: 'candidate',
      url: `session/${token}/proctor/snapshot?timestamp=${timestamp}&eventType=${eventType}`,
      body: imageBase64,
    });
  }

  getSessionAnswers(token: string): Observable<any> {
    return this.apiService.get<any>({
      api: 'candidate',
      url: `session/${token}/answers`,
    });
  }
}
