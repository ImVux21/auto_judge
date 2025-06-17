import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { NeoCardComponent, NeoInputComponent, NeoButtonComponent } from '@autojudge/ui/dist';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NeoCardComponent,
    NeoInputComponent,
    NeoButtonComponent
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  returnUrl: string = '/';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole();
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.redirectBasedOnRole();
      },
      error: err => {
        this.errorMessage = err.error?.message || 'Failed to login. Please check your credentials.';
        this.isSubmitting = false;
      }
    });
  }

  private redirectBasedOnRole(): void {
    if (this.authService.hasRole('ROLE_INTERVIEWER')) {
      this.router.navigate(['/interviewer/dashboard']);
    } else if (this.authService.hasRole('ROLE_CANDIDATE')) {
      this.router.navigate(['/candidate/sessions']);
    } else {
      this.router.navigate([this.returnUrl]);
    }
  }
} 