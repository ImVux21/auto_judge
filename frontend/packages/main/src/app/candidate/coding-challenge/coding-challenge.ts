import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NeoButtonComponent, NeoCardComponent, NeoCodeEditorComponent, NeoTextareaComponent } from '@autojudge/ui';
import { interval, Subscription } from 'rxjs';
import { CandidateService } from '../../shared/services/candidate.service';
import { CodingService } from '../../shared/services/coding.service';
import { CodingSubmission, CodingTask, ExecutionRequest, ExecutionResponse, TestCaseResult } from '../../shared/models/coding.model';

@Component({
  selector: 'app-coding-challenge',
  templateUrl: './coding-challenge.html',
  styleUrls: ['./coding-challenge.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NeoCardComponent,
    NeoButtonComponent,
    NeoTextareaComponent,
    NeoCodeEditorComponent
  ]
})
export class CodingChallengeComponent implements OnInit, OnDestroy {
  @ViewChild('fullscreenContainer') fullscreenContainer!: ElementRef;
  
  sessionToken!: string;
  codingTask: CodingTask | null = null;
  loading = true;
  error = '';
  isSubmitting = false;
  executionResults: TestCaseResult[] = [];
  isExecuting = false;
  executionError = '';
  saveTimeout: any;

  // Timer variables
  timeRemaining = 0;
  timerSubscription?: Subscription;

  // Lockdown variables
  isFullScreen = false;
  fullScreenWarningCount = 0;
  maxFullScreenWarnings = 3;
  tabSwitchWarningCount = 0;
  maxTabSwitchWarnings = 3;
  lockdownEnforced = false;

  // Form
  codeForm!: FormGroup;
  notesForm!: FormGroup;
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private candidateService = inject(CandidateService);
  private codingService = inject(CodingService);
  private fb = inject(FormBuilder);
  
  ngOnInit(): void {
    this.sessionToken = this.route.snapshot.paramMap.get('token') || '';
    this.initForms();
    this.loadCodingTask();
    
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
    
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    // Remove event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
    document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
    document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this));
    
    this.exitLockdown();
  }

  initForms(): void {
    this.codeForm = this.fb.group({
      code: ['', Validators.required]
    });
    
    this.notesForm = this.fb.group({
      notes: ['']
    });
    
    // Auto-save code every 30 seconds
    this.codeForm.get('code')?.valueChanges.subscribe(val => {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }
      
      this.saveTimeout = setTimeout(() => {
        this.saveProgress();
      }, 30000);
    });
  }

  loadCodingTask(): void {
    this.loading = true;
    
    this.codingService.getCandidateTask(this.sessionToken).subscribe({
      next: (task) => {
        this.codingTask = task;
        this.codeForm.patchValue({ code: task.initialCode });
        this.initializeTimer();
        this.loading = false;
        this.enforceLockdown();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load coding task. Please check your session token.';
        console.error('Error loading coding task:', err);
      }
    });
  }

  initializeTimer(): void {
    if (this.codingTask) {
      this.timeRemaining = this.codingTask.timeLimit * 60; // Convert minutes to seconds
      
      this.timerSubscription = interval(1000).subscribe(() => {
        this.timeRemaining--;
        
        if (this.timeRemaining <= 0) {
          this.submitSolution();
        }
      });
    }
  }

  saveProgress(): void {
    if (!this.codingTask || !this.sessionToken) return;
    
    const code = this.codeForm.get('code')?.value;
    
    this.codingService.saveProgress(this.sessionToken, this.codingTask.id!, code).subscribe({
      next: () => {
        console.log('Progress saved');
      },
      error: (err) => {
        console.error('Error saving progress:', err);
      }
    });
  }

  executeCode(): void {
    if (this.isExecuting || !this.codingTask) return;
    
    this.isExecuting = true;
    this.executionResults = [];
    this.executionError = '';
    
    const code = this.codeForm.get('code')?.value;
    
    // Only include non-hidden test cases
    const visibleTestCases = this.codingTask.testCases.filter(tc => !tc.isHidden);
    
    const request: ExecutionRequest = {
      code,
      language: this.codingTask.language,
      testCases: visibleTestCases
    };
    
    this.codingService.executeCode(request).subscribe({
      next: (response: ExecutionResponse) => {
        this.isExecuting = false;
        
        if (response.compilationError) {
          this.executionError = response.compilationError;
          return;
        }
        
        if (response.executionError) {
          this.executionError = response.executionError;
          return;
        }
        
        this.executionResults = response.results;
      },
      error: (err) => {
        this.isExecuting = false;
        this.executionError = err.error?.message || 'An error occurred during execution.';
        console.error('Error executing code:', err);
      }
    });
  }

  submitSolution(): void {
    if (this.isSubmitting || !this.codingTask) return;
    
    this.saveProgress(); // Save one last time before submitting
    
    this.isSubmitting = true;
    
    const submission: CodingSubmission = {
      sessionId: this.sessionToken,
      taskId: this.codingTask.id!,
      code: this.codeForm.get('code')?.value,
      language: this.codingTask.language,
      isComplete: true,
      candidateNotes: this.notesForm.get('notes')?.value
    };
    
    this.codingService.submitSolution(submission).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.exitLockdown();
        this.router.navigate(['/candidate/session', this.sessionToken, 'complete']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || 'Failed to submit solution. Please try again.';
        console.error('Error submitting solution:', err);
      }
    });
  }

  enforceLockdown(): void {
    this.lockdownEnforced = true;
    
    // Request fullscreen mode
    this.requestFullScreen();
    
    // Set an interval to check and enforce fullscreen mode
    this.checkFullScreenInterval();
  }
  
  requestFullScreen(): void {
    if (this.fullscreenContainer?.nativeElement) {
      const elem = this.fullscreenContainer.nativeElement;
      
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) { /* Safari */
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) { /* IE11 */
        (elem as any).msRequestFullscreen();
      } else if ((elem as any).mozRequestFullscreen) { /* Firefox */
        (elem as any).mozRequestFullscreen();
      }
    }
  }
  
  handleFullscreenChange(): void {
    this.isFullScreen = !!document.fullscreenElement || 
                       !!(document as any).webkitFullscreenElement || 
                       !!(document as any).mozFullScreenElement || 
                       !!(document as any).msFullscreenElement;
    
    if (!this.isFullScreen && this.lockdownEnforced) {
      this.fullScreenWarningCount++;
      
      if (this.fullScreenWarningCount <= this.maxFullScreenWarnings) {
        // Show warning and force back to fullscreen
        this.error = `Warning: Please remain in full-screen mode. (Warning ${this.fullScreenWarningCount}/${this.maxFullScreenWarnings})`;
        setTimeout(() => {
          if (this.lockdownEnforced) {
            this.requestFullScreen();
          }
        }, 1000);
      }
    } else if (this.isFullScreen && this.error && this.error.includes('full-screen mode')) {
      // Clear the error message if the user complies
      this.error = '';
    }
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
  
  handleVisibilityChange(): void {
    // When visibility changes
    if (document.visibilityState === 'visible' || document.visibilityState === 'hidden') {
      if (document.visibilityState === 'hidden' && this.lockdownEnforced) {
        this.tabSwitchWarningCount++;
        
        if (this.tabSwitchWarningCount <= this.maxTabSwitchWarnings) {
          // Set error to be shown when the user returns
          this.error = `Warning: Tab/window switching detected. Please remain on the coding challenge tab. (Warning ${this.tabSwitchWarningCount}/${this.maxTabSwitchWarnings})`;
        }
      } else if (document.visibilityState === 'visible' && this.error && this.error.includes('Tab/window switching')) {
        // Remind them they've been warned, but don't clear the error message immediately
        setTimeout(() => {
          if (this.error.includes('Tab/window switching')) {
            this.error = '';
          }
        }, 5000);
      }
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  // Monitor for keyboard shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.lockdownEnforced) {
      // Check for common copy/paste shortcuts outside the code editor
      if ((event.ctrlKey || event.metaKey) && 
          (event.key === 'c' || event.key === 'v' || event.key === 'x')) {
        // Allow copy/paste within the code editor, but prevent it elsewhere
        const targetElement = event.target as HTMLElement;
        const isCodeEditor = targetElement.closest('.monaco-editor');
        
        if (!isCodeEditor) {
          event.preventDefault();
          this.error = 'Copy, cut, and paste are only allowed within the code editor.';
          
          // Clear the error message after 3 seconds
          setTimeout(() => {
            if (this.error === 'Copy, cut, and paste are only allowed within the code editor.') {
              this.error = '';
            }
          }, 3000);
        }
      }
      
      // Check for Alt+Tab
      if (event.altKey && event.key === 'Tab') {
        // Just record it - can't really prevent Alt+Tab
      }
    }
  }
  
  // Monitor for browser refresh/navigation attempts
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent): void {
    if (this.lockdownEnforced) {
      // Save progress before they leave
      this.saveProgress();
      
      event.preventDefault();
      event.returnValue = 'You are in the middle of a coding challenge. Your progress will be saved, but are you sure you want to leave?';
      return event.returnValue;
    }
  }
} 