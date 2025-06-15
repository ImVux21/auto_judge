import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements AfterViewInit {
  isMenuOpen = false;
  dropdowns: any[] = [];

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngAfterViewInit(): void {
    // Initialize all dropdowns
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    this.dropdowns = dropdownElementList.map(function (dropdownToggleEl) {
      return new bootstrap.Dropdown(dropdownToggleEl);
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isInterviewer(): boolean {
    return this.authService.isInterviewer();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isCandidate(): boolean {
    return this.authService.isCandidate();
  }

  get currentUser(): any {
    return this.authService.currentUserValue;
  }
} 