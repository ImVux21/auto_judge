import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showHeader = true;
  showFooter = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide header and footer on interview session pages
      const url = event.urlAfterRedirects;
      this.showHeader = !url.includes('/candidate/session/');
      this.showFooter = !url.includes('/candidate/session/');
    });
  }
} 