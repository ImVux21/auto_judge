import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-neo-menubar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="neo-menubar" [class]="className">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .neo-menubar {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
      border: 3px solid #000;
      background-color: #FFF133;
      box-shadow: 5px 5px 0px #000;
    }
    
    /* This will allow customizations when used in different contexts */
    .neo-menubar.bg-transparent {
      background-color: transparent;
    }
    
    .neo-menubar.border-0 {
      border: none;
    }
    
    .neo-menubar.shadow-none {
      box-shadow: none;
    }
    
    .neo-menubar.p-0 {
      padding: 0;
    }
  `]
})
export class NeoMenubarComponent {
  @Input() className = '';
}
