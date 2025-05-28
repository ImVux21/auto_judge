import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: any;
  isSubmitting = false;
  updateSuccess = false;
  updateError = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    if (this.user) {
      this.profileForm.patchValue({
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        email: this.user.email || ''
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.updateSuccess = false;
    this.updateError = '';

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
      this.authService.saveUser({...this.user, ...this.profileForm.getRawValue()});
    }, 1000);
  }
} 