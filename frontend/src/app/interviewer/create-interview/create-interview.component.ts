import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InterviewService } from '../../shared/services/interview.service';

@Component({
  selector: 'app-create-interview',
  templateUrl: './create-interview.component.html',
  styleUrls: ['./create-interview.component.css']
})
export class CreateInterviewComponent {
  interviewForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private interviewService: InterviewService,
    private router: Router
  ) {
    this.interviewForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      jobRole: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      timeLimit: [60, [Validators.required, Validators.min(10), Validators.max(180)]],
      mcqCount: [5, [Validators.required, Validators.min(0), Validators.max(20)]],
      openEndedCount: [3, [Validators.required, Validators.min(0), Validators.max(10)]]
    }, {
      validators: this.atLeastOneQuestionValidator
    });
  }

  atLeastOneQuestionValidator(form: FormGroup) {
    const mcqCount = form.get('mcqCount')?.value || 0;
    const openEndedCount = form.get('openEndedCount')?.value || 0;
    
    return mcqCount + openEndedCount > 0 ? null : { noQuestions: true };
  }

  onSubmit(): void {
    if (this.interviewForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.interviewService.createInterview(this.interviewForm.value).subscribe({
      next: (interview) => {
        this.isSubmitting = false;
        this.router.navigate(['/interviewer/interviews', interview.id]);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to create interview';
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/interviewer/dashboard']);
  }
} 