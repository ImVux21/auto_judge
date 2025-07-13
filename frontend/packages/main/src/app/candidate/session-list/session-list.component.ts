import { Component, inject, OnInit, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NeoCardComponent, NeoInputComponent, NeoButtonComponent, NeoTableComponent, NeoTableColumn } from '@autojudge/ui';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../../shared/services/candidate.service';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NeoCardComponent,
    NeoInputComponent,
    NeoButtonComponent,
    NeoTableComponent
  ],
  standalone: true
})
export class SessionListComponent implements OnInit, AfterViewInit {
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  @ViewChild('dateTemplate') dateTemplate!: TemplateRef<any>;
  @ViewChild('scoreTemplate') scoreTemplate!: TemplateRef<any>;
  @ViewChild('actionTemplate') actionTemplate!: TemplateRef<any>;

  sessions: any[] = [];
  loading = false;
  error = '';
  token = '';
  
  tableColumns: NeoTableColumn[] = [
    { key: 'interview.title', header: 'Interview', sortable: true },
    { key: 'startTime', header: 'Date', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'score', header: 'Score', sortable: true }
  ];

  private candidateService = inject(CandidateService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadSessions();
  }

  ngAfterViewInit(): void {
    // Update columns with templates after view is initialized
    setTimeout(() => {
      this.tableColumns = [
        { key: 'interview.title', header: 'Interview', sortable: true },
        { key: 'startTime', header: 'Date', sortable: true, template: this.dateTemplate },
        { key: 'status', header: 'Status', sortable: true, template: this.statusTemplate },
        { key: 'score', header: 'Score', sortable: true, template: this.scoreTemplate }
      ];
    });
  }

  loadSessions(): void {
    this.loading = true;
    this.error = '';
    
    this.candidateService.getCandidateSessions().subscribe({
      next: (data) => {
        this.sessions = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load your interview sessions. Please try again later.';
        this.loading = false;
        console.error('Error loading sessions:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  continueSession(sessionToken?: string): void {
    const token = sessionToken || this.token;
    if (!token) {
      this.error = 'Please enter a valid session token';
      return;
    }
    this.router.navigate(['/candidate/session', token]);
  }

  viewResults(token: string): void {
    this.router.navigate(['/candidate/session', token, 'complete']);
  }
  
  handleRowAction(session: any): void {
    if (session.status === 'PENDING' || session.status === 'IN_PROGRESS') {
      this.continueSession(session.accessToken);
    } else if (session.status === 'COMPLETED') {
      this.viewResults(session.accessToken);
    }
  }
} 