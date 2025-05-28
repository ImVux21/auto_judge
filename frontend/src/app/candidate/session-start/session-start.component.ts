import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-session-start',
  templateUrl: './session-start.component.html',
  styleUrls: ['./session-start.component.css']
})
export class SessionStartComponent implements OnInit {
  sessionToken!: string;
  session: any = null;
  loading = true;
  error = '';
  
  deviceInfoForm!: FormGroup;
  isSubmitting = false;
  submitError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.sessionToken = this.route.snapshot.paramMap.get('token') || '';
    
    this.deviceInfoForm = this.fb.group({
      deviceName: ['', Validators.required],
      browserInfo: ['', Validators.required],
      allowCamera: [true],
      allowMicrophone: [false]
    });
    
    this.loadSessionInfo();
  }

  loadSessionInfo(): void {
    this.loading = true;
    this.apiService.getSessionByToken(this.sessionToken).subscribe({
      next: (data) => {
        this.session = data;
        this.loading = false;
        
        // Auto-fill browser info
        const browserInfo = this.detectBrowserInfo();
        this.deviceInfoForm.patchValue({
          deviceName: this.detectDeviceName(),
          browserInfo
        });
      },
      error: (err) => {
        this.error = 'Failed to load session information. Please check your session token.';
        this.loading = false;
        console.error('Error loading session:', err);
      }
    });
  }

  startSession(): void {
    if (this.deviceInfoForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    this.submitError = '';
    
    const deviceInfo = this.deviceInfoForm.value;
    
    this.apiService.startSession(this.sessionToken, deviceInfo).subscribe({
      next: (data) => {
        this.router.navigate(['/candidate/session', this.sessionToken, 'interview']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.message || 'Failed to start session. Please try again.';
        console.error('Error starting session:', err);
      }
    });
  }

  detectDeviceName(): string {
    const userAgent = navigator.userAgent;
    let deviceName = 'Unknown Device';
    
    if (/Windows/.test(userAgent)) {
      deviceName = 'Windows PC';
    } else if (/Macintosh/.test(userAgent)) {
      deviceName = 'Mac';
    } else if (/iPhone/.test(userAgent)) {
      deviceName = 'iPhone';
    } else if (/iPad/.test(userAgent)) {
      deviceName = 'iPad';
    } else if (/Android/.test(userAgent)) {
      deviceName = 'Android Device';
    } else if (/Linux/.test(userAgent)) {
      deviceName = 'Linux PC';
    }
    
    return deviceName;
  }

  detectBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    let browserInfo = 'Unknown Browser';
    
    if (/Chrome/.test(userAgent) && !/Chromium|Edge/.test(userAgent)) {
      browserInfo = 'Google Chrome';
    } else if (/Firefox/.test(userAgent)) {
      browserInfo = 'Mozilla Firefox';
    } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
      browserInfo = 'Apple Safari';
    } else if (/Edge/.test(userAgent)) {
      browserInfo = 'Microsoft Edge';
    } else if (/Opera|OPR/.test(userAgent)) {
      browserInfo = 'Opera';
    }
    
    return browserInfo;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }
} 