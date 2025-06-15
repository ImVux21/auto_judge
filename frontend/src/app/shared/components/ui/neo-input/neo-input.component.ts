import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-neo-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full">
      <label *ngIf="label" [for]="id" class="block text-sm font-bold mb-2">{{ label }}</label>
      <input
        [type]="type"
        [id]="id"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [(ngModel)]="value"
        (blur)="onTouched()"
        class="neo-input"
      />
      <p *ngIf="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
    </div>
  `,
  styles: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NeoInputComponent),
      multi: true
    }
  ]
})
export class NeoInputComponent implements ControlValueAccessor {
  @Input() type = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() description = '';
  @Input() id = `neo-input-${Math.random().toString(36).substring(2, 9)}`;
  @Input() disabled = false;

  private _value = '';
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  get value(): string {
    return this._value;
  }

  set value(val: string) {
    this._value = val;
    this.onChange(val);
  }

  writeValue(value: string): void {
    this._value = value || '';
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