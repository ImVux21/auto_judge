import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-neo-menubar-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="isOpen"
      class="neo-menubar-content absolute top-full left-0 mt-1 p-2 bg-white border-2 border-black shadow-brutal min-w-[12rem] z-50"
      [class]="className">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .neo-menubar-content {
      box-shadow: 4px 4px 0 0 rgba(0, 0, 0, 1);
    }
    
    .shadow-brutal {
      box-shadow: 4px 4px 0 0 rgba(0, 0, 0, 1);
    }
  `]
})
export class NeoMenubarContentComponent {
  @Input() isOpen: boolean = false;
  @Input() className: string = '';
} 