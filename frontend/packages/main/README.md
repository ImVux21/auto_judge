# AutoJudge Main Application

This is the main application package for AutoJudge, an automated interview assessment platform.

## Development

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher

### Setup

1. Make sure you're in the root directory of the monorepo
2. Install dependencies:

```bash
pnpm install
```

3. Build the required libraries:

```bash
pnpm build:core
pnpm build:ui
```

4. Start the development server:

```bash
pnpm start
```

5. Open your browser to `http://localhost:4200`

## Features

- Authentication and authorization with JWT
- Role-based access control
- Interviewer dashboard with analytics
- Interview creation and management
- Candidate interview session with proctoring
- Responsive design for all devices 