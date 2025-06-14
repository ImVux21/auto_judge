import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-session-analytics',
  templateUrl: './session-analytics.component.html',
  styleUrls: ['./session-analytics.component.css']
})
export class SessionAnalyticsComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  
  sessionId!: number;
  analytics: any = {};
  loading = true;
  error = '';
  
  // Proctoring data
  proctorSnapshots: any[] = [];
  loadingSnapshots = false;
  
  // Chart configurations
  eventTypeChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      { 
        data: [],
        backgroundColor: [
          '#4CAF50', // NORMAL - green
          '#2196F3', // INITIAL - blue
          '#9C27B0', // SCHEDULED - purple
          '#F44336', // VISIBILITY_HIDDEN - red
          '#03A9F4', // VISIBILITY_VISIBLE - light blue
          '#FF9800', // KEYBOARD_SHORTCUT - orange
          '#E91E63', // PRINT_SCREEN - pink
          '#8BC34A', // QUESTION_NAVIGATION - light green
          '#00BCD4'  // ANSWER_SUBMISSION - cyan
        ]
      }
    ]
  };
  
  eventTypeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      }
    }
  };

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
        this.updateEventTypeChart();
      },
      error: (err) => {
        this.error = 'Failed to load session analytics. Please try again later.';
        this.loading = false;
        console.error('Error loading session analytics:', err);
      }
    });
  }
  
  loadProctorSnapshots(eventType?: string): void {
    this.loadingSnapshots = true;
    this.apiService.getSessionProctorSnapshots(this.sessionId, eventType).subscribe({
      next: (data: any[]) => {
        this.proctorSnapshots = data;
        this.loadingSnapshots = false;
      },
      error: (err: any) => {
        console.error('Error loading proctor snapshots:', err);
        this.loadingSnapshots = false;
      }
    });
  }
  
  loadSuspiciousSnapshots(): void {
    this.loadingSnapshots = true;
    this.apiService.getSessionSuspiciousSnapshots(this.sessionId).subscribe({
      next: (data: any[]) => {
        this.proctorSnapshots = data;
        this.loadingSnapshots = false;
      },
      error: (err: any) => {
        console.error('Error loading suspicious snapshots:', err);
        this.loadingSnapshots = false;
      }
    });
  }
  
  updateEventTypeChart(): void {
    if (!this.analytics.proctorData?.eventTypeStats) {
      return;
    }
    
    const stats = this.analytics.proctorData.eventTypeStats;
    const labels: string[] = [];
    const data: number[] = [];
    
    // Format the labels to be more readable
    for (const [key, value] of Object.entries(stats)) {
      if (value && typeof value === 'number' && value > 0) {
        let label = key.replace(/_/g, ' ').toLowerCase();
        label = label.charAt(0).toUpperCase() + label.slice(1);
        labels.push(label);
        data.push(value);
      }
    }
    
    this.eventTypeChartData.labels = labels;
    this.eventTypeChartData.datasets[0].data = data;
    
    // Update the chart if it exists
    if (this.chart) {
      this.chart.update();
    }
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
  
  getScoreClass(score: number): string {
    if (score < 0.4) return 'bg-destructive text-destructive-foreground';
    if (score < 0.7) return 'bg-secondary text-secondary-foreground';
    return 'bg-primary text-primary-foreground';
  }
  
  getEventTypeClass(eventType: string): string {
    switch (eventType) {
      case 'VISIBILITY_HIDDEN':
      case 'PRINT_SCREEN':
        return 'bg-destructive text-destructive-foreground';
      case 'KEYBOARD_SHORTCUT':
        return 'bg-warning text-warning-foreground';
      case 'QUESTION_NAVIGATION':
      case 'ANSWER_SUBMISSION':
        return 'bg-primary text-primary-foreground';
      case 'INITIAL':
      case 'SCHEDULED':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }
  
  formatEventType(eventType: string): string {
    return eventType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
  
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
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