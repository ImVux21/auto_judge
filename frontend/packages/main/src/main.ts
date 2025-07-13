import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { BASE_URL, SESSION_DATA_KEY, SESSION_KEY } from '@autojudge/core';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';

// Lazy load the auth interceptor to reduce initial bundle size
const getAuthInterceptor = () => import('./app/shared/interceptors/auth.interceptor').then(m => m.AuthInterceptor);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: async () => {
        const AuthInterceptor = await getAuthInterceptor();
        return new AuthInterceptor();
      },
      multi: true,
    },
    { provide: BASE_URL, useValue: environment.apiUrl },
    { provide: SESSION_KEY, useValue: 'session' },
    { provide: SESSION_DATA_KEY, useValue: 'sessionData' }
  ]
}); 