import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NeoButtonComponent, NeoCardComponent, NeoTableComponent } from '@autojudge/ui/dist';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { AnalyticsService } from '../../shared/services/analytics.service';
import { CodingAnalyticsComponent } from '../coding-analytics/coding-analytics.component';

@Component({
  selector: 'app-session-analytics',
  templateUrl: './session-analytics.component.html',
  styleUrls: ['./session-analytics.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    NgChartsModule,
    NeoButtonComponent,
    NeoCardComponent,
    CodingAnalyticsComponent
  ]
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
        maxHeight: 600,
        maxWidth: 600,
      }
    }
  };

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    this.sessionId = +this.route.snapshot.paramMap.get('id')!;
    this.loadSessionAnalytics();
  }

  loadSessionAnalytics(): void {
    this.loading = true;
    this.analyticsService.getSessionAnalytics(this.sessionId).subscribe({
      next: (data: any) => {
        this.analytics = data;
        this.loading = false;
        this.updateEventTypeChart();
      },
      error: (err: any) => {
        this.error = 'Failed to load session analytics. Please try again later.';
        this.loading = false;
        console.error('Error loading session analytics:', err);
      }
    });
  }
  
  loadProctorSnapshots(eventType?: string): void {
    this.loadingSnapshots = true;
    this.analyticsService.getSessionProctorSnapshots(this.sessionId, eventType).subscribe({
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
    this.analyticsService.getSessionSuspiciousSnapshots(this.sessionId).subscribe({
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
    

    for (const [key, value] of Object.entries(stats)) {
      let label = key.replace(/_/g, ' ').toLowerCase();
      label = label.charAt(0).toUpperCase() + label.slice(1);
      labels.push(label);
      data.push(typeof value === 'number' ? value : 0);
    }
    
    if (data.length === 0 || data.every(val => val === 0)) {
      labels.push('No events recorded');
      data.push(1);
    }
    
    this.eventTypeChartData.labels = labels;
    this.eventTypeChartData.datasets[0].data = data;
    
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
    if (score >= 0.8) return 'bg-primary text-primary-foreground';
    if (score >= 0.6) return 'bg-accent text-accent-foreground';
    if (score >= 0.4) return 'bg-secondary text-secondary-foreground';
    if (score >= 0.2) return 'bg-warning text-warning-foreground';
    return 'bg-destructive text-destructive-foreground';
  }

  getCircleOffset(percentage: number): number {
    const circumference = 2 * Math.PI * 45; // 2πr where r=45
    return circumference * (1 - percentage);
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