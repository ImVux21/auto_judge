import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
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
  @ViewChild('webcamVideo') webcamVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('webcamCanvas') webcamCanvas!: ElementRef<HTMLCanvasElement>;
  
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
  
  // Webcam variables
  webcamStream: MediaStream | null = null;
  webcamInitialized = false;
  snapshotTimerId?: number;
  
  // Snapshot variables
  baseIntervalMs = 180000; // 3 minutes
  escalatedIntervalMs = 10000; // 10 seconds
  currentIntervalMs = 180000;
  escalatedSnapshotCount = 0;
  maxEscalatedSnapshots = 6; // After 6 snapshots (1 minute) return to base interval
  
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
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    if (this.snapshotTimerId) {
      window.clearTimeout(this.snapshotTimerId);
    }
    
    // Remove event listener
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    this.stopWebcam();
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
        this.initializeWebcam();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to start session. Please try again.';
        this.submitting = false;
        this.isSubmitting = false;
        console.error('Error starting session:', err);
      }
    });
  }

  async initializeWebcam(): Promise<void> {
    try {
      this.webcamStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 320 }, 
          height: { ideal: 240 },
          facingMode: 'user'
        } 
      });
      
      if (this.webcamVideo && this.webcamVideo.nativeElement) {
        this.webcamVideo.nativeElement.srcObject = this.webcamStream;
        this.webcamInitialized = true;
        
        // Start adaptive snapshot capture
        this.startSnapshotCapture();
      }
    } catch (err) {
      console.error('Error initializing webcam:', err);
      // Don't block the session if webcam fails, just log the error
    }
  }
  
  startSnapshotCapture(): void {
    // Take an initial snapshot immediately
    setTimeout(() => {
      this.captureAndSubmitSnapshot('INITIAL');
      this.scheduleNextSnapshot();
    }, 1000);
  }
  
  scheduleNextSnapshot(): void {
    // Clear any existing timer
    if (this.snapshotTimerId) {
      window.clearTimeout(this.snapshotTimerId);
    }
    
    // Schedule next snapshot
    this.snapshotTimerId = window.setTimeout(() => {
      this.captureAndSubmitSnapshot('SCHEDULED');
      
      // If we're in escalated mode, count this snapshot
      if (this.currentIntervalMs === this.escalatedIntervalMs) {
        this.escalatedSnapshotCount++;
        
        // If we've taken enough escalated snapshots, return to base interval
        if (this.escalatedSnapshotCount >= this.maxEscalatedSnapshots) {
          this.currentIntervalMs = this.baseIntervalMs;
          this.escalatedSnapshotCount = 0;
        }
      }
      
      // Schedule the next snapshot
      this.scheduleNextSnapshot();
    }, this.currentIntervalMs);
  }
  
  handleVisibilityChange(): void {
    // When visibility changes, take a snapshot and escalate monitoring
    if (document.visibilityState === 'visible' || document.visibilityState === 'hidden') {
      const eventType = document.visibilityState === 'hidden' ? 'VISIBILITY_HIDDEN' : 'VISIBILITY_VISIBLE';
      this.captureAndSubmitSnapshot(eventType);
      
      // Escalate monitoring frequency
      this.escalateMonitoring();
    }
  }
  
  escalateMonitoring(): void {
    // Set to escalated interval and reset counter
    this.currentIntervalMs = this.escalatedIntervalMs;
    this.escalatedSnapshotCount = 0;
    
    // Reschedule next snapshot with new interval
    this.scheduleNextSnapshot();
  }
  
  captureAndSubmitSnapshot(eventType: string = 'NORMAL'): void {
    if (!this.webcamInitialized || !this.webcamVideo || !this.webcamCanvas) {
      return;
    }
    
    const video = this.webcamVideo.nativeElement;
    const canvas = this.webcamCanvas.nativeElement;
    const context = canvas.getContext('2d');
    
    if (!context) {
      return;
    }
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64 image
    try {
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.7);
      const timestamp = Date.now();
      
      // Submit the snapshot to the server with event type
      this.apiService.submitProctorSnapshot(this.sessionToken, imageBase64, timestamp, eventType)
        .subscribe({
          next: () => {
            console.log('Snapshot submitted successfully');
          },
          error: (err) => {
            console.error('Error submitting snapshot:', err);
          }
        });
    } catch (err) {
      console.error('Error capturing snapshot:', err);
    }
  }
  
  stopWebcam(): void {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => track.stop());
      this.webcamStream = null;
      this.webcamInitialized = false;
    }
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
        // Take a snapshot after submitting answer
        this.captureAndSubmitSnapshot('ANSWER_SUBMISSION');
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
        // Take a snapshot after submitting answer
        this.captureAndSubmitSnapshot('ANSWER_SUBMISSION');
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
      // Take a snapshot when navigating to next question
      this.captureAndSubmitSnapshot('QUESTION_NAVIGATION');
    } else {
      this.completeSession();
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.initializeForms();
      // Take a snapshot when navigating to previous question
      this.captureAndSubmitSnapshot('QUESTION_NAVIGATION');
    }
  }

  completeSession(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    if (this.snapshotTimerId) {
      window.clearTimeout(this.snapshotTimerId);
    }
    
    this.stopWebcam();
    
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
  
  // Monitor for keyboard shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Check for common copy/paste shortcuts
    if ((event.ctrlKey || event.metaKey) && 
        (event.key === 'c' || event.key === 'v' || event.key === 'x')) {
      this.captureAndSubmitSnapshot('KEYBOARD_SHORTCUT');
      this.escalateMonitoring();
    }
    
    // Check for PrintScreen key
    if (event.key === 'PrintScreen') {
      this.captureAndSubmitSnapshot('PRINT_SCREEN');
      this.escalateMonitoring();
    }
  }
} 