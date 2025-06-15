import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeoMenubarTriggerComponent } from './neo-menubar-trigger.component';
import { NeoMenubarContentComponent } from './neo-menubar-content.component';

@Component({
  selector: 'app-neo-menubar-menu',
  standalone: true,
  imports: [CommonModule, NeoMenubarTriggerComponent, NeoMenubarContentComponent],
  template: `
    <div class="neo-menubar-menu relative" [class]="className">
      <app-neo-menubar-trigger 
        [isActive]="isOpen" 
        (triggerClick)="toggleMenu()"
        (document:click)="onDocumentClick($event)">
        <ng-content select="[menuTrigger]"></ng-content>
      </app-neo-menubar-trigger>
      
      <app-neo-menubar-content [isOpen]="isOpen">
        <ng-content select="[menuContent]"></ng-content>
      </app-neo-menubar-content>
    </div>
  `,
  styles: []
})
export class NeoMenubarMenuComponent implements OnDestroy {
  @Input() className: string = '';
  isOpen: boolean = false;
  
  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }
  
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.neo-menubar-menu')) {
      this.isOpen = false;
    }
  }
  
  ngOnDestroy(): void {
    this.isOpen = false;
  }
} 