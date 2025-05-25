import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.login(
      this.loginForm.value.email,
      this.loginForm.value.password
    ).subscribe({
      next: data => {
        this.isSubmitting = false;
        
        // Redirect based on role
        if (this.authService.isInterviewer()) {
          this.router.navigate(['/interviewer/dashboard']);
        } else if (this.authService.isCandidate()) {
          this.router.navigate(['/candidate/sessions']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: err => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'An error occurred during login';
      }
    });
  }
} 