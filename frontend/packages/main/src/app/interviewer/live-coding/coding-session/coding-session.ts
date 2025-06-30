import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NeoButtonComponent, NeoCardComponent, NeoTableComponent } from '@autojudge/ui/dist';
import { CodingService } from '../../../shared/services/coding.service';
import { CodingTask } from '../../../shared/models/coding.model';

@Component({
  selector: 'app-coding-session',
  templateUrl: './coding-session.html',
  styleUrls: ['./coding-session.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NeoCardComponent,
    NeoButtonComponent,
    NeoTableComponent
  ]
})
export class CodingSessionComponent implements OnInit {
  codingTasks: CodingTask[] = [];
  loading = true;
  error = '';
  taskId: string | null = null;
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private codingService = inject(CodingService);
  
  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id');
    
    if (this.taskId) {
      this.loadCodingTask();
    } else {
      this.loadCodingTasks();
    }
  }
  
  loadCodingTasks(): void {
    this.loading = true;
    this.codingService.getCodingTasks().subscribe({
      next: (tasks) => {
        this.codingTasks = tasks;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load coding tasks';
        this.loading = false;
        console.error('Error loading coding tasks:', err);
      }
    });
  }
  
  loadCodingTask(): void {
    if (!this.taskId) return;
    
    this.loading = true;
    this.codingService.getCodingTask(Number(this.taskId)).subscribe({
      next: (task) => {
        // For now, we'll just redirect to the task list
        // In a future implementation, this would show task details
        this.router.navigate(['/interviewer/live-coding/tasks']);
      },
      error: (err) => {
        this.error = 'Failed to load coding task';
        this.loading = false;
        console.error('Error loading coding task:', err);
      }
    });
  }
  
  createTask(): void {
    this.router.navigate(['/interviewer/live-coding/tasks/create']);
  }
  
  viewTask(taskId: number): void {
    // For now, we'll just refresh the page
    // In a future implementation, this would show task details
    console.log('View task:', taskId);
  }
  
  deleteTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.codingService.deleteCodingTask(taskId).subscribe({
        next: () => {
          this.codingTasks = this.codingTasks.filter(task => task.id !== taskId);
        },
        error: (err) => {
          this.error = 'Failed to delete coding task';
          console.error('Error deleting coding task:', err);
        }
      });
    }
  }
} 