import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-neo-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [ngClass]="[
        'neo-card',
        variant === 'secondary' ? 'bg-secondary text-secondary-foreground' : '',
        variant === 'destructive' ? 'bg-destructive text-destructive-foreground' : '',
        noPadding ? 'p-0' : ''
      ]"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class NeoCardComponent {
  @Input() variant: 'default' | 'secondary' | 'destructive' = 'default';
  @Input() noPadding = false;
} 