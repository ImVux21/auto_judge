import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import {
  NeoButtonComponent,
  NeoCardComponent,
  NeoCodeEditorComponent,
  NeoInputComponent,
  NeoSelectComponent,
  NeoTextareaComponent,
  SelectOption,
} from "@autojudge/ui/dist";
import {
  CodingTask,
  CodingTaskType,
  ProgrammingLanguage,
  TestCase,
} from "../../../shared/models/coding.model";
import { CodingService } from "../../../shared/services/coding.service";

@Component({
  selector: "app-create-coding-task",
  templateUrl: "./create-coding-task.html",
  styleUrls: ["./create-coding-task.css"],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NeoButtonComponent,
    NeoCardComponent,
    NeoInputComponent,
    NeoTextareaComponent,
    NeoSelectComponent,
    NeoCodeEditorComponent,
  ],
})
export class CreateCodingTaskComponent implements OnInit {
  taskForm!: FormGroup;
  isSubmitting = false;
  errorMessage = "";

  // Transform enum values to SelectOption format for the template
  programmingLanguages: SelectOption[] = Object.values(ProgrammingLanguage).map(lang => ({
    value: lang,
    label: lang,
  }));
  
  taskTypes: SelectOption[] = Object.values(CodingTaskType).map(type => ({
    value: type,
    label: type,
  }));

  // Difficulty levels as SelectOption
  difficultyLevels: SelectOption[] = ["Easy", "Medium", "Hard", "Expert"].map(level => ({
    value: level,
    label: level,
  }));

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private codingService = inject(CodingService);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: [
        "",
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      ],
      description: ["", [Validators.required, Validators.minLength(20)]],
      instructions: ["", [Validators.required, Validators.minLength(20)]],
      difficulty: ["Medium", Validators.required],
      timeLimit: [
        30,
        [Validators.required, Validators.min(5), Validators.max(120)],
      ],
      language: [ProgrammingLanguage.JAVASCRIPT, Validators.required],
      taskType: [CodingTaskType.IMPLEMENTATION, Validators.required],
      initialCode: ["// Write your code here\n\n", Validators.required],
      solutionCode: ["// Solution code\n\n"],
      testCases: this.fb.array([this.createTestCase()]),
    });
  }

  private createTestCase(): FormGroup {
    return this.fb.group({
      input: ["", Validators.required],
      expectedOutput: ["", Validators.required],
      isHidden: [false],
    });
  }

  get testCasesFormArray(): FormArray {
    return this.taskForm.get("testCases") as FormArray;
  }

  addTestCase(): void {
    this.testCasesFormArray.push(this.createTestCase());
  }

  removeTestCase(index: number): void {
    if (this.testCasesFormArray.length > 1) {
      this.testCasesFormArray.removeAt(index);
    }
  }

  createTask(): void {
    if (this.taskForm.invalid) {
      this.markFormGroupTouched(this.taskForm);
      return;
    }

    this.isSubmitting = true;
    const formValue = this.taskForm.value;

    // Prepare test cases with order
    const testCases: TestCase[] = formValue.testCases.map(
      (testCase: any, index: number) => ({
        ...testCase,
        sequence: index,
      })
    );

    // Create coding task object
    const codingTask: CodingTask = {
      ...formValue,
      testCases,
    };

    this.codingService.createCodingTask(codingTask).subscribe({
      next: (createdTask) => {
        this.isSubmitting = false;
        this.router.navigate(["/interviewer/live-coding/tasks"]);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          err.error?.message ||
          "Failed to create coding task. Please try again.";
        console.error("Error creating coding task:", err);
      },
    });
  }

  // Helper method to mark all controls as touched for validation display
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  // Helper method for easier validation checks in template
  hasError(controlName: string, errorName: string): boolean {
    const control = this.taskForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  // Helper method to get test case validation
  getTestCaseControl(index: number, controlName: string): any {
    return this.testCasesFormArray.at(index).get(controlName);
  }

  // Helper method for template
  isTestCaseInvalid(index: number, controlName: string): boolean {
    const control = this.getTestCaseControl(index, controlName);
    return !!(control && control.touched && control.invalid);
  }
}
