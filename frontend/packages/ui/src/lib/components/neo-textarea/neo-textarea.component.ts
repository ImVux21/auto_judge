import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-neo-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="neo-textarea-container">
      @if (label) {
        <label [for]="id" class="neo-textarea-label">{{ label }}</label>
      }
      <div class="neo-textarea-wrapper">
        <textarea
          [id]="id"
          class="neo-textarea"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [rows]="rows"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
        ></textarea>
      </div>
      @if (description) {
        <div class="neo-textarea-description">{{ description }}</div>
      }
      @if (error) {
        <div class="neo-textarea-error">{{ error }}</div>
      }
    </div>
  `,
  styles: [`
    .neo-textarea-container {
      margin-bottom: 1rem;
    }
    
    .neo-textarea-label {
      display: block;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .neo-textarea-wrapper {
      position: relative;
    }
    
    .neo-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 3px solid #000;
      background-color: #fff;
      box-shadow: 3px 3px 0px #000;
      font-family: inherit;
      font-size: 1rem;
      transition: all 0.2s ease;
      resize: vertical;
    }
    
    .neo-textarea:focus {
      outline: none;
      box-shadow: 5px 5px 0px #000;
      transform: translate(-2px, -2px);
    }
    
    .neo-textarea:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .neo-textarea-description {
      font-size: 0.875rem;
      margin-top: 0.5rem;
      color: #666;
    }
    
    .neo-textarea-error {
      font-size: 0.875rem;
      margin-top: 0.5rem;
      color: #ff4d4f;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NeoTextareaComponent),
      multi: true
    }
  ]
})
export class NeoTextareaComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() id = `neo-textarea-${Math.random().toString(36).substring(2, 9)}`;
  @Input() description = '';
  @Input() error = '';
  @Input() rows = 3;
  
  value: string = '';
  disabled = false;
  
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  
  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }
  
  onBlur(): void {
    this.onTouched();
  }
  
  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.value = value || '';
  }
  
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
} 