import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-create-interview',
  templateUrl: './create-interview.component.html',
  styleUrls: ['./create-interview.component.css']
})
export class CreateInterviewComponent implements OnInit {
  interviewForm!: FormGroup;
  isSubmitting = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.interviewForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      jobRole: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      timeLimit: [60, [Validators.required, Validators.min(10), Validators.max(180)]],
      mcqCount: [5, [Validators.required, Validators.min(0), Validators.max(20)]],
      openEndedCount: [3, [Validators.required, Validators.min(0), Validators.max(10)]]
    });
  }

  onSubmit(): void {
    if (this.interviewForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.success = '';

    this.apiService.createInterview(this.interviewForm.value).subscribe({
      next: (data) => {
        this.isSubmitting = false;
        this.success = 'Interview created successfully!';
        
        setTimeout(() => {
          this.router.navigate(['/interviewer/interviews', data.id]);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || 'Failed to create interview. Please try again.';
        console.error('Error creating interview:', err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/interviewer/interviews']);
  }
} 