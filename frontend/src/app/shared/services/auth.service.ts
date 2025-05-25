import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/signin`, {
      email,
      password
    }).pipe(
      tap((response: any) => {
        this.saveToken(response.token);
        this.saveUser(response);
        this.currentUserSubject.next(response);
      })
    );
  }

  register(firstName: string, lastName: string, email: string, password: string, roles: string[] = []): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, {
      firstName,
      lastName,
      email,
      password,
      roles
    });
  }

  logout(): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
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
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.includes(role);
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