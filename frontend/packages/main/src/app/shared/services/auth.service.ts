import { inject, Injectable } from "@angular/core";
import { ApiService, SessionService } from "@autojudge/core/dist";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { AuthResponse, User } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private apiService = inject(ApiService);  
  private sessionService = inject(SessionService);

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.currentUserSubject.next(this.getStoredUser() as User);
  }

  login(email: string, password: string): Observable<any> {
    return this.apiService
      .post<any>({
        api: "auth",
        url: "signin",
        body: { email, password },
      })
      .pipe(
        tap((response) => {
          this.sessionService.saveSession(response.token);
          this.sessionService.saveSessionData(response);
          this.currentUserSubject.next(response);
        })
      );
  }

  register(firstName: string, lastName: string, email: string, password: string, roles?: string[]): Observable<AuthResponse> {
    return this.apiService.post<any>({
      api: "auth",
      url: "signup",
      body: { firstName, lastName, email, password, roles },
    });
  }

  logout(): void {
    this.sessionService.clearSession();
    this.currentUserSubject.next(null);
  }

  saveUser(user: User): void {
    this.sessionService.saveSessionData(user);
    this.currentUserSubject.next(user);
  }

  getToken(): string | null {
    return this.sessionService.getSession();
  }

  isAuthenticated(): boolean {
    return !!this.sessionService.getSession();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles?.includes(role) : false;
  }

  private getStoredUser(): User | null {
    const storedUser = this.sessionService.getSessionData();
    if (storedUser) {
      return storedUser as User;
    }
    return null;
  }
}
