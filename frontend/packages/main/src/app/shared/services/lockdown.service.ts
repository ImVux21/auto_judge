import { Injectable, inject } from '@angular/core';
import { ApiService } from '@autojudge/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LockdownService {
  private apiService = inject(ApiService);

  // Security events
  recordSecurityEvent(token: string, eventType: string, eventDetails: string, severity: number = 1): Observable<any> {
    return this.apiService.post<any>({
      api: 'default',
      url: `api/lockdown/sessions/${token}/events`,
      body: {
        eventType,
        eventDetails,
        severity
      },
    });
  }

  getSecurityEvents(token: string): Observable<any[]> {
    return this.apiService.get<any[]>({
      api: 'default',
      url: `api/lockdown/sessions/${token}/events`,
    });
  }

  getViolationCount(token: string): Observable<any> {
    return this.apiService.get<any>({
      api: 'default',
      url: `api/lockdown/sessions/${token}/violations`,
    });
  }

  getSecurityStatus(token: string): Observable<any> {
    return this.apiService.get<any>({
      api: 'default',
      url: `api/lockdown/sessions/${token}/status`,
    });
  }

  // Specific event types
  recordFullscreenExit(token: string): Observable<any> {
    return this.recordSecurityEvent(
      token,
      'FULLSCREEN_EXIT',
      'User exited fullscreen mode',
      2 // Medium severity
    );
  }

  recordTabSwitch(token: string): Observable<any> {
    return this.recordSecurityEvent(
      token,
      'TAB_SWITCH',
      'User switched to another tab or application',
      2 // Medium severity
    );
  }

  recordCopyPaste(token: string, content?: string): Observable<any> {
    return this.recordSecurityEvent(
      token,
      'COPY_PASTE',
      `User attempted to copy or paste content${content ? ': ' + content : ''}`,
      3 // High severity
    );
  }

  recordKeyboardShortcut(token: string, shortcut: string): Observable<any> {
    return this.recordSecurityEvent(
      token,
      'KEYBOARD_SHORTCUT',
      `User attempted to use keyboard shortcut: ${shortcut}`,
      2 // Medium severity
    );
  }

  recordPrintScreen(token: string): Observable<any> {
    return this.recordSecurityEvent(
      token,
      'PRINT_SCREEN',
      'User attempted to print screen or take screenshot',
      3 // High severity
    );
  }

  // Lockdown mode helpers
  enforceFullScreen(element: HTMLElement): void {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
  }

  exitFullScreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  }

  isFullScreen(): boolean {
    return !!(document.fullscreenElement || 
              (document as any).webkitFullscreenElement || 
              (document as any).msFullscreenElement);
  }

  disableCopyPaste(element: HTMLElement): void {
    // Disable context menu
    element.addEventListener('contextmenu', e => e.preventDefault());
    
    // Disable copy/paste keyboard shortcuts
    element.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && 
          (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
      }
    });
  }

  // Monitor tab visibility changes
  setupVisibilityChangeDetection(token: string, callback?: (isHidden: boolean) => void): void {
    document.addEventListener('visibilitychange', () => {
      const isHidden = document.hidden;
      
      if (isHidden) {
        this.recordSecurityEvent(
          token,
          'VISIBILITY_HIDDEN',
          'Page visibility changed to hidden',
          2 // Medium severity
        ).subscribe();
      } else {
        this.recordSecurityEvent(
          token,
          'VISIBILITY_VISIBLE',
          'Page visibility changed to visible',
          1 // Low severity
        ).subscribe();
      }
      
      if (callback) {
        callback(isHidden);
      }
    });
  }

  // Monitor fullscreen changes
  setupFullscreenChangeDetection(token: string, callback?: (isFullscreen: boolean) => void): void {
    const fullscreenChangeHandler = () => {
      const isFullscreen = this.isFullScreen();
      
      if (!isFullscreen) {
        this.recordFullscreenExit(token).subscribe();
      }
      
      if (callback) {
        callback(isFullscreen);
      }
    };
    
    document.addEventListener('fullscreenchange', fullscreenChangeHandler);
    document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
    document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
    document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);
  }
} 