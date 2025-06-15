import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LogoutButtonComponent } from './components/logout-button/logout-button.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { UiModule } from './components/ui/ui.module';

@NgModule({
  declarations: [
    LogoutButtonComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    UiModule
  ],
  exports: [
    LogoutButtonComponent,
    HeaderComponent,
    FooterComponent,
    UiModule
  ]
})
export class SharedModule { } 