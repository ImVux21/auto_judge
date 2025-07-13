import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NeoButtonComponent, NeoCardComponent, NeoSelectComponent } from '@autojudge/ui/dist';
import { CodingAnalytics } from '../../shared/models/analytics.model';
import { AnalyticsService } from '../../shared/services/analytics.service';

@Component({
  selector: 'app-coding-analytics',
  templateUrl: './coding-analytics.component.html',
  styleUrls: ['./coding-analytics.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NeoCardComponent,
    NeoButtonComponent,
    NeoSelectComponent
  ]
})
export class CodingAnalyticsComponent implements OnInit, OnChanges {
  @Input() sessionId?: number;
  codingAnalytics?: CodingAnalytics;
  allCodingAnalytics: CodingAnalytics[] = [];
  selectedTaskId?: number;
  loading = true;
  error = '';

  private analyticsService = inject(AnalyticsService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    if (this.sessionId) {
      this.loadAllCodingAnalytics(this.sessionId);
    } else {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.sessionId = +id;
          this.loadAllCodingAnalytics(this.sessionId);
        } else {
          this.error = 'Session ID not provided.';
          this.loading = false;
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sessionId'] && this.sessionId) {
      this.loadAllCodingAnalytics(this.sessionId);
    }
  }

  loadAllCodingAnalytics(sessionId: number): void {
    this.loading = true;
    this.analyticsService.getAllCodingAnalytics(sessionId).subscribe({
      next: (data: CodingAnalytics[]) => {
        this.allCodingAnalytics = data;
        if (this.allCodingAnalytics.length > 0) {
          this.selectedTaskId = this.allCodingAnalytics[0].taskId;
          this.updateSelectedTask();
        } else {
          this.codingAnalytics = undefined;
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load coding analytics data. Please try again later.';
        this.loading = false;
        console.error('Error loading coding analytics data:', err);
      }
    });
  }

  updateSelectedTask(): void {
    if (this.selectedTaskId) {
      this.codingAnalytics = this.allCodingAnalytics.find(task => task.taskId === this.selectedTaskId);
    }
  }

  onTaskChange(taskId: number): void {
    this.selectedTaskId = taskId;
    this.updateSelectedTask();
  }

  getTestPassRate(): number {
    if (!this.codingAnalytics) return 0;
    return this.codingAnalytics.passedTestCases / this.codingAnalytics.totalTestCases;
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

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  getCircleOffset(percentage: number): number {
    const circumference = 2 * Math.PI * 45; // 2πr where r=45
    return circumference * (1 - percentage);
  }
} 