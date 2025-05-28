import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const requiredRoles = route.data['roles'] as Array<string>;
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    const hasRequiredRole = requiredRoles.some(role => this.authService.hasRole(role));
    
    if (hasRequiredRole) {
      return true;
    }
    
    this.router.navigate(['/auth/login']);
    return false;
  }
} 