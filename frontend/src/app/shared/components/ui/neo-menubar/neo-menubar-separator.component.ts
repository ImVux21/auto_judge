import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-neo-menubar-separator',
  standalone: true,
  imports: [CommonModule],
  template: `<hr class="my-2 border-t border-black">`,
  styles: []
})
export class NeoMenubarSeparatorComponent {} 