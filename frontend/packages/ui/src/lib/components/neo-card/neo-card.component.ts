import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type CardVariant = 'default' | 'secondary' | 'outline';

@Component({
  selector: 'app-neo-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="neo-card"
      [class.neo-card--secondary]="variant === 'secondary'"
      [class.neo-card--outline]="variant === 'outline'"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .neo-card {
      padding: 1.5rem;
      border: 3px solid #000;
      background-color: #FFF133;
      box-shadow: 5px 5px 0px #000;
      margin-bottom: 1.5rem;
    }
    
    .neo-card--secondary {
      background-color: #FFFFFF;
    }
    
    .neo-card--outline {
      background-color: transparent;
    }
  `]
})
export class NeoCardComponent {
  @Input() variant: CardVariant = 'default';
}
