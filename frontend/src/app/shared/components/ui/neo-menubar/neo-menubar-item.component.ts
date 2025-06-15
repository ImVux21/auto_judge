import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-neo-menubar-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="neo-menubar-item px-3 py-1.5 cursor-pointer hover:bg-primary-foreground hover:text-primary transition-colors"
      [class.disabled]="disabled"
      [class]="className">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .neo-menubar-item {
      position: relative;
      font-weight: 500;
    }
    
    .neo-menubar-item.disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  `]
})
export class NeoMenubarItemComponent {
  @Input() disabled: boolean = false;
  @Input() className: string = '';
} 