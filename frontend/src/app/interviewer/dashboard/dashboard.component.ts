import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InterviewService } from '../../shared/services/interview.service';
import { AnalyticsService } from '../../shared/services/analytics.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  interviews: any[] = [];
  analytics: any = {};
  isLoading = true;
  error = '';

  constructor(
    private interviewService: InterviewService,
    private analyticsService: AnalyticsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
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