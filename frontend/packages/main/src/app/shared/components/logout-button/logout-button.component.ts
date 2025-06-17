import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NeoButtonComponent } from 'packages/ui/dist';

@Component({
  selector: 'app-logout-button',
  templateUrl: './logout-button.component.html',
  styleUrls: ['./logout-button.component.css'],
  imports: [NeoButtonComponent],
  standalone: true
})
export class LogoutButtonComponent {
  isLoggingOut = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  logout(): void {
    this.isLoggingOut = true;
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
} 