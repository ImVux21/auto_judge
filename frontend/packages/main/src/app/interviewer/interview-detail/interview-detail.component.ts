import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CodingTask } from 'packages/main/src/app/shared/models/coding.model';
import { CodingService } from 'packages/main/src/app/shared/services/coding.service';
import { NeoButtonComponent, NeoCardComponent, NeoInputComponent, NeoTextareaComponent, NeoCheckboxComponent, NeoSelectComponent } from 'packages/ui/dist';
import { Interview, InterviewSession, Question } from '../../shared/models/interview.model';
import { InterviewService } from '../../shared/services/interview.service';
import { CodingTasksToOptionsPipe } from '../../shared/pipes/coding-tasks-to-options.pipe';

@Component({
  selector: 'app-interview-detail',
  templateUrl: './interview-detail.component.html',
  styleUrls: ['./interview-detail.component.css'],
  imports: [
    CommonModule,
    NeoCardComponent,
    NeoButtonComponent,
    ReactiveFormsModule,
    CodingTasksToOptionsPipe,
    NeoInputComponent,
    NeoTextareaComponent,
    NeoCheckboxComponent,
    NeoSelectComponent
  ],
  standalone: true
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

  codingTasks: CodingTask[] = [];
  showEditModal = false;
  editForm!: FormGroup;
  editError = '';
  editSubmitting = false;

  allCodingTasks: CodingTask[] = [];

  private codingService = inject(CodingService);
  private interviewService = inject(InterviewService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.interviewId = +this.route.snapshot.paramMap.get('id')!;
    
    this.sessionForm = this.fb.group({
      candidateEmail: ['', [Validators.required, Validators.email]],
      candidateFirstName: ['', Validators.required],
      candidateLastName: ['', Validators.required]
    });
    
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      jobRole: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      timeLimit: [30, [Validators.required, Validators.min(10), Validators.max(180)]],
      mcqCount: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
      openEndedCount: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
      includeCodingChallenge: [false],
      codingTaskIds: [[]]
    });
    
    this.loadInterview();
    this.loadCodingTasks();
    this.codingService.getCodingTasks().subscribe({
      next: (tasks) => {
        this.allCodingTasks = tasks;
      }
    });
  }

  loadInterview(): void {
    this.loading = true;
    this.interviewService.getInterview(this.interviewId).subscribe({
      next: (data) => {
        this.interview = data;
        this.editForm.patchValue({
          title: data.title,
          jobRole: data.jobRole,
          description: data.description,
          timeLimit: data.timeLimit,
          mcqCount: data.mcqCount,
          openEndedCount: data.openEndedCount,
          includeCodingChallenge: data.hasCodingChallenge,
          codingTaskIds: (this.codingTasks.map(t => t.id))
        });
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

  loadCodingTasks(): void {
    this.codingService.getCodingTaskByInterviewId(this.interviewId).subscribe({
      next: (tasks) => {
        this.codingTasks = tasks;
      },
      error: (err) => {
        console.error('Error loading coding tasks:', err);
      }
    });
  }

  loadQuestions(): void {
    this.interviewService.getInterviewQuestions(this.interviewId).subscribe({
      next: (data) => {
        this.questions = data;
      },
      error: (err) => {
        console.error('Error loading questions:', err);
      }
    });
  }

  loadSessions(): void {
    this.interviewService.getInterviewSessions(this.interviewId).subscribe({
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
      this.interviewService.deactivateInterview(this.interviewId).subscribe({
        next: (data) => {
          this.interview!.active = false;
        },
        error: (err) => {
          console.error('Error deactivating interview:', err);
        }
      });
    } else {
      this.interviewService.activateInterview(this.interviewId).subscribe({
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
    
    this.interviewService.createSession(this.interviewId, this.sessionForm.value).subscribe({
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

  openEditModal(): void {
    this.showEditModal = true;
    this.editError = '';
    // Re-apply validators for codingTaskIds based on includeCodingChallenge
    const codingTaskControl = this.editForm.get('codingTaskIds');
    const includeCoding = this.editForm.get('includeCodingChallenge')?.value;
    if (includeCoding) {
      codingTaskControl?.setValidators([Validators.required]);
    } else {
      codingTaskControl?.clearValidators();
    }
    codingTaskControl?.updateValueAndValidity();
    // Listen for changes
    this.editForm.get('includeCodingChallenge')?.valueChanges.subscribe(include => {
      if (include) {
        codingTaskControl?.setValidators([Validators.required]);
      } else {
        codingTaskControl?.clearValidators();
      }
      codingTaskControl?.updateValueAndValidity();
    });
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editError = '';
  }

  submitEdit(): void {
    if (this.editForm.invalid || !this.interview) return;
    this.editSubmitting = true;
    this.editError = '';
    const formData = { ...this.editForm.value };
    if (formData.includeCodingChallenge) {
      formData.hasCodingChallenge = true;
    } else {
      delete formData.codingTaskIds;
      formData.hasCodingChallenge = false;
    }
    delete formData.includeCodingChallenge;
    this.interviewService.updateInterview(this.interviewId, formData).subscribe({
      next: (updated) => {
        // If coding challenge is included, assign the tasks
        if (this.editForm.value.includeCodingChallenge && this.editForm.value.codingTaskIds && this.editForm.value.codingTaskIds.length > 0) {
          this.codingService.assignMultipleCodingTasksToInterview(this.interviewId, this.editForm.value.codingTaskIds).subscribe({
            next: () => {
              this.interview = updated;
              this.editSubmitting = false;
              this.closeEditModal();
              this.loadCodingTasks();
            },
            error: (err) => {
              this.editError = 'Interview updated but failed to assign coding tasks.';
              this.editSubmitting = false;
              this.interview = updated;
              this.closeEditModal();
              this.loadCodingTasks();
            }
          });
        } else if (!this.editForm.value.includeCodingChallenge) {
          // Remove coding tasks if unchecked
          this.codingService.removeCodingTaskFromInterview(this.interviewId).subscribe({
            next: () => {
              this.interview = updated;
              this.editSubmitting = false;
              this.closeEditModal();
              this.loadCodingTasks();
            },
            error: (err) => {
              this.editError = 'Interview updated but failed to remove coding tasks.';
              this.editSubmitting = false;
              this.interview = updated;
              this.closeEditModal();
              this.loadCodingTasks();
            }
          });
        } else {
          this.interview = updated;
          this.editSubmitting = false;
          this.closeEditModal();
          this.loadCodingTasks();
        }
      },
      error: (err) => {
        this.editError = err.error?.message || 'Failed to update interview.';
        this.editSubmitting = false;
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