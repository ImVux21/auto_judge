import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
    NeoMenubarComponent,
    NeoMenubarContentComponent,
    NeoMenubarItemComponent,
    NeoMenubarMenuComponent,
    NeoMenubarSeparatorComponent,
    NeoMenubarTriggerComponent
} from '@autojudge/ui';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [
    RouterLink, 
    RouterLinkActive,
    NeoMenubarComponent, 
    NeoMenubarItemComponent, 
    NeoMenubarMenuComponent, 
    NeoMenubarSeparatorComponent,
    NeoMenubarTriggerComponent,
    NeoMenubarContentComponent
  ],
  standalone: true
})
export class HeaderComponent {
  showDashboardMenu = false;
  showManageMenu = false;
  showUserMenu = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  toggleDashboardMenu(isOpen: boolean): void {
    this.showDashboardMenu = isOpen;
    if (isOpen) {
      this.showManageMenu = false;
      this.showUserMenu = false;
    }
  }

  toggleManageMenu(isOpen: boolean): void {
    this.showManageMenu = isOpen;
    if (isOpen) {
      this.showDashboardMenu = false;
      this.showUserMenu = false;
    }
  }

  toggleUserMenu(isOpen: boolean): void {
    this.showUserMenu = isOpen;
    if (isOpen) {
      this.showDashboardMenu = false;
      this.showManageMenu = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  isInterviewer(): boolean {
    return this.authService.hasRole('ROLE_INTERVIEWER');
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  isCandidate(): boolean {
    return this.authService.hasRole('ROLE_CANDIDATE');
  }

  get currentUser(): any {
    return this.authService.getCurrentUser();
  }
} 