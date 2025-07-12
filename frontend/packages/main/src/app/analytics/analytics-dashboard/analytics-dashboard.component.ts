import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NeoButtonComponent, NeoCardComponent } from '@autojudge/ui/dist';
import { AnalyticsService } from '../../shared/services/analytics.service';

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NeoCardComponent,
    NeoButtonComponent
  ]
})
export class AnalyticsDashboardComponent implements OnInit {
  dashboardData: any = {};
  loading = true;
  error = '';

  private analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.analyticsService.getDashboardAnalytics().subscribe({
      next: (data: any) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load analytics data. Please try again later.';
        this.loading = false;
        console.error('Error loading analytics data:', err);
      }
    });
  }

  getScoreDistributionItems(): any[] {
    if (!this.dashboardData.scoreDistribution) {
      return [];
    }
    
    return Object.entries(this.dashboardData.scoreDistribution).map(([range, count]) => ({
      range,
      count
    }));
  }

  getLanguageDistributionItems(): any[] {
    if (!this.dashboardData.codingAnalytics?.languageDistribution) {
      return [];
    }
    
    return Object.entries(this.dashboardData.codingAnalytics.languageDistribution).map(([language, count]) => ({
      language,
      count
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

  getLanguagePercentage(count: number): number {
    if (!this.dashboardData.codingAnalytics?.languageDistribution) {
      return 0;
    }
    
    const total = Object.values(this.dashboardData.codingAnalytics.languageDistribution)
      .reduce((sum: any, count: any) => sum + count, 0) as number;
    
    if (total === 0) return 0;
    return (count / total) * 100;
  }

  getCircleOffset(percentage: number): number {
    const circumference = 2 * Math.PI * 45; // 2πr where r=45
    return circumference * (1 - percentage);
  }

  getTotalSessions(): number {
    if (!this.dashboardData.scoreDistribution) {
      return 0;
    }
    
    return Object.values(this.dashboardData.scoreDistribution)
      .reduce((sum: any, count: any) => sum + count, 0) as number;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  formatTime(seconds: number): string {
    if (!seconds) return '0s';
    
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ${Math.round(seconds % 60)}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }
} 