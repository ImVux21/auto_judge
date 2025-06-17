import { Component, inject } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { AuthService } from "../shared/services/auth.service";
import { NeoCardComponent, NeoInputComponent, NeoButtonComponent } from "packages/ui/dist";
import { LogoutButtonComponent } from "../shared/components/logout-button/logout-button.component";
import { SessionService, StorageService } from "@autojudge/core/dist";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NeoCardComponent, 
    NeoInputComponent,
    NeoButtonComponent,
    LogoutButtonComponent
  ],
  standalone: true
})
export class ProfileComponent {
  profileForm: FormGroup = new FormGroup({});
  user: any;
  isSubmitting = false;
  updateSuccess = false;
  updateError = "";

  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);

  constructor() {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.profileForm = this.formBuilder.group({
        firstName: new FormControl(this.user.firstName, Validators.required),
        lastName: new FormControl(this.user.lastName, Validators.required),
        email: new FormControl(this.user.email, Validators.required),
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.updateSuccess = false;
    this.updateError = "";

    // This is a placeholder - you would need to implement the updateProfile method in your AuthService
    // this.authService.updateProfile(this.profileForm.value).subscribe(
    //   (response) => {
    //     this.isSubmitting = false;
    //     this.updateSuccess = true;
    //     this.authService.saveUser({...this.user, ...this.profileForm.value});
    //   },
    //   (error) => {
    //     this.isSubmitting = false;
    //     this.updateError = error.message || 'Failed to update profile';
    //   }
    // );

    // For now, just simulate a successful update
    setTimeout(() => {
      this.isSubmitting = false;
      this.updateSuccess = true;
      this.authService.saveUser({
        ...this.user,
        ...this.profileForm.getRawValue(),
      });
    }, 1000);
  }
}
