import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-neo-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="type" 
      [disabled]="disabled"
      [ngClass]="[
        'neo-button',
        variant === 'outline' ? 'bg-background text-foreground hover:bg-primary hover:text-primary-foreground' : '',
        variant === 'destructive' ? 'bg-destructive text-destructive-foreground' : '',
        variant === 'secondary' ? 'bg-secondary text-secondary-foreground' : '',
        size === 'sm' ? 'py-1 px-3 text-sm' : '',
        size === 'lg' ? 'py-3 px-6 text-lg' : '',
        fullWidth ? 'w-full' : ''
      ]"
      (click)="onClick.emit($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: []
})
export class NeoButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'default' | 'destructive' | 'outline' | 'secondary' = 'default';
  @Input() size: 'default' | 'sm' | 'lg' = 'default';
  @Input() disabled = false;
  @Input() fullWidth = false;
  
  @Output() onClick = new EventEmitter<MouseEvent>();
} 