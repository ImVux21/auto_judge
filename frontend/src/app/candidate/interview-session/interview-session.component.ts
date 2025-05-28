import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidateService } from '../../shared/services/candidate.service';
import { InterviewService } from '../../shared/services/interview.service';
import { interval, Subscription } from 'rxjs';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-interview-session',
  templateUrl: './interview-session.component.html',
  styleUrls: ['./interview-session.component.css']
})
export class InterviewSessionComponent implements OnInit, OnDestroy {
  sessionToken!: string;
  session: any = null;
  questions: any[] = [];
  currentQuestionIndex = 0;
  loading = true;
  isLoading = true; // Alias for loading
  error = '';
  sessionStarted = false;
  
  // Timer variables
  timeRemaining: number = 0;
  timerSubscription?: Subscription;
  
  // Answer forms
  mcqForm!: FormGroup;
  openEndedForm!: FormGroup;
  submitting = false;
  isSubmitting = false; // Alias for submitting
  submitError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.sessionToken = this.route.snapshot.paramMap.get('token') || '';
    this.loadSessionInfo();
    this.initializeForms();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadSessionInfo(): void {
    this.loading = true;
    this.isLoading = true;
    this.apiService.getSessionByToken(this.sessionToken).subscribe({
      next: (data) => {
        this.session = data;
        this.loadQuestions();
      },
      error: (err) => {
        this.error = 'Failed to load session information. Please check your session token.';
        this.loading = false;
        this.isLoading = false;
        console.error('Error loading session:', err);
      }
    });
  }

  loadQuestions(): void {
    this.apiService.getSessionQuestions(this.sessionToken).subscribe({
      next: (data) => {
        this.questions = data;
        this.loading = false;
        this.isLoading = false;
        this.initializeTimer();
        this.initializeForms();
      },
      error: (err) => {
        this.error = 'Failed to load questions.';
        this.loading = false;
        this.isLoading = false;
        console.error('Error loading questions:', err);
      }
    });
  }

  initializeTimer(): void {
    if (this.session && this.session.interview) {
      this.timeRemaining = this.session.interview.timeLimit * 60; // Convert minutes to seconds
      
      this.timerSubscription = interval(1000).subscribe(() => {
        this.timeRemaining--;
        
        if (this.timeRemaining <= 0) {
          this.completeSession();
        }
      });
    }
  }

  initializeForms(): void {
    // Initialize MCQ form
    this.mcqForm = this.fb.group({
      selectedOptions: [[], Validators.required]
    });
    
    // Initialize Open-ended form
    this.openEndedForm = this.fb.group({
      textAnswer: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  startSession(): void {
    this.submitting = true;
    this.isSubmitting = true;
    
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    };
    
    this.apiService.startSession(this.sessionToken, deviceInfo).subscribe({
      next: () => {
        this.sessionStarted = true;
        this.submitting = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to start session. Please try again.';
        this.submitting = false;
        this.isSubmitting = false;
        console.error('Error starting session:', err);
      }
    });
  }

  submitMCQAnswer(): void {
    if (this.mcqForm.invalid) {
      return;
    }
    
    this.submitting = true;
    this.isSubmitting = true;
    
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const selectedOptionIds = this.mcqForm.value.selectedOptions;
    
    this.apiService.submitMCQAnswer(this.sessionToken, currentQuestion.id, selectedOptionIds).subscribe({
      next: () => {
        this.submitting = false;
        this.isSubmitting = false;
        this.moveToNextQuestion();
      },
      error: (err) => {
        this.submitting = false;
        this.isSubmitting = false;
        this.error = err.error?.message || 'Failed to submit answer. Please try again.';
        console.error('Error submitting MCQ answer:', err);
      }
    });
  }

  submitOpenEndedAnswer(): void {
    if (this.openEndedForm.invalid) {
      return;
    }
    
    this.submitting = true;
    this.isSubmitting = true;
    
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const textAnswer = this.openEndedForm.value.textAnswer;
    
    this.apiService.submitOpenEndedAnswer(this.sessionToken, currentQuestion.id, textAnswer).subscribe({
      next: () => {
        this.submitting = false;
        this.isSubmitting = false;
        this.moveToNextQuestion();
      },
      error: (err) => {
        this.submitting = false;
        this.isSubmitting = false;
        this.error = err.error?.message || 'Failed to submit answer. Please try again.';
        console.error('Error submitting open-ended answer:', err);
      }
    });
  }

  moveToNextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.initializeForms();
    } else {
      this.completeSession();
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.initializeForms();
    }
  }

  completeSession(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    this.submitting = true;
    this.isSubmitting = true;
    
    this.apiService.completeSession(this.sessionToken).subscribe({
      next: () => {
        this.submitting = false;
        this.isSubmitting = false;
        this.router.navigate(['/candidate/session', this.sessionToken, 'complete']);
      },
      error: (err) => {
        this.submitting = false;
        this.isSubmitting = false;
        console.error('Error completing session:', err);
        // Still navigate to complete page even if there's an error
        this.router.navigate(['/candidate/session', this.sessionToken, 'complete']);
      }
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  toggleOption(optionId: number): void {
    const currentValue = this.mcqForm.get('selectedOptions')?.value || [];
    const currentQuestion = this.questions[this.currentQuestionIndex];
    
    // For single-choice questions (radio buttons)
    if (!currentQuestion.multipleAllowed) {
      this.mcqForm.patchValue({
        selectedOptions: [optionId]
      });
      return;
    }
    
    // For multiple-choice questions (checkboxes)
    const index = currentValue.indexOf(optionId);
    if (index === -1) {
      // Add the option
      this.mcqForm.patchValue({
        selectedOptions: [...currentValue, optionId]
      });
    } else {
      // Remove the option
      const updatedValue = [...currentValue];
      updatedValue.splice(index, 1);
      this.mcqForm.patchValue({
        selectedOptions: updatedValue
      });
    }
  }

  isOptionSelected(optionId: number): boolean {
    const selectedOptions = this.mcqForm.get('selectedOptions')?.value || [];
    return selectedOptions.includes(optionId);
  }
} 