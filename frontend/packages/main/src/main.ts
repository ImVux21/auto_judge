import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { BASE_URL, SESSION_DATA_KEY, SESSION_KEY } from '@autojudge/core/dist';
import { AuthInterceptor } from 'packages/main/src/app/shared/interceptors/auth.interceptor';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    { provide: BASE_URL, useValue: environment.apiUrl },
    { provide: SESSION_KEY, useValue: 'session' },
    { provide: SESSION_DATA_KEY, useValue: 'sessionData' }
  ]
}); 