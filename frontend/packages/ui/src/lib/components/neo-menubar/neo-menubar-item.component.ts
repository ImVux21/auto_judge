import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-neo-menubar-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="neo-menubar-item"
      [class.neo-menubar-item--active]="active"
      [class.neo-menubar-item--disabled]="disabled"
      (click)="onClick()"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .neo-menubar-item {
      padding: 0.75rem 1.25rem;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s ease;
      position: relative;
      border-bottom: 3px solid transparent;
    }
    
    .neo-menubar-item:hover:not(.neo-menubar-item--disabled) {
      background-color: rgba(0, 0, 0, 0.05);
      border-bottom: 3px solid #000;
      transform: translateY(-2px);
    }
    
    .neo-menubar-item--active {
      background-color: #fff133;
      border-bottom: 3px solid #000;
      box-shadow: 3px 3px 0px #000;
      transform: translateY(-2px);
    }
    
    .neo-menubar-item--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* For links inside menu items */
    .neo-menubar-item a {
      color: inherit;
      text-decoration: none;
      display: block;
      margin: -0.75rem -1.25rem;
      padding: 0.75rem 1.25rem;
      font-weight: bold;
    }
  `]
})
export class NeoMenubarItemComponent {
  @Input() active = false;
  @Input() disabled = false;
  @Output() itemClick = new EventEmitter<void>();
  
  onClick(): void {
    if (!this.disabled) {
      this.itemClick.emit();
    }
  }
}
