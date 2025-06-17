# AutoJudge Core Library

This library provides core functionality for the AutoJudge platform, including:

- API services for communication with the backend
- Authentication and authorization
- Guards for route protection
- HTTP interceptors
- Data models

## Usage

Import the CoreModule in your app module:

```typescript
import { CoreModule } from '@autojudge/core';

@NgModule({
  imports: [
    CoreModule
  ]
})
export class AppModule { }
```

Or import individual services in standalone components:

```typescript
import { Component } from '@angular/core';
import { AuthService } from '@autojudge/core';

@Component({
  standalone: true,
  // ...
})
export class MyComponent {
  constructor(private authService: AuthService) {}
}
```

## Available Services

### ApiService

Base service for making HTTP requests to the API.

### AuthService

Handles user authentication, session management, and role-based access control.

### AnalyticsService

Provides methods for retrieving and tracking analytics data.

### CandidateService

Manages candidate data and interview sessions.

### InterviewService

Handles interview creation, scheduling, and evaluation.

## Guards

### AuthGuard

Protects routes from unauthorized access.

### RoleGuard

Restricts access to routes based on user roles.

## Interceptors

### AuthInterceptor

Automatically adds authentication tokens to outgoing HTTP requests.

## Models

The library includes TypeScript interfaces and enums for all data models used in the application. 