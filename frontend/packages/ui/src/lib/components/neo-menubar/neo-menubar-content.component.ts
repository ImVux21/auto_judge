import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-neo-menubar-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="neo-menubar-content" [class.neo-menubar-content--open]="open">
      <div class="neo-menubar-content-inner">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .neo-menubar-content {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      min-width: 220px;
      background-color: #fff;
      border: 3px solid #000;
      box-shadow: 5px 5px 0px #000;
      z-index: 100;
      display: none;
      animation: menuFadeIn 0.2s ease;
    }
    
    .neo-menubar-content--open {
      display: block;
    }
    
    .neo-menubar-content-inner {
      padding: 0;
    }
    
    /* Style child menu items in dropdown */
    .neo-menubar-content ::ng-deep .neo-menubar-item {
      padding: 0.75rem 1.25rem;
      border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    }
    
    .neo-menubar-content ::ng-deep .neo-menubar-item:last-child {
      border-bottom: none;
    }
    
    .neo-menubar-content ::ng-deep .neo-menubar-item:hover {
      background-color: #f8f8f8;
      transform: translateX(5px);
      border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    }
    
    .neo-menubar-content ::ng-deep .neo-menubar-item--active {
      background-color: #fff133;
      border-left: 3px solid #000;
      box-shadow: none;
      transform: none;
    }
    
    @keyframes menuFadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class NeoMenubarContentComponent {
  @Input() open = false;
}
