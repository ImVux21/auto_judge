import { Component, OnInit, inject, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AnalyticsService } from '../../shared/services/analytics.service';
import { CommonModule } from '@angular/common';
import { NeoButtonComponent, NeoCardComponent, NeoTableComponent } from '@autojudge/ui';
import { NeoTableColumn } from '@autojudge/ui';

@Component({
  selector: 'app-interview-analytics',
  templateUrl: './interview-analytics.component.html',
  styleUrls: ['./interview-analytics.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NeoButtonComponent,
    NeoCardComponent,
    NeoTableComponent
  ]
})
export class InterviewAnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('typeTemplate', { static: false }) typeTemplate!: TemplateRef<any>;
  @ViewChild('averageScoreTemplate', { static: false }) averageScoreTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: false }) statusTemplate!: TemplateRef<any>;

  interviewId!: number;
  analytics: any = {};
  loading = true;
  error = '';

  // Table columns for question performance
  questionColumns: NeoTableColumn[] = [];
  sessionColumns: NeoTableColumn[] = [];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    this.interviewId = +this.route.snapshot.paramMap.get('id')!;
    this.loadInterviewAnalytics();
  }

  ngAfterViewInit(): void {
    this.initializeColumns();
  }

  initializeColumns(): void {
    // Question performance columns
    this.questionColumns = [
      { 
        key: 'index', 
        header: '#',
        cellFn: (item: any) => {
          const index = this.analytics.questionPerformance.indexOf(item);
          return index + 1;
        }
      },
      { key: 'questionText', header: 'Question' },
      { 
        key: 'type', 
        header: 'Type',
        template: this.typeTemplate
      },
      { key: 'attemptCount', header: 'Attempts' },
      { 
        key: 'averageScore', 
        header: 'Avg. Score',
        template: this.averageScoreTemplate
      }
    ];

    // Session columns
    this.sessionColumns = [
      { 
        key: 'candidate', 
        header: 'Candidate',
        cellFn: (item: any) => `${item.candidate.firstName} ${item.candidate.lastName}`
      },
      { 
        key: 'startTime', 
        header: 'Date',
        cellFn: (item: any) => this.formatDate(item.startTime)
      },
      { 
        key: 'status', 
        header: 'Status',
        template: this.statusTemplate
      },
      { 
        key: 'score', 
        header: 'Score',
        cellFn: (item: any) => item.score !== null ? `${Math.round(item.score * 100)}%` : 'N/A'
      }
    ];
  }

  loadInterviewAnalytics(): void {
    this.loading = true;
    this.analyticsService.getInterviewAnalytics(this.interviewId).subscribe({
      next: (data: any) => {
        this.analytics = data;
        this.loading = false;
        // Initialize columns after data is loaded and templates are available
        setTimeout(() => this.initializeColumns(), 0);
      },
      error: (err: any) => {
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

  onSessionAction(session: any): void {
    this.viewSessionAnalytics(session.id);
  }

  goBack(): void {
    this.router.navigate(['/analytics']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }
} 