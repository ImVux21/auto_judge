import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { Interview } from '../../shared/models/interview.model';

@Component({
  selector: 'app-interview-list',
  templateUrl: './interview-list.component.html',
  styleUrls: ['./interview-list.component.css']
})
export class InterviewListComponent implements OnInit {
  interviews: Interview[] = [];
  loading = true;
  error = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.loading = true;
    this.apiService.getInterviews().subscribe({
      next: (data) => {
        this.interviews = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load interviews. Please try again later.';
        this.loading = false;
        console.error('Error loading interviews:', err);
      }
    });
  }

  viewInterview(id: number): void {
    this.router.navigate(['/interviewer/interviews', id]);
  }

  toggleInterviewStatus(interview: Interview): void {
    if (interview.active) {
      this.apiService.deactivateInterview(interview.id).subscribe({
        next: (updatedInterview) => {
          interview.active = false;
        },
        error: (err) => {
          console.error('Error deactivating interview:', err);
        }
      });
    } else {
      this.apiService.activateInterview(interview.id).subscribe({
        next: (updatedInterview) => {
          interview.active = true;
        },
        error: (err) => {
          console.error('Error activating interview:', err);
        }
      });
    }
  }

  createInterview(): void {
    this.router.navigate(['/interviewer/interviews/create']);
  }
} 