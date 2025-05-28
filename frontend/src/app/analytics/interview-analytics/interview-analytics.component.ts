import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-interview-analytics',
  templateUrl: './interview-analytics.component.html',
  styleUrls: ['./interview-analytics.component.css']
})
export class InterviewAnalyticsComponent implements OnInit {
  interviewId!: number;
  analytics: any = {};
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.interviewId = +this.route.snapshot.paramMap.get('id')!;
    this.loadInterviewAnalytics();
  }

  loadInterviewAnalytics(): void {
    this.loading = true;
    this.apiService.getInterviewAnalytics(this.interviewId).subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load interview analytics. Please try again later.';
        this.loading = false;
        console.error('Error loading interview analytics:', err);
      }
    });
  }

  getScoreDistributionItems(): any[] {
    if (!this.analytics.scoreDistribution) {
      return [];
    }
    
    return Object.entries(this.analytics.scoreDistribution).map(([range, count]) => ({
      range,
      count: count as number
    }));
  }

  getProgressBarClass(range: string): string {
    switch (range) {
      case '0-20': return 'bg-danger';
      case '20-40': return 'bg-warning';
      case '40-60': return 'bg-info';
      case '60-80': return 'bg-primary';
      case '80-100': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  getProgressPercentage(count: number): number {
    const total = this.getTotalSessions();
    if (total === 0) return 0;
    return (count / total) * 100;
  }

  getTotalSessions(): number {
    if (!this.analytics.scoreDistribution) {
      return 0;
    }
    
    return Object.values(this.analytics.scoreDistribution)
      .reduce((sum: number, count: any) => sum + (count as number), 0);
  }

  viewSessionAnalytics(sessionId: number): void {
    this.router.navigate(['/analytics/session', sessionId]);
  }

  goBack(): void {
    this.router.navigate(['/analytics']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }
} 