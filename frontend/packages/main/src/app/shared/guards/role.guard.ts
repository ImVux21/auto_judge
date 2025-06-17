import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiredRole = route.data['role'] as string;
    
    if (!requiredRole) {
      console.warn('RoleGuard: No role specified in route data');
      return true;
    }
    
    if (!this.authService.isAuthenticated()) {
      return this.router.parseUrl('/auth/login');
    }
    
    if (this.authService.hasRole(requiredRole)) {
      return true;
    }
    
    return this.router.parseUrl('/unauthorized');
  }
}
