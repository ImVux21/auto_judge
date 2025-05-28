import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-session-analytics',
  templateUrl: './session-analytics.component.html',
  styleUrls: ['./session-analytics.component.css']
})
export class SessionAnalyticsComponent implements OnInit {
  sessionId!: number;
  analytics: any = {};
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.sessionId = +this.route.snapshot.paramMap.get('id')!;
    this.loadSessionAnalytics();
  }

  loadSessionAnalytics(): void {
    this.loading = true;
    this.apiService.getSessionAnalytics(this.sessionId).subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load session analytics. Please try again later.';
        this.loading = false;
        console.error('Error loading session analytics:', err);
      }
    });
  }

  getCategoryPerformanceItems(): any[] {
    if (!this.analytics.categoryPerformance) {
      return [];
    }
    
    return Object.entries(this.analytics.categoryPerformance).map(([category, score]) => ({
      category,
      score: score as number
    }));
  }

  getProgressBarClass(score: number): string {
    if (score < 0.4) return 'bg-danger';
    if (score < 0.7) return 'bg-warning';
    return 'bg-success';
  }

  viewInterviewAnalytics(): void {
    if (this.analytics.session?.interview?.id) {
      this.router.navigate(['/analytics/interview', this.analytics.session.interview.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/analytics']);
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