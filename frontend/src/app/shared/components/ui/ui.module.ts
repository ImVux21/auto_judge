import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeoButtonComponent } from './neo-button/neo-button.component';
import { NeoCardComponent } from './neo-card/neo-card.component';
import { NeoInputComponent } from './neo-input/neo-input.component';
import { 
  NeoMenubarComponent,
  NeoMenubarItemComponent,
  NeoMenubarTriggerComponent,
  NeoMenubarContentComponent,
  NeoMenubarSeparatorComponent,
  NeoMenubarMenuComponent
} from './neo-menubar';

@NgModule({
  imports: [
    CommonModule,
    NeoButtonComponent,
    NeoCardComponent,
    NeoInputComponent,
    NeoMenubarComponent,
    NeoMenubarItemComponent,
    NeoMenubarTriggerComponent,
    NeoMenubarContentComponent,
    NeoMenubarSeparatorComponent,
    NeoMenubarMenuComponent
  ],
  exports: [
    NeoButtonComponent,
    NeoCardComponent,
    NeoInputComponent,
    NeoMenubarComponent,
    NeoMenubarItemComponent,
    NeoMenubarTriggerComponent,
    NeoMenubarContentComponent,
    NeoMenubarSeparatorComponent,
    NeoMenubarMenuComponent
  ]
})
export class UiModule { } 