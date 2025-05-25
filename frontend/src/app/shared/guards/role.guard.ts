import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    
    // Check if route has data roles
    const expectedRoles = route.data['roles'];
    if (!expectedRoles) {
      return true;
    }
    
    // Check if user has any of the required roles
    const user = this.authService.getUser();
    if (!user || !user.roles) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    
    const hasRole = expectedRoles.some((role: string) => user.roles.includes(role));
    
    if (!hasRole) {
      // Redirect to appropriate dashboard based on user role
      if (user.roles.includes('ROLE_CANDIDATE')) {
        this.router.navigate(['/candidate/sessions']);
      } else if (user.roles.includes('ROLE_INTERVIEWER') || user.roles.includes('ROLE_ADMIN')) {
        this.router.navigate(['/interviewer/dashboard']);
      } else {
        this.router.navigate(['/auth/login']);
      }
      return false;
    }
    
    return true;
  }
} 