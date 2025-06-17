import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, HostListener, Input, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-neo-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="neo-select-container">
      <label *ngIf="label" [for]="id" class="neo-select-label">{{ label }}</label>
      
      <!-- Custom select trigger -->
      <div 
        class="neo-select-trigger" 
        [class.open]="isOpen"
        [class.disabled]="disabled"
        (click)="toggleDropdown()"
      >
        <span>{{ getSelectedLabel() }}</span>
        <div class="neo-select-arrow" [class.open]="isOpen">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>
      
      <!-- Custom dropdown -->
      <div class="neo-select-dropdown" *ngIf="isOpen">
        <div 
          *ngFor="let option of options" 
          class="neo-select-option"
          [class.selected]="value === option.value"
          (click)="selectOption(option)"
        >
          {{ option.label }}
        </div>
      </div>
      
      <!-- Hidden native select for form integration -->
      <select
        [id]="id"
        class="neo-select-native"
        [disabled]="disabled"
        [(ngModel)]="value"
        (change)="onChange($event)"
        (blur)="onBlur()"
      >
        <option *ngIf="placeholder" value="" disabled>{{ placeholder }}</option>
        <option *ngFor="let option of options" [value]="option.value">
          {{ option.label }}
        </option>
      </select>
      
      <div *ngIf="description" class="neo-select-description">{{ description }}</div>
      <div *ngIf="error" class="neo-select-error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .neo-select-container {
      margin-bottom: 1rem;
      position: relative;
    }
    
    .neo-select-label {
      display: block;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    /* Custom trigger styling */
    .neo-select-trigger {
      width: 100%;
      padding: 0.75rem;
      padding-right: 2.5rem;
      border: 3px solid #000;
      background-color: #fff;
      box-shadow: 5px 5px 0px #000;
      font-family: inherit;
      font-size: 1rem;
      font-weight: bold;
      transition: all 0.2s ease;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }
    
    .neo-select-trigger.open {
      box-shadow: 3px 3px 0px #000;
      transform: translate(2px, 2px);
    }
    
    .neo-select-trigger:hover:not(.disabled):not(.open) {
      transform: translate(-2px, -2px);
      box-shadow: 7px 7px 0px #000;
    }
    
    .neo-select-trigger.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .neo-select-arrow {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      transition: transform 0.2s ease;
    }
    
    .neo-select-arrow.open {
      transform: translateY(-50%) rotate(180deg);
    }
    
    /* Custom dropdown styling */
    .neo-select-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      width: 100%;
      background-color: #fff;
      border: 3px solid #000;
      box-shadow: 5px 5px 0px #000;
      z-index: 10;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .neo-select-option {
      padding: 0.75rem;
      font-weight: bold;
      border-bottom: 2px solid #000;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    
    .neo-select-option:last-child {
      border-bottom: none;
    }
    
    .neo-select-option:hover {
      background-color: #f0f0f0;
      transform: translateX(3px);
    }
    
    .neo-select-option.selected {
      background-color: #FFF133;
      color: black;
    }
    
    /* Hide native select but keep it accessible for form submission */
    .neo-select-native {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }
    
    .neo-select-description {
      font-size: 0.875rem;
      margin-top: 0.5rem;
      color: #666;
    }
    
    .neo-select-error {
      font-size: 0.875rem;
      margin-top: 0.5rem;
      color: #ff4d4f;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NeoSelectComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None
})
export class NeoSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() id = `neo-select-${Math.random().toString(36).substring(2, 9)}`;
  @Input() description = '';
  @Input() error = '';
  @Input() options: SelectOption[] = [];
  
  value: string = '';
  disabled = false;
  isOpen = false;
  
  private onChangeFn: (value: string) => void = () => {};
  private onTouchedFn: () => void = () => {};
  
  constructor(private elementRef: ElementRef) {}
  
  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
  
  toggleDropdown() {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }
  
  selectOption(option: SelectOption) {
    this.value = option.value;
    this.onChangeFn(this.value);
    this.isOpen = false;
  }
  
  getSelectedLabel(): string {
    if (!this.value && this.placeholder) {
      return this.placeholder;
    }
    
    const selectedOption = this.options.find(option => option.value === this.value);
    return selectedOption ? selectedOption.label : '';
  }
  
  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChangeFn(this.value);
  }
  
  onBlur(): void {
    this.onTouchedFn();
  }
  
  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.value = value || '';
  }
  
  registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
} 