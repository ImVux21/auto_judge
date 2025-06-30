import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NeoButtonComponent, NeoCardComponent, NeoTextareaComponent } from '@autojudge/ui/dist';
import { interval, Subscription } from 'rxjs';
import { CandidateService } from '../../shared/services/candidate.service';

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
  
  // Lockdown variables
  isFullScreen = false;
  fullScreenWarningCount = 0;
  maxFullScreenWarnings = 3;
  tabSwitchWarningCount = 0;
  maxTabSwitchWarnings = 3;
  lockdownEnforced = false;
  
  // Answer forms
  mcqForm!: FormGroup;
  openEndedForm!: FormGroup;
  submitting = false;
  isSubmitting = false; // Alias for submitting
  submitError = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private candidateService = inject(CandidateService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.sessionToken = this.route.snapshot.paramMap.get('token') || '';
    this.loadSessionInfo();
    this.initializeForms();
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Add fullscreen change event listener
    document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
    document.addEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
    document.addEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this));
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    if (this.snapshotTimerId) {
      window.clearTimeout(this.snapshotTimerId);
    }
    
    // Remove event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
    document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
    document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this));
    
    this.exitLockdown();
    this.stopWebcam();
  }

  loadSessionInfo(): void {
    this.loading = true;
    this.isLoading = true;
    this.candidateService.getSessionByToken(this.sessionToken).subscribe({
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
    this.candidateService.getSessionQuestions(this.sessionToken).subscribe({
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
    
    this.candidateService.startSession(this.sessionToken, deviceInfo).subscribe({
      next: () => {
        this.sessionStarted = true;
        this.submitting = false;
        this.isSubmitting = false;
        this.initializeWebcam();
        this.enforceLockdown();
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
  
  enforceLockdown(): void {
    this.lockdownEnforced = true;
    
    // Request fullscreen mode
    this.requestFullScreen();
    
    // Disable browser features that could be used to cheat
    this.disableCopyPaste();
    
    // Set an interval to check and enforce fullscreen mode
    this.checkFullScreenInterval();
  }
  
  requestFullScreen(): void {
    const docElm = document.documentElement;
    
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    } else if ((docElm as any).webkitRequestFullscreen) { /* Safari */
      (docElm as any).webkitRequestFullscreen();
    } else if ((docElm as any).msRequestFullscreen) { /* IE11 */
      (docElm as any).msRequestFullscreen();
    } else if ((docElm as any).mozRequestFullscreen) { /* Firefox */
      (docElm as any).mozRequestFullscreen();
    }
  }
  
  handleFullscreenChange(): void {
    this.isFullScreen = !!document.fullscreenElement || 
                       !!(document as any).webkitFullscreenElement || 
                       !!(document as any).mozFullScreenElement || 
                       !!(document as any).msFullscreenElement;
    
    if (!this.isFullScreen && this.lockdownEnforced) {
      this.fullScreenWarningCount++;
      
      // Take a snapshot when exiting fullscreen
      this.captureAndSubmitSnapshot('FULLSCREEN_EXIT');
      
      if (this.fullScreenWarningCount <= this.maxFullScreenWarnings) {
        // Show warning and force back to fullscreen
        this.error = `Warning: Please remain in full-screen mode. (Warning ${this.fullScreenWarningCount}/${this.maxFullScreenWarnings})`;
        setTimeout(() => {
          if (this.lockdownEnforced) {
            this.requestFullScreen();
          }
        }, 1000);
      } else {
        // If the user has exited fullscreen too many times, flag the session as suspicious
        this.captureAndSubmitSnapshot('FULLSCREEN_VIOLATION');
      }
    } else if (this.isFullScreen && this.error && this.error.includes('full-screen mode')) {
      // Clear the error message if the user complies
      this.error = '';
    }
  }
  
  disableCopyPaste(): void {
    // This will be handled in the @HostListener events
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
  
  exitLockdown(): void {
    this.lockdownEnforced = false;
    
    // Exit full screen if we're in it
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
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
      
      if (document.visibilityState === 'hidden' && this.lockdownEnforced) {
        this.tabSwitchWarningCount++;
        
        if (this.tabSwitchWarningCount <= this.maxTabSwitchWarnings) {
          // Set error to be shown when the user returns
          this.error = `Warning: Tab/window switching detected. Please remain on the interview tab. (Warning ${this.tabSwitchWarningCount}/${this.maxTabSwitchWarnings})`;
        } else {
          this.captureAndSubmitSnapshot('TAB_SWITCH_VIOLATION');
        }
      } else if (document.visibilityState === 'visible' && this.error && this.error.includes('Tab/window switching')) {
        // Remind them they've been warned, but don't clear the error message immediately
        setTimeout(() => {
          if (this.error.includes('Tab/window switching')) {
            this.error = '';
          }
        }, 5000);
      }
      
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
      this.candidateService.submitProctorSnapshot(this.sessionToken, imageBase64, timestamp, eventType)
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
    
    this.candidateService.submitMCQAnswer(this.sessionToken, currentQuestion.id, selectedOptionIds).subscribe({
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
    
    this.candidateService.submitOpenEndedAnswer(this.sessionToken, currentQuestion.id, textAnswer).subscribe({
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
    
    this.exitLockdown();
    this.stopWebcam();
    
    this.submitting = true;
    this.isSubmitting = true;
    
    this.candidateService.completeSession(this.sessionToken).subscribe({
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
    if (this.lockdownEnforced) {
      // Check for common copy/paste shortcuts
      if ((event.ctrlKey || event.metaKey) && 
          (event.key === 'c' || event.key === 'v' || event.key === 'x')) {
        event.preventDefault();
        this.captureAndSubmitSnapshot('KEYBOARD_SHORTCUT');
        this.escalateMonitoring();
        this.error = 'Copy, cut and paste functions are disabled during the interview.';
        
        // Clear the error message after 3 seconds
        setTimeout(() => {
          if (this.error === 'Copy, cut and paste functions are disabled during the interview.') {
            this.error = '';
          }
        }, 3000);
      }
      
      // Check for PrintScreen key
      if (event.key === 'PrintScreen') {
        event.preventDefault();
        this.captureAndSubmitSnapshot('PRINT_SCREEN');
        this.escalateMonitoring();
        this.error = 'Screen capture is prohibited during the interview.';
        
        // Clear the error message after 3 seconds
        setTimeout(() => {
          if (this.error === 'Screen capture is prohibited during the interview.') {
            this.error = '';
          }
        }, 3000);
      }
      
      // Check for Alt+Tab
      if (event.altKey && event.key === 'Tab') {
        this.captureAndSubmitSnapshot('ALT_TAB');
        this.escalateMonitoring();
      }
      
      // Check for Windows key/Super key
      if (event.key === 'Meta' || event.key === 'OS') {
        this.captureAndSubmitSnapshot('SYSTEM_KEY');
        this.escalateMonitoring();
      }
    }
  }
  
  // Monitor for right-click (context menu)
  @HostListener('window:contextmenu', ['$event'])
  onRightClick(event: MouseEvent): void {
    if (this.lockdownEnforced) {
      event.preventDefault();
      this.captureAndSubmitSnapshot('CONTEXT_MENU');
      this.escalateMonitoring();
    }
  }
  
  // Monitor for cut/copy/paste events
  @HostListener('window:cut', ['$event'])
  onCut(event: ClipboardEvent): void {
    if (this.lockdownEnforced) {
      event.preventDefault();
      this.captureAndSubmitSnapshot('CLIPBOARD_CUT');
      this.escalateMonitoring();
    }
  }
  
  @HostListener('window:copy', ['$event'])
  onCopy(event: ClipboardEvent): void {
    if (this.lockdownEnforced) {
      event.preventDefault();
      this.captureAndSubmitSnapshot('CLIPBOARD_COPY');
      this.escalateMonitoring();
    }
  }
  
  @HostListener('window:paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    if (this.lockdownEnforced) {
      event.preventDefault();
      this.captureAndSubmitSnapshot('CLIPBOARD_PASTE');
      this.escalateMonitoring();
    }
  }
  
  // Monitor for browser refresh/navigation attempts
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent): void {
    if (this.lockdownEnforced && this.sessionStarted) {
      event.preventDefault();
      event.returnValue = '';
      
      // Take a snapshot when trying to leave the page
      this.captureAndSubmitSnapshot('PAGE_UNLOAD_ATTEMPT');
      return event.returnValue;
    }
  }
} 