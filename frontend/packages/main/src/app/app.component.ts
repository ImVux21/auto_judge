import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'AutoJudge';

  // Apply default theme (yellow)
  // You can change to any of these themes: theme-blue, theme-green, theme-orange, theme-violet
//   constructor(private renderer: Renderer2) {
//     this.renderer.addClass(document.body, 'theme-orange');
//   }
}
