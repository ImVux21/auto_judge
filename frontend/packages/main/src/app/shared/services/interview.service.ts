import { Injectable } from '@angular/core';
import { ApiService } from '@autojudge/core/dist';
import { Observable } from 'rxjs';
import { Interview, InterviewSession, InterviewStatus, Question } from '../models/interview.model';



@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  constructor(private apiService: ApiService) {}

  getAllInterviews(): Observable<Interview[]> {
    return this.apiService.get<Interview[]>({
      api: 'interview',
      url: '',
    });
  }

  getInterviewById(id: string): Observable<Interview> {
    return this.apiService.get<Interview>({
      api: 'interview',
      url: `${id}`,
    });
  }

  updateInterview(id: number, interview: Partial<Interview>): Observable<Interview> {
    return this.apiService.put<Interview>({
      api: 'interview',
      url: `${id}`,
      body: interview,
    });
  }

  deleteInterview(id: string): Observable<void> {
    return this.apiService.delete<void>({
      api: 'interview',
      url: `${id}`,
    });
  }

  updateInterviewStatus(id: string, status: InterviewStatus): Observable<Interview> {
    return this.apiService.put<Interview>({
      api: 'interview',
      url: `${id}/status`,
      body: { status },
    });
  }

  // Questions
  addQuestion(interviewId: string, question: Question): Observable<Interview> {
    return this.apiService.post<Interview>({
      api: 'interview',
      url: `${interviewId}/questions`,
      body: question,
    });
  }

  updateQuestion(interviewId: string, questionId: string, question: Partial<Question>): Observable<Interview> {
    return this.apiService.put<Interview>({
      api: 'interview',
      url: `${interviewId}/questions/${questionId}`,
      body: question,
    });
  }

  deleteQuestion(interviewId: string, questionId: string): Observable<Interview> {
    return this.apiService.delete<Interview>({
      api: 'interview',
      url: `${interviewId}/questions/${questionId}`,
    });
  }

  // Sessions
  getSessionById(sessionId: string): Observable<InterviewSession> {
    return this.apiService.get<InterviewSession>({
      api: 'sessions',
      url: `${sessionId}`,
    });
  }

  scheduleInterview(interviewId: string, candidateId: string, startTime: Date): Observable<InterviewSession> {
    return this.apiService.post<InterviewSession>({
      api: 'interview',
      url: `${interviewId}/schedule`,
      body: {
        candidateId,
        startTime: startTime.toISOString()
      },
    });
  }

  evaluateSession(sessionId: string, evaluation: { questionId: string, score: number, feedback?: string }[]): Observable<InterviewSession> {
    return this.apiService.post<InterviewSession>({
      api: 'sessions',
      url: `${sessionId}/evaluate`,
      body: { evaluation },
    });
  }

  // Interviewer endpoints
  createInterview(data: any): Observable<any> {
    return this.apiService.post<any>({
      api: 'interview',
      url: 'create',
      body: data,
    });
  }

  getInterviews(): Observable<any> {
    return this.apiService.get<any>({
      api: 'interview',
      url: 'list',
    });
  }

  getInterview(id: number): Observable<any> {
    return this.apiService.get<any>({
      api: 'interview',
      url: `${id}`,
    });
  }

  getInterviewQuestions(id: number): Observable<any> {
    return this.apiService.get<any>({
      api: 'interview',
      url: `${id}/questions`,
    });
  }

  createSession(interviewId: number, data: any): Observable<any> {
    return this.apiService.post<any>({
      api: 'interview',
      url: `${interviewId}/session/create`,
      body: data,
    });
  }

  getInterviewSessions(interviewId: number): Observable<any> {
    return this.apiService.get<any>({
      api: 'interview',
      url: `${interviewId}/sessions`,
    });
  }

  activateInterview(id: number): Observable<any> {
    return this.apiService.put<any>({
      api: 'interview',
      url: `${id}/activate`,
      body: {},
    });
  }

  deactivateInterview(id: number): Observable<any> {
    return this.apiService.put<any>({
      api: 'interview',
      url: `${id}/deactivate`,
      body: {},
    });
  }
}
