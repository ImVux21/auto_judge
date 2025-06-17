import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(c => c.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(c => c.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'interviewer',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./interviewer/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'interviews',
        loadComponent: () => import('./interviewer/interview-list/interview-list.component').then(c => c.InterviewListComponent)
      },
      {
        path: 'interviews/create',
        loadComponent: () => import('./interviewer/create-interview/create-interview.component').then(c => c.CreateInterviewComponent)
      },
      {
        path: 'interviews/:id',
        loadComponent: () => import('./interviewer/interview-detail/interview-detail.component').then(c => c.InterviewDetailComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ],
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["ROLE_INTERVIEWER", "ROLE_ADMIN"] }
  },
  {
    path: 'candidate',
    children: [
      {
        path: 'sessions',
        loadComponent: () => import('./candidate/session-list/session-list.component').then(c => c.SessionListComponent)
      },
      {
        path: 'session/:token/start',
        loadComponent: () => import('./candidate/session-start/session-start.component').then(c => c.SessionStartComponent)
      },
      {
        path: 'session/:token',
        loadComponent: () => import('./candidate/interview-session/interview-session.component').then(c => c.InterviewSessionComponent)
      },
      {
        path: 'session/:token/complete',
        loadComponent: () => import('./candidate/session-complete/session-complete.component').then(c => c.SessionCompleteComponent)
      },
      {
        path: '',
        redirectTo: 'sessions',
        pathMatch: 'full'
      }
    ],
    canActivate: [AuthGuard],
    data: { roles: ["ROLE_CANDIDATE", "ROLE_INTERVIEWER", "ROLE_ADMIN"] }
  },
  {
    path: 'analytics',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./analytics/analytics-dashboard/analytics-dashboard.component').then(c => c.AnalyticsDashboardComponent)
      },
      {
        path: 'interview/:id',
        loadComponent: () => import('./analytics/interview-analytics/interview-analytics.component').then(c => c.InterviewAnalyticsComponent)
      },
      {
        path: 'session/:id',
        loadComponent: () => import('./analytics/session-analytics/session-analytics.component').then(c => c.SessionAnalyticsComponent)
      }
    ],
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["ROLE_INTERVIEWER", "ROLE_ADMIN"] }
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(c => c.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
]; 