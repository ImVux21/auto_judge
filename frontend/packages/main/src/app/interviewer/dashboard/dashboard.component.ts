import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { InterviewService } from '../../shared/services/interview.service';
import { AnalyticsService } from '../../shared/services/analytics.service';
import { Interview, InterviewSession } from '../../shared/models/interview.model';
import { NeoCardComponent } from 'packages/ui/dist';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
    CommonModule,
    NeoCardComponent,
    RouterLink
  ],
  standalone: true
})
export class DashboardComponent implements OnInit {
  dashboardData: any = {};
  loading = true;
  error = '';
  interviews: any[] = [];
  analytics: any = {};
  isLoading = true;

  private interviewService = inject(InterviewService);
  private analyticsService = inject(AnalyticsService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.analyticsService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data. Please try again later.';
        this.loading = false;
        console.error('Error loading dashboard data:', err);
      }
    });
  }

  getRecentInterviews(): Interview[] {
    return this.dashboardData.recentInterviews || [];
  }

  getRecentSessions(): InterviewSession[] {
    return this.dashboardData.recentSessions || [];
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  loadDashboard(): void {
    this.isLoading = true;
    
    // Load interviews
    this.interviewService.getInterviews().subscribe({
      next: (data) => {
        this.interviews = data;
        this.loadAnalytics();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Failed to load interviews';
        console.error(err);
      }
    });
  }

  loadAnalytics(): void {
    this.analyticsService.getDashboardData().subscribe({
      next: (data) => {
        this.analytics = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load analytics', err);
      }
    });
  }

  createInterview(): void {
    this.router.navigate(['/interviewer/interviews/create']);
  }

  viewInterview(id: number): void {
    this.router.navigate(['/interviewer/interviews', id]);
  }

  viewSessions(id: number): void {
    this.router.navigate(['/interviewer/interviews', id, 'sessions']);
  }

  toggleInterviewStatus(interview: any): void {
    const action = interview.active ? 
      this.interviewService.deactivateInterview(interview.id) : 
      this.interviewService.activateInterview(interview.id);
    
    action.subscribe({
      next: (updatedInterview) => {
        const index = this.interviews.findIndex(i => i.id === interview.id);
        if (index !== -1) {
          this.interviews[index] = updatedInterview;
        }
      },
      error: (err) => {
        console.error('Failed to update interview status', err);
      }
    });
  }
} 