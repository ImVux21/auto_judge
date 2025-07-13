import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Interview } from '../../shared/models/interview.model';
import { InterviewService } from '../../shared/services/interview.service';
import { CommonModule } from '@angular/common';
import { NeoButtonComponent, NeoCardComponent, NeoTableComponent, NeoTableColumn } from '@autojudge/ui';

@Component({
  selector: 'app-interview-list',
  templateUrl: './interview-list.component.html',
  styleUrls: ['./interview-list.component.css'],
  imports: [
    CommonModule,
    NeoCardComponent,
    NeoButtonComponent,
    NeoTableComponent
  ],
  standalone: true
})
export class InterviewListComponent implements OnInit {
  interviews: Interview[] = [];
  loading = true;
  error = '';
  
  tableColumns: NeoTableColumn<Interview>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true
    },
    {
      key: 'jobRole',
      header: 'Job Role',
      sortable: true
    },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      cellFn: (interview: Interview) => interview.active ? 'Active' : 'Inactive'
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      cellFn: (interview: Interview) => new Date(interview.createdAt).toLocaleDateString()
    }
  ];

  private interviewService = inject(InterviewService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.loading = true;
    this.interviewService.getInterviews().subscribe({
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
      this.interviewService.deactivateInterview(interview.id).subscribe({
        next: () => {
          interview.active = false;
        },
        error: (err) => {
          console.error('Error deactivating interview:', err);
        }
      });
    } else {
        this.interviewService.activateInterview(interview.id).subscribe({
        next: () => {
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
  
  trackByInterviewId(interview: Interview): number {
    return interview.id;
  }
  
  handleRowAction(interview: Interview): void {
    this.viewInterview(interview.id);
  }
  
  handleRowSelect(interviews: Interview[]): void {
    console.log('Selected interviews:', interviews);
  }
} 