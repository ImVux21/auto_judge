import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private apiService: ApiService) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(email: string, password: string): Observable<any> {
    return this.apiService.login(email, password).pipe(
      tap(response => {
        this.saveToken(response.token);
        this.saveUser(response);
        this.currentUserSubject.next(response);
      })
    );
  }

  register(firstName: string, lastName: string, email: string, password: string, roles?: string[]): Observable<any> {
    return this.apiService.register(firstName, lastName, email, password, roles);
  }

  logout(): void {
    window.sessionStorage.clear();
    this.currentUserSubject.next(null);
  }

  saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    if (user && user.roles) {
      return user.roles.includes(role);
    }
    return false;
  }

  isInterviewer(): boolean {
    return this.hasRole('ROLE_INTERVIEWER') || this.hasRole('ROLE_ADMIN');
  }

  isCandidate(): boolean {
    return this.hasRole('ROLE_CANDIDATE');
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }
} 