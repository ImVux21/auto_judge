import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'default' | 'outline' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-neo-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="neo-button"
      [class.neo-button--outline]="variant === 'outline'"
      [class.neo-button--destructive]="variant === 'destructive'"
      [class.neo-button--sm]="size === 'sm'"
      [class.neo-button--lg]="size === 'lg'"
      [class.neo-button--full-width]="fullWidth"
      [disabled]="disabled"
      (click)="onClick.emit($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .neo-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.5rem;
      font-weight: bold;
      font-size: 1rem;
      border: 3px solid #000;
      background-color: #FFF133;
      box-shadow: 5px 5px 0px #000;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .neo-button:hover {
      transform: translate(-2px, -2px);
      box-shadow: 7px 7px 0px #000;
    }
    
    .neo-button:active {
      transform: translate(2px, 2px);
      box-shadow: 3px 3px 0px #000;
    }
    
    .neo-button--outline {
      background-color: transparent;
    }
    
    .neo-button--destructive {
      background-color: #FF4D4F;
    }
    
    .neo-button--sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
    
    .neo-button--lg {
      padding: 1rem 2rem;
      font-size: 1.125rem;
    }
    
    .neo-button--full-width {
      width: 100%;
    }
    
    .neo-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }
  `]
})
export class NeoButtonComponent {
  @Input() variant: ButtonVariant = 'default';
  @Input() size: ButtonSize = 'md';
  @Input() fullWidth = false;
  @Input() disabled = false;
  
  @Output() onClick = new EventEmitter<MouseEvent>();
}
