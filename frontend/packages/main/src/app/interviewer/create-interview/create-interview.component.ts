import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NeoCheckboxComponent } from '@autojudge/ui';
import {
  NeoButtonComponent,
  NeoCardComponent,
  NeoInputComponent,
  NeoSelectComponent,
  NeoTextareaComponent
} from "@autojudge/ui";
import { CodingTask } from "../../shared/models/coding.model";
import { CodingTasksToOptionsPipe } from "../../shared/pipes/coding-tasks-to-options.pipe";
import { CodingService } from "../../shared/services/coding.service";
import { InterviewService } from "../../shared/services/interview.service";

@Component({
  selector: "app-create-interview",
  templateUrl: "./create-interview.component.html",
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    NeoCardComponent, 
    NeoInputComponent, 
    NeoTextareaComponent, 
    NeoButtonComponent,
    NeoSelectComponent,
    NeoCheckboxComponent,
    CodingTasksToOptionsPipe
  ],
  standalone: true,
})
export class CreateInterviewComponent implements OnInit {
  interviewForm!: FormGroup;
  isSubmitting = false;
  error = "";
  success = "";
  codingTasks: CodingTask[] = [];

  private interviewService = inject(InterviewService);
  private codingService = inject(CodingService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.interviewForm = this.fb.group({
      title: ["", [Validators.required, Validators.minLength(3)]],
      jobRole: ["", [Validators.required, Validators.minLength(3)]],
      description: [""],
      timeLimit: [
        60,
        [Validators.required, Validators.min(10), Validators.max(180)],
      ],
      mcqCount: [
        5,
        [Validators.required, Validators.min(0), Validators.max(20)],
      ],
      openEndedCount: [
        3,
        [Validators.required, Validators.min(0), Validators.max(10)],
      ],
      includeCodingChallenge: [false],
      codingTaskIds: [[]]
    });

    this.interviewForm.get('includeCodingChallenge')?.valueChanges.subscribe(includeCoding => {
      const codingTaskControl = this.interviewForm.get('codingTaskIds');
      if (includeCoding) {
        codingTaskControl?.setValidators([Validators.required]);
        this.loadCodingTasks();
      } else {
        codingTaskControl?.clearValidators();
      }
      codingTaskControl?.updateValueAndValidity();
    });
  }

  loadCodingTasks(): void {
    this.codingService.getCodingTasks().subscribe({
      next: (tasks: CodingTask[]) => {
        this.codingTasks = tasks;
      },
      error: (err: any) => {
        console.error('Error loading coding tasks:', err);
        this.error = 'Failed to load coding tasks. Please try again.';
      }
    });
  }

  onSubmit(): void {
    if (this.interviewForm.invalid) {
      return;
    }

    // Add validation to ensure at least one question type or coding challenge is selected
    const { mcqCount, openEndedCount, includeCodingChallenge } = this.interviewForm.value;
    if (mcqCount === 0 && openEndedCount === 0 && !includeCodingChallenge) {
      this.error = 'You must include at least one question (MCQ or open-ended) or a coding challenge.';
      return;
    }

    this.isSubmitting = true;
    this.error = "";
    this.success = "";

    const formData = { ...this.interviewForm.value };
    
    // Set hasCodingChallenge flag if includeCodingChallenge is true
    if (formData.includeCodingChallenge) {
      formData.hasCodingChallenge = true;
    } else {
      // Remove coding-related fields if not included
      delete formData.codingTaskIds;
      formData.hasCodingChallenge = false;
    }
    
    // Remove the UI-only field
    delete formData.includeCodingChallenge;

    // Call API to create interview
    this.interviewService.createInterview(formData).subscribe({
      next: (response: any) => {
        // If coding challenge is included, assign the tasks to the interview
        if (this.interviewForm.value.includeCodingChallenge && 
            this.interviewForm.value.codingTaskIds && 
            this.interviewForm.value.codingTaskIds.length > 0) {
          
          this.codingService.assignMultipleCodingTasksToInterview(
            response.id, 
            this.interviewForm.value.codingTaskIds
          ).subscribe({
            next: () => {
              this.isSubmitting = false;
              this.success = "Interview created successfully with coding challenges!";
              this.router.navigate(["/interviewer/interviews", response.id]);
            },
            error: (err: any) => {
              this.isSubmitting = false;
              this.error = "Interview created but failed to assign coding tasks. Please try again.";
              console.error("Error assigning coding tasks:", err);
              this.router.navigate(["/interviewer/interviews", response.id]);
            }
          });
        } else {
          this.isSubmitting = false;
          this.success = "Interview created successfully!";
          this.router.navigate(["/interviewer/interviews", response.id]);
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.error =
          err.error?.message || "Failed to create interview. Please try again.";
        console.error("Error creating interview:", err);
      },
    });
  }

  cancel(): void {
    this.router.navigate(["/interviewer/interviews"]);
  }
}
