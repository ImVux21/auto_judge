import { inject, Injectable } from "@angular/core";
import { SESSION_DATA_KEY, SESSION_KEY } from "../tokens/session.token";

@Injectable({
  providedIn: "root",
})
export class SessionService {
  private readonly sessionKey = inject(SESSION_KEY);
  private readonly sessionDataKey = inject(SESSION_DATA_KEY);

  /**
   * Save session token
   */
  saveSession(sessionId: string): void {
    window.sessionStorage.removeItem(this.sessionKey);
    window.sessionStorage.setItem(this.sessionKey, sessionId);
  }

  /**
   * Get current session token
   */
  getSession(): string | null {
    return window.sessionStorage.getItem(this.sessionKey);
  }

  /**
   * Save session data
   */
  saveSessionData(data: any): void {
    window.sessionStorage.removeItem(this.sessionDataKey);
    window.sessionStorage.setItem(this.sessionDataKey, JSON.stringify(data));
  }

  /**
   * Get session data
   */
  getSessionData(): any {
    const data = window.sessionStorage.getItem(this.sessionDataKey);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }

  /**
   * Update specific session data field
   */
  updateSessionData(key: string, value: any): void {
    const data = this.getSessionData() || {};
    data[key] = value;
    this.saveSessionData(data);
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    window.sessionStorage.removeItem(this.sessionKey);
    window.sessionStorage.removeItem(this.sessionDataKey);
  }

  /**
   * Check if session exists
   */
  hasActiveSession(): boolean {
    return !!this.getSession();
  }
}
