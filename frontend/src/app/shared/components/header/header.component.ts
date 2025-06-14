import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isMenuOpen = false;
  showManageDropdown = false;
  showUserDropdown = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  toggleManageDropdown(): void {
    this.showManageDropdown = !this.showManageDropdown;
    if (this.showManageDropdown) {
      this.showUserDropdown = false;
    }
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
    if (this.showUserDropdown) {
      this.showManageDropdown = false;
    }
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