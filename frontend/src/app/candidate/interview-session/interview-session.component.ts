import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidateService } from '../../shared/services/candidate.service';
import { InterviewService } from '../../shared/services/interview.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-interview-session',
  templateUrl: './interview-session.component.html',
  styleUrls: ['./interview-session.component.css']
})
export class InterviewSessionComponent implements OnInit, OnDestroy {
  token: string = '';
  session: any = null;
  questions: any[] = [];
  currentQuestionIndex = 0;
  isLoading = true;
  error = '';
  mcqForm: FormGroup;
  openEndedForm: FormGroup;
  isSubmitting = false;
  timeRemaining = 0;
  timerSubscription?: Subscription;
  webcamEnabled = false;
  deviceInfo = '';
  sessionStarted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private candidateService: CandidateService,
    private interviewService: InterviewService
  ) {
    this.mcqForm = this.formBuilder.group({
      selectedOptions: [[], [Validators.required]]
    });
    
    this.openEndedForm = this.formBuilder.group({
      textAnswer: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.error = 'Invalid session token';
      return;
    }

    this.loadSession();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadSession(): void {
    this.isLoading = true;
    
    this.interviewService.getSessionByToken(this.token).subscribe({
      next: (session) => {
        this.session = session;
        if (session.status === 'COMPLETED' || session.status === 'EVALUATED') {
          this.router.navigate(['/candidate/session', this.token, 'results']);
          return;
        }
        
        this.deviceInfo = this.getDeviceInfo();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Failed to load interview session';
        console.error(err);
      }
    });
  }

  startSession(): void {
    this.isSubmitting = true;
    
    this.candidateService.startSession(this.token, { deviceInfo: this.deviceInfo }).subscribe({
      next: (session) => {
        this.session = session;
        this.sessionStarted = true;
        this.loadQuestions();
        this.startTimer();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || 'Failed to start session';
        console.error(err);
      }
    });
  }

  loadQuestions(): void {
    this.isLoading = true;
    
    this.candidateService.getSessionQuestions(this.token).subscribe({
      next: (questions) => {
        this.questions = questions;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Failed to load questions';
        console.error(err);
      }
    });
  }

  startTimer(): void {
    if (this.session.timeLimit) {
      this.timeRemaining = this.session.timeLimit * 60; // Convert to seconds
      this.timerSubscription = interval(1000).subscribe(() => {
        this.timeRemaining--;
        if (this.timeRemaining <= 0) {
          this.completeSession();
        }
      });
    }
  }

  submitMCQAnswer(): void {
    if (this.mcqForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const currentQuestion = this.questions[this.currentQuestionIndex];
    
    this.candidateService.submitMCQAnswer(this.token, {
      questionId: currentQuestion.id,
      selectedOptionIds: this.mcqForm.value.selectedOptions
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.nextQuestion();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || 'Failed to submit answer';
        console.error(err);
      }
    });
  }

  submitOpenEndedAnswer(): void {
    if (this.openEndedForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const currentQuestion = this.questions[this.currentQuestionIndex];
    
    this.candidateService.submitOpenEndedAnswer(this.token, {
      questionId: currentQuestion.id,
      textAnswer: this.openEndedForm.value.textAnswer
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.nextQuestion();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || 'Failed to submit answer';
        console.error(err);
      }
    });
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.resetForms();
    } else {
      this.completeSession();
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.resetForms();
    }
  }

  resetForms(): void {
    this.mcqForm.reset({ selectedOptions: [] });
    this.openEndedForm.reset({ textAnswer: '' });
  }

  completeSession(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    this.isSubmitting = true;
    
    this.candidateService.completeSession(this.token).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/candidate/session', this.token, 'results']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || 'Failed to complete session';
        console.error(err);
      }
    });
  }

  toggleOption(optionId: number): void {
    const selectedOptions = [...this.mcqForm.value.selectedOptions];
    const index = selectedOptions.indexOf(optionId);
    
    if (index === -1) {
      selectedOptions.push(optionId);
    } else {
      selectedOptions.splice(index, 1);
    }
    
    this.mcqForm.patchValue({ selectedOptions });
  }

  isOptionSelected(optionId: number): boolean {
    return this.mcqForm.value.selectedOptions.includes(optionId);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  getDeviceInfo(): string {
    return `${navigator.userAgent} | ${navigator.platform} | ${window.screen.width}x${window.screen.height}`;
  }
} 