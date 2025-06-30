import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NeoButtonComponent, NeoCardComponent, NeoTextareaComponent } from '@autojudge/ui/dist';
import { interval, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CandidateService } from '../../shared/services/candidate.service';
import { LockdownService } from '../../shared/services/lockdown.service';
import { ProctorService } from '../../shared/services/proctor.service';

@Component({
  selector: 'app-interview-session',
  templateUrl: './interview-session.component.html',
  styleUrls: ['./interview-session.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NeoCardComponent,
    NeoButtonComponent,
    NeoTextareaComponent
  ],
  standalone: true
})
export class InterviewSessionComponent implements OnInit, OnDestroy {
  @ViewChild('webcamVideo') webcamVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('webcamCanvas') webcamCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fullscreenContainer') fullscreenContainer!: ElementRef<HTMLDivElement>;

  // Session data
  sessionToken = '';
  session: any = null;
  isLoading = true;
  error = '';
  sessionStarted = false;
  
  // Added flag for coding challenge
  hasCodingChallenge = false;
  
  // Questions data
  questions: any[] = [];
  currentQuestionIndex = 0;
  hasAnswered: boolean[] = [];
  
  // Timer
  timeRemaining = 0;
  timerSubscription?: Subscription;
  
  // Webcam/proctoring
  webcamInitialized = false;
  webcamStream: MediaStream | null = null;
  snapshotInterval?: any;
  lastSnapshotTime = 0;
  webcamError = '';
  
  // Lockdown features
  isFullScreen = false;
  lockdownEnforced = false;
  fullScreenWarningCount = 0;
  maxFullScreenWarnings = 3;
  tabSwitchWarningCount = 0;
  maxTabSwitchWarnings = 3;
  
  // Answer forms
  mcqForm!: FormGroup;
  openEndedForm!: FormGroup;
  submitting = false;
  isSubmitting = false; // Alias for submitting
  submitError = '';

  // Cleanup
  private destroy$ = new Subject<void>();

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private candidateService = inject(CandidateService);
  private proctorService = inject(ProctorService);
  private lockdownService = inject(LockdownService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.sessionToken = this.route.snapshot.paramMap.get('token') || '';
    this.loadSessionInfo();
    this.initializeForms();
    
    // Setup event listeners for security monitoring
    this.setupSecurityEventListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up subscriptions
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    // Clear intervals
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
    }
    
    // Stop webcam stream if active
    this.stopWebcam();
    
    // Exit fullscreen if active
    if (this.isFullScreen) {
      this.lockdownService.exitFullScreen();
    }
    
    // Remove event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
  }

  // Session loading and initialization
  loadSessionInfo(): void {
    this.isLoading = true;
    this.candidateService.getSessionByToken(this.sessionToken).subscribe({
      next: (data: any) => {
        this.session = data;
        // Check if this session has a coding challenge
        this.hasCodingChallenge = !!this.session.interview?.hasCodingChallenge;
        this.isLoading = false;
        
        // Load questions after session is loaded
        this.loadQuestions();
      },
      error: (err: any) => {
        this.error = 'Failed to load session: ' + (err.error?.message || err.message || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  loadQuestions(): void {
    this.candidateService.getSessionQuestions(this.sessionToken).subscribe({
      next: (data: any) => {
        this.questions = data;
        this.hasAnswered = new Array(this.questions.length).fill(false);
      },
      error: (err: any) => {
        this.error = 'Failed to load questions: ' + (err.error?.message || err.message || 'Unknown error');
      }
    });
  }

  initializeForms(): void {
    this.mcqForm = this.fb.group({
      selectedOptions: [[], Validators.required]
    });
    
    this.openEndedForm = this.fb.group({
      textAnswer: ['', Validators.required]
    });
  }

  // Session timer
  startSessionTimer(): void {
    const timeLimit = this.session.interview?.timeLimit || 60; // Default to 60 minutes
    this.timeRemaining = timeLimit * 60; // Convert to seconds
    
    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.timeRemaining--;
        
        if (this.timeRemaining <= 0) {
          this.completeSession();
        }
        
        // Take more frequent snapshots in the last 5 minutes
        if (this.timeRemaining <= 300 && this.webcamInitialized) {
          if (Date.now() - this.lastSnapshotTime > 30000) { // Every 30 seconds
            this.captureSnapshot('TIME_RUNNING_OUT');
          }
        }
      });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Webcam proctoring
  initializeWebcam(): void {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.webcamError = 'Browser does not support webcam access';
      return;
    }
    
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        this.webcamStream = stream;
        if (this.webcamVideo?.nativeElement) {
          this.webcamVideo.nativeElement.srcObject = stream;
          this.webcamInitialized = true;
          
          // Take initial snapshot
          setTimeout(() => this.captureSnapshot('INITIAL'), 1000);
          
          // Set up regular snapshots (every 2 minutes)
          this.snapshotInterval = setInterval(() => {
            this.captureSnapshot('SCHEDULED');
          }, 120000); // 2 minutes
        }
      })
      .catch((err) => {
        this.webcamError = `Failed to access webcam: ${err.message}`;
        console.error('Webcam error:', err);
      });
  }

  stopWebcam(): void {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => track.stop());
      this.webcamStream = null;
      this.webcamInitialized = false;
    }
  }

  captureSnapshot(eventType: string = 'NORMAL'): void {
    if (!this.webcamInitialized || !this.webcamVideo?.nativeElement || !this.webcamCanvas?.nativeElement) {
      return;
    }

    const video = this.webcamVideo.nativeElement;
    const canvas = this.webcamCanvas.nativeElement;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64 image
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.7); // JPEG at 70% quality
    
    // Record timestamp
    const timestamp = Date.now();
    this.lastSnapshotTime = timestamp;
    
    // Send to server
    this.candidateService.submitProctorSnapshot(this.sessionToken, imageBase64, timestamp, eventType).subscribe({
      error: (err: any) => {
        console.error('Error sending snapshot:', err);
      }
    });
  }

  // Navigation and question handling
  startSession(): void {
    // Start lockdown mode
    this.enforceLockdown();
    
    // Initialize webcam for proctoring
    this.initializeWebcam();
    
    // Start timer
    this.startSessionTimer();
    
    this.sessionStarted = true;
  }

  completeSession(): void {
    // Clean up proctoring
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
    }
    this.stopWebcam();
    
    // Exit fullscreen
    if (this.isFullScreen) {
      this.lockdownService.exitFullScreen();
    }
    
    // If there's a coding challenge and all questions are answered, go to coding challenge
    if (this.hasCodingChallenge && this.allQuestionsAnswered()) {
      this.router.navigate(['/candidate/coding', this.sessionToken]);
    } else {
      // Navigate to completion page
      this.router.navigate(['/candidate/session', this.sessionToken, 'complete']);
    }
  }

  nextQuestion(): void {
    // Take snapshot when navigating
    this.captureSnapshot('QUESTION_NAVIGATION');
    
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.resetForms();
    }
  }

  previousQuestion(): void {
    // Take snapshot when navigating
    this.captureSnapshot('QUESTION_NAVIGATION');
    
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.resetForms();
    }
  }

  resetForms(): void {
    this.mcqForm.reset();
    this.openEndedForm.reset();
    this.submitting = false;
    this.submitError = '';
  }

  // MCQ Option selection methods
  isOptionSelected(optionId: string): boolean {
    const selectedOptions = this.mcqForm.get('selectedOptions')?.value || [];
    return selectedOptions.includes(optionId);
  }

  toggleOption(optionId: string): void {
    const selectedOptions = [...(this.mcqForm.get('selectedOptions')?.value || [])];
    const index = selectedOptions.indexOf(optionId);
    
    if (index > -1) {
      selectedOptions.splice(index, 1);
    } else {
      selectedOptions.push(optionId);
    }
    
    this.mcqForm.patchValue({ selectedOptions });
    this.mcqForm.markAsTouched();
  }

  submitMCQAnswer(): void {
    if (this.mcqForm.invalid) {
      return;
    }

    const currentQuestion = this.questions[this.currentQuestionIndex];
    this.submitting = true;
    this.isSubmitting = true;
    
    // Take snapshot on submission
    this.captureSnapshot('ANSWER_SUBMISSION');

    this.candidateService.submitMCQAnswer(
      this.sessionToken,
      currentQuestion.id,
      this.mcqForm.value.selectedOptions
    ).subscribe({
      next: (response: any) => {
        this.hasAnswered[this.currentQuestionIndex] = true;
        this.submitting = false;
        this.isSubmitting = false;
        
        // Go to next question if available
        if (this.currentQuestionIndex < this.questions.length - 1) {
          this.nextQuestion();
        }
      },
      error: (err: any) => {
        this.submitError = 'Failed to submit answer: ' + (err.error?.message || err.message || 'Unknown error');
        this.submitting = false;
        this.isSubmitting = false;
      }
    });
  }

  submitOpenEndedAnswer(): void {
    if (this.openEndedForm.invalid) {
      return;
    }

    const currentQuestion = this.questions[this.currentQuestionIndex];
    this.submitting = true;
    this.isSubmitting = true;
    
    // Check for copy-paste
    const textAnswer = this.openEndedForm.value.textAnswer;
    if (this.detectPotentialCopyPaste(textAnswer)) {
      // Record security event
      this.proctorService.recordCopyPaste(this.sessionToken, textAnswer.substring(0, 100)).subscribe();
    }
    
    // Take snapshot on submission
    this.captureSnapshot('ANSWER_SUBMISSION');
    
    this.candidateService.submitOpenEndedAnswer(
      this.sessionToken,
      currentQuestion.id,
      textAnswer
    ).subscribe({
      next: (response: any) => {
        this.hasAnswered[this.currentQuestionIndex] = true;
        this.submitting = false;
        this.isSubmitting = false;
        
        // Go to next question if available
        if (this.currentQuestionIndex < this.questions.length - 1) {
          this.nextQuestion();
        }
      },
      error: (err: any) => {
        this.submitError = 'Failed to submit answer: ' + (err.error?.message || err.message || 'Unknown error');
        this.submitting = false;
        this.isSubmitting = false;
      }
    });
  }

  // Lockdown features
  enforceLockdown(): void {
    this.lockdownEnforced = true;
    
    // Request fullscreen mode
    this.requestFullScreen();
    
    // Disable browser features that could be used to cheat
    this.disableCopyPaste();
    
    // Set an interval to check and enforce fullscreen mode
    this.checkFullScreenInterval();
  }
  
  checkFullScreenInterval(): void {
    // Check every 10 seconds if still in full screen
    setTimeout(() => {
      if (this.lockdownEnforced && !this.isFullScreen) {
        this.requestFullScreen();
      }
      
      if (this.lockdownEnforced) {
        this.checkFullScreenInterval();
      }
    }, 10000);
  }

  requestFullScreen(): void {
    if (this.fullscreenContainer && !this.isFullScreen) {
      this.lockdownService.enforceFullScreen(this.fullscreenContainer.nativeElement);
    }
  }

  disableCopyPaste(): void {
    document.addEventListener('copy', (e) => {
      e.preventDefault();
      if (this.sessionToken) {
        this.lockdownService.recordCopyPaste(this.sessionToken).subscribe();
      }
    });
    
    document.addEventListener('paste', (e) => {
      e.preventDefault();
      if (this.sessionToken) {
        this.lockdownService.recordCopyPaste(this.sessionToken).subscribe();
      }
    });
    
    document.addEventListener('cut', (e) => {
      e.preventDefault();
      if (this.sessionToken) {
        this.lockdownService.recordCopyPaste(this.sessionToken).subscribe();
      }
    });
  }

  detectPotentialCopyPaste(content: string): boolean {
    // Simple heuristic check for code or complex content
    const hasCodePatterns = /function|class|public|private|import|SELECT|FROM|WHERE|<div|<span/i.test(content);
    const suspiciouslyLong = content.length > 500;
    return hasCodePatterns && suspiciouslyLong;
  }

  // Event handlers
  handleVisibilityChange = (): void => {
    if (document.hidden) {
      // Page is hidden (user switched tabs/minimized)
      this.tabSwitchWarningCount++;
      
      // Take snapshot when visibility changes
      if (this.webcamInitialized) {
        this.captureSnapshot('VISIBILITY_HIDDEN');
      }
      
      // Record security event
      if (this.sessionToken) {
        this.lockdownService.recordTabSwitch(this.sessionToken).subscribe();
      }
      
      if (this.tabSwitchWarningCount > this.maxTabSwitchWarnings) {
        this.error = 'Too many tab switches detected. Your activity has been flagged for review.';
      }
    } else {
      // Page is visible again
      if (this.webcamInitialized) {
        this.captureSnapshot('VISIBILITY_VISIBLE');
      }
    }
  };

  handleFullscreenChange = (): void => {
    this.isFullScreen = this.lockdownService.isFullScreen();
    
    if (!this.isFullScreen && this.lockdownEnforced) {
      this.fullScreenWarningCount++;
      
      // Take snapshot when exiting fullscreen
      if (this.webcamInitialized) {
        this.captureSnapshot('FULLSCREEN_EXIT');
      }
      
      // Record security event
      if (this.sessionToken) {
        this.lockdownService.recordFullscreenExit(this.sessionToken).subscribe();
      }
      
      if (this.fullScreenWarningCount <= this.maxFullScreenWarnings) {
        // Re-enter fullscreen after a short delay
        setTimeout(() => this.requestFullScreen(), 2000);
      } else {
        this.error = 'Too many fullscreen exits detected. Your activity has been flagged for review.';
      }
    }
  };

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    // Detect keyboard shortcuts
    if ((event.ctrlKey || event.metaKey) && 
        ['p', 'a', 's', 'c', 'v', 'x'].includes(event.key)) {
      
      event.preventDefault();
      
      // Record keyboard shortcut usage
      if (this.sessionToken) {
        this.lockdownService.recordKeyboardShortcut(this.sessionToken, `${event.ctrlKey ? 'Ctrl' : 'Cmd'}+${event.key}`).subscribe();
      }
      
      // Take snapshot on suspicious keyboard activity
      if (this.webcamInitialized) {
        this.captureSnapshot('KEYBOARD_SHORTCUT');
      }
    }
  }

  @HostListener('window:beforeprint')
  handlePrintAttempt(): void {
    // Record print screen attempt
    if (this.sessionToken) {
      this.lockdownService.recordPrintScreen(this.sessionToken).subscribe();
    }
    
    // Take snapshot on print attempt
    if (this.webcamInitialized) {
      this.captureSnapshot('PRINT_SCREEN');
    }
  }

  setupSecurityEventListeners(): void {
    // Tab visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Fullscreen changes
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);
  }

  // Helper method to check if all questions are answered
  allQuestionsAnswered(): boolean {
    return this.hasAnswered.every(answered => answered) && this.hasAnswered.length > 0;
  }
  
  // Method to navigate directly to coding challenge
  navigateToCodingChallenge(): void {
    // Clean up proctoring
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
    }
    this.stopWebcam();
    
    // Exit fullscreen
    if (this.isFullScreen) {
      this.lockdownService.exitFullScreen();
    }
    
    // Go to the coding challenge
    this.router.navigate(['/candidate/coding', this.sessionToken]);
  }
} 