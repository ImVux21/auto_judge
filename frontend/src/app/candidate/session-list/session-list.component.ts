import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css']
})
export class SessionListComponent implements OnInit {
  sessions: any[] = [];
  loading = true;
  error = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    // In a real implementation, this would fetch the candidate's sessions
    // For now, we'll just show a placeholder
    this.loading = false;
    this.sessions = [];
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  continueSession(token: string): void {
    this.router.navigate(['/candidate/session', token]);
  }

  viewResults(token: string): void {
    this.router.navigate(['/candidate/session', token, 'complete']);
  }
} 