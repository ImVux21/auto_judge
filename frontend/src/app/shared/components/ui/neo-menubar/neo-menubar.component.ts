import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-neo-menubar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './neo-menubar.component.html',
  styleUrls: ['./neo-menubar.component.scss']
})
export class NeoMenubarComponent {
  @Input() className: string = '';
} 