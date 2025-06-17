import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-neo-menubar-trigger',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="neo-menubar-trigger"
      [class.neo-menubar-trigger--open]="open"
      (click)="toggleMenu()"
    >
      <ng-content></ng-content>
      <span class="neo-menubar-trigger-icon" [class.open]="open">▼</span>
    </div>
  `,
  styles: [`
    .neo-menubar-trigger {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s ease;
      position: relative;
      border-bottom: 3px solid transparent;
    }
    
    .neo-menubar-trigger:hover {
      background-color: rgba(0, 0, 0, 0.05);
      border-bottom: 3px solid #000;
      transform: translateY(-2px);
    }
    
    .neo-menubar-trigger--open {
      background-color: #fff133;
      border-bottom: 3px solid #000;
      box-shadow: 3px 3px 0px #000;
      transform: translateY(-2px);
    }
    
    .neo-menubar-trigger-icon {
      font-size: 0.75rem;
      margin-left: 0.5rem;
      transition: transform 0.2s ease;
      display: inline-block;
    }
    
    .neo-menubar-trigger-icon.open {
      transform: rotate(180deg);
    }
  `]
})
export class NeoMenubarTriggerComponent {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  
  toggleMenu(): void {
    this.open = !this.open;
    this.openChange.emit(this.open);
  }
}
