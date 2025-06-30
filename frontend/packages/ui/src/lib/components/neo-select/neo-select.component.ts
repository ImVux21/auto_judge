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
        [class.multiple]="multiple"
        (click)="toggleDropdown()"
      >
        <div class="neo-select-value">
          <ng-container *ngIf="!multiple || !Array.isArray(value) || value.length === 0">
            {{ getSelectedLabel() }}
          </ng-container>
          <div *ngIf="multiple && Array.isArray(value) && value.length > 0" class="neo-select-chips">
            <div *ngFor="let val of value.slice(0, maxDisplayChips)" class="neo-select-chip">
              {{ getOptionLabel(val) }}
              <span class="neo-select-chip-remove" (click)="removeValue($event, val)">&times;</span>
            </div>
            <div *ngIf="value.length > maxDisplayChips" class="neo-select-chip neo-select-more-chip">
              +{{ value.length - maxDisplayChips }} more
            </div>
          </div>
        </div>
        <div class="neo-select-actions">
          <span *ngIf="multiple && Array.isArray(value) && value.length > 0" 
                class="neo-select-clear" 
                (click)="clearSelection($event)">
            &times;
          </span>
          <div class="neo-select-arrow" [class.open]="isOpen">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Custom dropdown -->
      <div class="neo-select-dropdown" *ngIf="isOpen">
        <div 
          *ngFor="let option of options" 
          class="neo-select-option"
          [class.selected]="isOptionSelected(option.value)"
          (click)="selectOption(option)"
        >
          <div class="neo-select-option-content">
            <div *ngIf="multiple" class="neo-select-checkbox">
              <input 
                type="checkbox" 
                [checked]="isOptionSelected(option.value)" 
                (click)="$event.stopPropagation()"
                (change)="toggleOption(option, $event)"
              />
              <span class="neo-select-checkbox-custom"></span>
            </div>
            {{ option.label }}
          </div>
        </div>
        <div *ngIf="options.length === 0" class="neo-select-no-options">
          No options available
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
        [multiple]="multiple"
      >
        <option *ngIf="placeholder && !multiple" value="" disabled>{{ placeholder }}</option>
        <option *ngFor="let option of options" [value]="option.value" [selected]="isOptionSelected(option.value)">
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
    
    .neo-select-trigger.multiple {
      min-height: 44px;
      height: auto;
    }
    
    .neo-select-value {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .neo-select-actions {
      display: flex;
      align-items: center;
      margin-left: 8px;
    }
    
    .neo-select-clear {
      margin-right: 8px;
      font-size: 1.2rem;
      line-height: 1;
      cursor: pointer;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    
    .neo-select-clear:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    .neo-select-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    
    .neo-select-chip {
      background-color: #f0f0f0;
      border: 2px solid #000;
      border-radius: 16px;
      padding: 2px 8px;
      display: flex;
      align-items: center;
      font-size: 0.875rem;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .neo-select-chip-remove {
      margin-left: 5px;
      cursor: pointer;
      font-weight: bold;
    }
    
    .neo-select-more-chip {
      background-color: #e0e0e0;
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
      transition: transform 0.2s ease;
    }
    
    .neo-select-arrow.open {
      transform: rotate(180deg);
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
    
    .neo-select-option-content {
      display: flex;
      align-items: center;
    }
    
    .neo-select-checkbox {
      margin-right: 8px;
      position: relative;
      display: inline-block;
      width: 18px;
      height: 18px;
    }
    
    .neo-select-checkbox input {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
    }
    
    .neo-select-checkbox-custom {
      position: absolute;
      top: 0;
      left: 0;
      width: 18px;
      height: 18px;
      border: 2px solid #000;
      background-color: white;
    }
    
    .neo-select-checkbox input:checked + .neo-select-checkbox-custom::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 6px;
      width: 4px;
      height: 8px;
      border: solid black;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    
    .neo-select-no-options {
      padding: 0.75rem;
      text-align: center;
      color: #666;
      font-style: italic;
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
  @Input() multiple = false;
  @Input() maxDisplayChips = 3;
  
  value: string | string[] = '';
  disabled = false;
  isOpen = false;
  
  // Make Array available to the template
  Array = Array;
  
  private onChangeFn: (value: string | string[]) => void = () => {};
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
  
  isOptionSelected(optionValue: string): boolean {
    if (this.multiple && Array.isArray(this.value)) {
      return this.value.includes(optionValue);
    }
    return this.value === optionValue;
  }
  
  getOptionLabel(value: string): string {
    const option = this.options.find(opt => opt.value === value);
    return option ? option.label : value;
  }
  
  removeValue(event: Event, valueToRemove: string) {
    event.stopPropagation();
    if (this.multiple && Array.isArray(this.value)) {
      const newValue = this.value.filter(val => val !== valueToRemove);
      this.value = newValue;
      this.onChangeFn(this.value);
    }
  }
  
  clearSelection(event: Event) {
    event.stopPropagation();
    if (this.multiple) {
      this.value = [];
      this.onChangeFn(this.value);
    } else {
      this.value = '';
      this.onChangeFn(this.value);
    }
  }
  
  toggleOption(option: SelectOption, event: Event) {
    event.stopPropagation();
    if (!this.multiple) {
      this.selectOption(option);
      return;
    }
    
    // For multiple selection
    if (!Array.isArray(this.value)) {
      this.value = [];
    }
    
    const values = [...this.value];
    const index = values.indexOf(option.value);
    
    if (index === -1) {
      values.push(option.value);
    } else {
      values.splice(index, 1);
    }
    
    this.value = values;
    this.onChangeFn(this.value);
  }
  
  selectOption(option: SelectOption) {
    if (this.multiple) {
      this.toggleOption(option, new Event('click'));
    } else {
      this.value = option.value;
      this.onChangeFn(this.value);
      this.isOpen = false;
    }
  }
  
  getSelectedLabel(): string {
    if (this.multiple && Array.isArray(this.value)) {
      if (this.value.length === 0) {
        return this.placeholder || 'Select items';
      }
      if (this.value.length === 1) {
        const option = this.options.find(opt => opt.value === this.value[0]);
        return option ? option.label : '';
      }
      return `${this.value.length} items selected`;
    }
    
    if (!this.value && this.placeholder) {
      return this.placeholder;
    }
    
    const selectedOption = this.options.find(option => option.value === this.value);
    return selectedOption ? selectedOption.label : '';
  }
  
  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (this.multiple) {
      const selectedOptions = Array.from(target.selectedOptions).map(opt => opt.value);
      this.value = selectedOptions;
    } else {
      this.value = target.value;
    }
    this.onChangeFn(this.value);
  }
  
  onBlur(): void {
    this.onTouchedFn();
  }
  
  // ControlValueAccessor methods
  writeValue(value: string | string[]): void {
    if (this.multiple) {
      this.value = Array.isArray(value) ? value : (value ? [value] : []);
    } else {
      this.value = Array.isArray(value) ? (value.length > 0 ? value[0] : '') : (value || '');
    }
  }
  
  registerOnChange(fn: (value: string | string[]) => void): void {
    this.onChangeFn = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
} 