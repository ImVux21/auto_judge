import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-neo-menubar-trigger',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="neo-menubar-trigger px-3 py-1.5 cursor-pointer hover:bg-primary-foreground hover:text-primary transition-colors"
      [class.active]="isActive"
      [class]="className"
      (click)="triggerClick.emit()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .neo-menubar-trigger {
      position: relative;
      font-weight: 500;
    }
    
    .neo-menubar-trigger.active {
      background-color: var(--primary-foreground);
      color: var(--primary);
    }
  `]
})
export class NeoMenubarTriggerComponent {
  @Input() isActive: boolean = false;
  @Input() className: string = '';
  @Output() triggerClick = new EventEmitter<void>();
} 