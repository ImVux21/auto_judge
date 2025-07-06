import { CommonModule } from "@angular/common";
import { Component, Input, forwardRef } from "@angular/core";
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";

@Component({
  selector: "app-neo-checkbox",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <input
      type="checkbox"
      [id]="id"
      [disabled]="disabled"
      [(ngModel)]="checked"
      (ngModelChange)="onChanged($event)"
      (blur)="onBlur()"
      class="sr-only"
    />
    
    <!-- Custom visual checkbox -->
    <div class="neo-checkbox-container">
      <div class="flex items-center gap-3">
        <div 
          class="neo-checkbox-wrapper cursor-pointer" 
          (click)="toggleChecked()"
          [class.disabled]="disabled"
        >
          <div
            class="checkmark flex items-center justify-center"
            [class.visible]="checked"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
      </div>
      <label *ngIf="label" class="font-bold text-lg" [for]="id">{{
        label
      }}</label>
      <div *ngIf="error" class="text-destructive mt-2 ml-8 font-bold text-sm">
        {{ error }}
      </div>
    </div>
  `,
  styleUrls: ["./neo-checkbox.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NeoCheckboxComponent),
      multi: true,
    },
  ],
})
export class NeoCheckboxComponent implements ControlValueAccessor {
  @Input() label = "";
  @Input() id = `neo-checkbox-${Math.random().toString(36).substring(2, 9)}`;
  @Input() error = "";
  @Input() variant: "default" | "blue" | "green" | "purple" = "default";

  checked = false;
  disabled = false;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  onChanged(value: boolean): void {
    this.checked = value;
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

  toggleChecked(): void {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.onChange(this.checked);
      this.onTouched();
    }
  }
}
