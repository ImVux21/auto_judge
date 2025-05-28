import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { Interview, InterviewSession, Question } from '../../shared/models/interview.model';

@Component({
  selector: 'app-interview-detail',
  templateUrl: './interview-detail.component.html',
  styleUrls: ['./interview-detail.component.css']
})
export class InterviewDetailComponent implements OnInit {
  interviewId!: number;
  interview: Interview | null = null;
  questions: Question[] = [];
  sessions: InterviewSession[] = [];
  loading = true;
  error = '';
  
  sessionForm!: FormGroup;
  showSessionForm = false;
  submittingSession = false;
  sessionError = '';
  sessionSuccess = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.interviewId = +this.route.snapshot.paramMap.get('id')!;
    
    this.sessionForm = this.fb.group({
      candidateEmail: ['', [Validators.required, Validators.email]],
      candidateFirstName: ['', Validators.required],
      candidateLastName: ['', Validators.required]
    });
    
    this.loadInterview();
  }

  loadInterview(): void {
    this.loading = true;
    this.apiService.getInterview(this.interviewId).subscribe({
      next: (data) => {
        this.interview = data;
        this.loadQuestions();
        this.loadSessions();
      },
      error: (err) => {
        this.error = 'Failed to load interview. Please try again later.';
        this.loading = false;
        console.error('Error loading interview:', err);
      }
    });
  }

  loadQuestions(): void {
    this.apiService.getInterviewQuestions(this.interviewId).subscribe({
      next: (data) => {
        this.questions = data;
      },
      error: (err) => {
        console.error('Error loading questions:', err);
      }
    });
  }

  loadSessions(): void {
    this.apiService.getInterviewSessions(this.interviewId).subscribe({
      next: (data) => {
        this.sessions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.loading = false;
      }
    });
  }

  toggleInterviewStatus(): void {
    if (!this.interview) return;
    
    if (this.interview.active) {
      this.apiService.deactivateInterview(this.interviewId).subscribe({
        next: (data) => {
          this.interview!.active = false;
        },
        error: (err) => {
          console.error('Error deactivating interview:', err);
        }
      });
    } else {
      this.apiService.activateInterview(this.interviewId).subscribe({
        next: (data) => {
          this.interview!.active = true;
        },
        error: (err) => {
          console.error('Error activating interview:', err);
        }
      });
    }
  }

  toggleSessionForm(): void {
    this.showSessionForm = !this.showSessionForm;
    if (!this.showSessionForm) {
      this.sessionForm.reset();
      this.sessionError = '';
      this.sessionSuccess = '';
    }
  }

  createSession(): void {
    if (this.sessionForm.invalid) return;
    
    this.submittingSession = true;
    this.sessionError = '';
    this.sessionSuccess = '';
    
    this.apiService.createSession(this.interviewId, this.sessionForm.value).subscribe({
      next: (data) => {
        this.submittingSession = false;
        this.sessionSuccess = 'Interview session created successfully!';
        this.sessions.push(data);
        
        setTimeout(() => {
          this.toggleSessionForm();
        }, 2000);
      },
      error: (err) => {
        this.submittingSession = false;
        this.sessionError = err.error?.message || 'Failed to create session. Please try again.';
        console.error('Error creating session:', err);
      }
    });
  }

  viewAnalytics(sessionId: number): void {
    this.router.navigate(['/analytics/session', sessionId]);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }
} 