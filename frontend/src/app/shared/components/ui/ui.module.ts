import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeoButtonComponent } from './neo-button/neo-button.component';
import { NeoCardComponent } from './neo-card/neo-card.component';
import { NeoInputComponent } from './neo-input/neo-input.component';

@NgModule({
  imports: [
    CommonModule,
    NeoButtonComponent,
    NeoCardComponent,
    NeoInputComponent
  ],
  exports: [
    NeoButtonComponent,
    NeoCardComponent,
    NeoInputComponent
  ]
})
export class UiModule { } 