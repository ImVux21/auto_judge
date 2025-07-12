import { CommonModule } from "@angular/common";
import {
    AfterContentInit,
    Component,
    ContentChildren,
    Input,
    QueryList,
    forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor,
    FormsModule,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { NeoRadioOptionComponent } from "./neo-radio-option.component";

@Component({
  selector: "app-neo-radio-group",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="neo-radio-group" [attr.aria-label]="label">
      <div *ngIf="label" class="group-label mb-3 font-bold">{{ label }}</div>
      <ng-content></ng-content>
      <div *ngIf="error" class="text-destructive mt-2 font-bold text-sm">
        {{ error }}
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NeoRadioGroupComponent),
      multi: true,
    },
  ],
})
export class NeoRadioGroupComponent implements ControlValueAccessor, AfterContentInit {
  @Input() label = "";
  @Input() error = "";
  @Input() name = `radio-group-${Math.random().toString(36).substring(2, 9)}`;
  @Input() disabled = false;

  @ContentChildren(NeoRadioOptionComponent)
  radioOptions!: QueryList<NeoRadioOptionComponent>;

  private currentValue: any = null;
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterContentInit(): void {
    // Set up the radio options
    this.radioOptions.forEach((option) => {
      option.name = this.name;
      option.registerValueChange((value: any) => {
        this.currentValue = value;
        this.onChange(value);
        this.onTouched();
        this.updateRadioStates();
      });
    });
  }

  private updateRadioStates(): void {
    this.radioOptions.forEach((option) => {
      option.setSelected(option.value === this.currentValue);
    });
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.currentValue = value;
    if (this.radioOptions) {
      this.updateRadioStates();
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.radioOptions) {
      this.radioOptions.forEach((option) => {
        option.setDisabled(isDisabled);
      });
    }
  }
}
