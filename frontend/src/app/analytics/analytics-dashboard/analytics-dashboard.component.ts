import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit {
  dashboardData: any = {};
  loading = true;
  error = '';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.apiService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err) => {
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
} 