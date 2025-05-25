# AutoJudge Frontend

This is the frontend application for the AutoJudge AI Interview Platform.

## Technology Stack

- Angular 17
- Tailwind CSS
- RxJS
- Angular Router

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:4200
   ```

## Project Structure

```
src/
├── app/
│   ├── analytics/       # Analytics dashboard components
│   ├── auth/            # Authentication components (login, register)
│   ├── candidate/       # Candidate interview session components
│   ├── interviewer/     # Interviewer dashboard and management components
│   ├── shared/          # Shared components, services, guards, etc.
│   ├── app.component.*  # Root component
│   ├── app.module.ts    # Root module
│   └── app-routing.module.ts # Main routing configuration
├── assets/              # Static assets (images, icons, etc.)
├── environments/        # Environment configuration
└── styles.css           # Global styles (includes Tailwind CSS)
```

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Features

- Authentication and authorization with JWT
- Role-based access control
- Interviewer dashboard with analytics
- Interview creation and management
- Candidate interview session with proctoring
- Responsive design for all devices
