import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AutoJudge';
  
  constructor(private renderer: Renderer2) {}
  
  ngOnInit() {
    // Apply default theme (yellow)
    // You can change to any of these themes: theme-blue, theme-green, theme-orange, theme-violet
    this.renderer.addClass(document.body, 'theme-orange');
  }
} 