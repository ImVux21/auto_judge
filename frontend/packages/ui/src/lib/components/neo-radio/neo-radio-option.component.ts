import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-neo-radio-option",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="neo-radio-container mb-2">
      <div class="flex items-center gap-3">
        <div
          class="neo-radio-wrapper cursor-pointer"
          (click)="selectOption()"
          [class.disabled]="disabled"
        >
          <div
            class="radiomark flex items-center justify-center"
            [class.selected]="isSelected"
          >
            <svg
              *ngIf="isSelected"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="black"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="6" />
            </svg>
          </div>
        </div>
        <label
          *ngIf="label"
          class="font-bold text-lg cursor-pointer"
          (click)="selectOption()"
          >{{ label }}</label
        >
      </div>
    </div>
  `,
  styleUrls: ["./neo-radio-option.component.scss"],
})
export class NeoRadioOptionComponent {
  @Input() label = "";
  @Input() value: any;
  @Input() disabled = false;

  name = "";
  isSelected = false;
  private onValueChange: (value: any) => void = () => {};

  registerValueChange(fn: (value: any) => void): void {
    this.onValueChange = fn;
  }

  setSelected(selected: boolean): void {
    this.isSelected = selected;
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }

  selectOption(): void {
    if (!this.disabled) {
      this.onValueChange(this.value);
    }
  }
}
