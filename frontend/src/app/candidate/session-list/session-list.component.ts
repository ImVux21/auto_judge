import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { AuthService } from '../../shared/services/auth.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css']
})
export class SessionListComponent implements OnInit {
  sessions: any[] = [];
  loading = false;
  error = '';
  token = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.error = '';
    
    this.apiService.getCandidateSessions().subscribe({
      next: (data) => {
        this.sessions = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load your interview sessions. Please try again later.';
        this.loading = false;
        console.error('Error loading sessions:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  continueSession(sessionToken?: string): void {
    const token = sessionToken || this.token;
    if (!token) {
      this.error = 'Please enter a valid session token';
      return;
    }
    this.router.navigate(['/candidate/session', token]);
  }

  viewResults(token: string): void {
    this.router.navigate(['/candidate/session', token, 'complete']);
  }
} 