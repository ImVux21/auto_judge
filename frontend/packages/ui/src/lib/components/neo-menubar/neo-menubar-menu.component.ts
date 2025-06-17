import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-neo-menubar-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="neo-menubar-menu">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .neo-menubar-menu {
      position: relative;
      display: inline-block;
    }
  `]
})
export class NeoMenubarMenuComponent {
  @Input() label = '';
  @ContentChild('content') contentTemplate!: TemplateRef<any>;
}
