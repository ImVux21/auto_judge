import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-neo-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="neo-input-container">
      <label *ngIf="label" [for]="id" class="neo-input-label">{{ label }}</label>
      <div class="neo-input-wrapper">
        <input
          [type]="type"
          [id]="id"
          class="neo-input"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
        />
      </div>
      <div *ngIf="description" class="neo-input-description">{{ description }}</div>
      <div *ngIf="error" class="neo-input-error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .neo-input-container {
      margin-bottom: 1rem;
    }
    
    .neo-input-label {
      display: block;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .neo-input-wrapper {
      position: relative;
    }
    
    .neo-input {
      width: 100%;
      padding: 0.75rem;
      border: 3px solid #000;
      background-color: #fff;
      box-shadow: 3px 3px 0px #000;
      font-family: inherit;
      font-size: 1rem;
      transition: all 0.2s ease;
    }
    
    .neo-input:focus {
      outline: none;
      box-shadow: 5px 5px 0px #000;
      transform: translate(-2px, -2px);
    }
    
    .neo-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .neo-input-description {
      font-size: 0.875rem;
      margin-top: 0.5rem;
      color: #666;
    }
    
    .neo-input-error {
      font-size: 0.875rem;
      margin-top: 0.5rem;
      color: #ff4d4f;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NeoInputComponent),
      multi: true
    }
  ]
})
export class NeoInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() id = `neo-input-${Math.random().toString(36).substring(2, 9)}`;
  @Input() description = '';
  @Input() error = '';
  
  value: string = '';
  disabled = false;
  
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
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
