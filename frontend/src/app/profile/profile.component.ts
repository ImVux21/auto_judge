import { Component } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { AuthService } from "../shared/services/auth.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent {
  profileForm: FormGroup = new FormGroup({});
  user: any;
  isSubmitting = false;
  updateSuccess = false;
  updateError = "";

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.user = this.authService.currentUserValue;
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
