import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NeoSelectComponent, SelectOption } from 'packages/ui/src/lib/components/neo-select/neo-select.component';

@Component({
  selector: 'app-neo-select-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NeoSelectComponent],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Neo Select Component Test</h1>
      
      <form [formGroup]="form" class="space-y-6">
        <div>
          <h2 class="text-xl font-bold mb-2">Single Select</h2>
          <app-neo-select
            formControlName="singleSelect"
            label="Choose a programming language"
            placeholder="Select a language"
            [options]="programmingLanguages"
          ></app-neo-select>
          <div class="mt-2">
            Selected value: {{ form.get('singleSelect')?.value | json }}
          </div>
        </div>
        
        <div>
          <h2 class="text-xl font-bold mb-2">Multiple Select</h2>
          <app-neo-select
            formControlName="multiSelect"
            label="Choose programming languages"
            placeholder="Select languages"
            [options]="programmingLanguages"
            [multiple]="true"
            [maxDisplayChips]="2"
          ></app-neo-select>
          <div class="mt-2">
            Selected values: {{ form.get('multiSelect')?.value | json }}
          </div>
        </div>
        
        <div>
          <button 
            type="button" 
            class="px-4 py-2 bg-blue-500 text-white rounded"
            (click)="resetForm()">
            Reset Form
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NeoSelectTestComponent {
  form: FormGroup;
  
  programmingLanguages: SelectOption[] = [
    { value: 'js', label: 'JavaScript' },
    { value: 'ts', label: 'TypeScript' },
    { value: 'py', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'ruby', label: 'Ruby' },
  ];
  
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      singleSelect: [''],
      multiSelect: [[]]
    });
  }
  
  resetForm() {
    this.form.reset();
  }
} 