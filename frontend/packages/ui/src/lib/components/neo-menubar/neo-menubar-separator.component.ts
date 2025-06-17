import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-neo-menubar-separator',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="neo-menubar-separator"></div>`,
  styles: [`
    .neo-menubar-separator {
      height: 2px;
      background-color: #000;
      margin: 0.5rem 0;
    }
  `]
})
export class NeoMenubarSeparatorComponent {}
