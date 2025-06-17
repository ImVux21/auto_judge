import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-neo-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="neo-checkbox-container">
      <div class="flex items-center">
        <div class="relative h-6 w-6 mr-2">
          <input
            type="checkbox"
            [id]="id"
            [checked]="checked"
            [disabled]="disabled"
            (change)="onChanged($event)"
            (blur)="onBlur()"
            class="peer h-6 w-6 border-brutal border-black appearance-none checked:bg-primary"
          />
          <div
            class="absolute inset-0 hidden peer-checked:flex items-center justify-center text-white pointer-events-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        <label *ngIf="label" class="font-medium" [for]="id">{{ label }}</label>
      </div>
      <div *ngIf="error" class="text-destructive mt-2 ml-8">{{ error }}</div>
    </div>
  `,
  styles: [`
    .neo-checkbox-container {
      margin-bottom: 1rem;
    }
    
    .border-brutal {
      border-width: 3px;
      border-style: solid;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NeoCheckboxComponent),
      multi: true
    }
  ]
})
export class NeoCheckboxComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() id = `neo-checkbox-${Math.random().toString(36).substring(2, 9)}`;
  @Input() error = '';
  
  checked = false;
  disabled = false;
  
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};
  
  onChanged(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.onChange(this.checked);
  }
  
  onBlur(): void {
    this.onTouched();
  }
  
  // ControlValueAccessor methods
  writeValue(value: boolean): void {
    this.checked = value || false;
  }
  
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
} 