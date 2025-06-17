import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidateService } from '../../shared/services/candidate.service';
import { CommonModule } from '@angular/common';
import { NeoCardComponent, NeoButtonComponent } from '@autojudge/ui/dist';

@Component({
  selector: 'app-session-complete',
  templateUrl: './session-complete.component.html',
  styleUrls: ['./session-complete.component.css'],
  imports: [
    CommonModule,
    NeoCardComponent,
    NeoButtonComponent
  ],
  standalone: true
})
export class SessionCompleteComponent implements OnInit {
  sessionToken!: string;
  session: any = null;
  answers: any[] = [];
  loading = true;
  error = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private candidateService = inject(CandidateService);

  ngOnInit(): void {
    this.sessionToken = this.route.snapshot.paramMap.get('token') || '';
    this.loadSessionInfo();
  }

  loadSessionInfo(): void {
    this.loading = true;
    this.candidateService.getSessionByToken(this.sessionToken).subscribe({
      next: (data) => {
        this.session = data;
        this.loadAnswers();
      },
      error: (err) => {
        this.error = 'Failed to load session information. Please check your session token.';
        this.loading = false;
        console.error('Error loading session:', err);
      }
    });
  }

  loadAnswers(): void {
    this.candidateService.getSessionAnswers(this.sessionToken).subscribe({
      next: (data) => {
        this.answers = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load session answers.';
        this.loading = false;
        console.error('Error loading answers:', err);
      }
    });
  }

  getCategoryPerformance(): any[] {
    // This would be implemented in a real application
    // For now, we'll return a placeholder
    return [];
  }

  getProgressBarClass(score: number): string {
    if (score < 0.4) return 'bg-danger';
    if (score < 0.7) return 'bg-warning';
    return 'bg-success';
  }
  
  getScoreClass(score: number): string {
    if (score < 0.4) return 'bg-destructive text-destructive-foreground';
    if (score < 0.7) return 'bg-secondary text-secondary-foreground';
    return 'bg-primary text-primary-foreground';
  }

  goToSessions(): void {
    this.router.navigate(['/candidate/sessions']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString();
  }
} 