import { Injectable, inject } from '@angular/core';
import { ApiService } from '@autojudge/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProctorService {
  private apiService = inject(ApiService);

  // Snapshot management
  submitSnapshot(token: string, imageBase64: string, timestamp: number, eventType: string = 'NORMAL'): Observable<any> {
    return this.apiService.post<any>({
      api: 'default',
      url: `api/proctor/sessions/${token}/snapshots?timestamp=${timestamp}&eventType=${eventType}`,
      body: imageBase64,
    });
  }

  getSnapshots(token: string): Observable<any[]> {
    return this.apiService.get<any[]>({
      api: 'default',
      url: `api/proctor/sessions/${token}/snapshots`,
    });
  }

  getFlaggedSnapshots(token: string): Observable<any[]> {
    return this.apiService.get<any[]>({
      api: 'default',
      url: `api/proctor/sessions/${token}/snapshots/flagged`,
    });
  }

  getSuspiciousSnapshots(token: string): Observable<any[]> {
    return this.apiService.get<any[]>({
      api: 'default',
      url: `api/proctor/sessions/${token}/snapshots/suspicious`,
    });
  }

  // Security events management
  recordSecurityEvent(token: string, eventType: string, eventDetails: string, severity: number = 1): Observable<any> {
    return this.apiService.post<any>({
      api: 'default',
      url: `api/proctor/sessions/${token}/events`,
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
      url: `api/proctor/sessions/${token}/events`,
    });
  }

  getSecurityStatus(token: string): Observable<any> {
    return this.apiService.get<any>({
      api: 'default',
      url: `api/proctor/sessions/${token}/security/status`,
    });
  }

  // Lockdown specific events 
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

  recordVisibilityHidden(token: string): Observable<any> {
    return this.recordSecurityEvent(
      token,
      'VISIBILITY_HIDDEN',
      'Page visibility changed to hidden',
      2 // Medium severity
    );
  }

  recordVisibilityVisible(token: string): Observable<any> {
    return this.recordSecurityEvent(
      token,
      'VISIBILITY_VISIBLE',
      'Page visibility changed to visible',
      1 // Low severity
    );
  }

  // Proctor notes
  addProctorNote(token: string, note: string): Observable<any> {
    return this.apiService.post<any>({
      api: 'default',
      url: `api/proctor/sessions/${token}/notes`,
      body: { note },
    });
  }
} 