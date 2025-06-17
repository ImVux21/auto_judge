# AutoJudge Frontend Monorepo

This is the frontend monorepo for AutoJudge, an automated interview assessment platform.

## Monorepo Structure

The project is organized as a pnpm workspace with the following packages:

- **main**: The main Angular application
- **core**: Shared logic (API services, interceptors, guards, models)
- **ui**: Reusable neobrutalism UI components

## Neobrutalism UI

This project uses [neobrutalism.dev](https://www.neobrutalism.dev/) design principles, featuring:

- Bold colors
- Thick borders
- Strong shadows
- Playful interactions

## Available Components

The UI library includes the following components:

- `app-neo-button`: Neobrutalism-styled buttons
- `app-neo-card`: Neobrutalism-styled cards
- `app-neo-input`: Neobrutalism-styled form inputs

## Theme Colors

The application supports multiple themes:

- Default (yellow)
- Blue
- Green
- Orange
- Violet

To change the theme, add the appropriate class to the body:
- `theme-blue`
- `theme-green`
- `theme-orange`
- `theme-violet`

## Development

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher

### Setup

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm start
```

4. Open your browser to `http://localhost:4200`

### Build

To build all packages:

```bash
pnpm build
```

To build individual packages:

```bash
pnpm build:core
pnpm build:ui
pnpm build:main
```

## Component Usage Examples

### Button

```html
<app-neo-button>Click Me</app-neo-button>
<app-neo-button variant="outline">Outline</app-neo-button>
<app-neo-button variant="destructive">Delete</app-neo-button>
<app-neo-button size="sm">Small</app-neo-button>
<app-neo-button size="lg">Large</app-neo-button>
<app-neo-button [fullWidth]="true">Full Width</app-neo-button>
```

### Card

```html
<app-neo-card>
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</app-neo-card>

<app-neo-card variant="secondary">
  <h2>Secondary Card</h2>
</app-neo-card>
```

### Input

```html
<app-neo-input 
  label="Email" 
  placeholder="Enter your email"
  description="We'll never share your email."
  formControlName="email">
</app-neo-input>
```

## Technology Stack

- Angular 19
- Tailwind CSS
- RxJS
- pnpm Workspaces

## Project Structure

```
/
├─ packages/
│  ├─ main/             # Main Angular app
│  │  └─ src/
│  │     ├─ app/        # Application features
│  │     │  ├─ analytics/       # Analytics dashboard components
│  │     │  ├─ auth/            # Authentication components (login, register)
│  │     │  ├─ candidate/       # Candidate interview session components
│  │     │  ├─ interviewer/     # Interviewer dashboard and management components
│  │     │  ├─ profile/         # User profile components
│  │     │  ├─ app.component.*  # Root component
│  │     │  ├─ app.module.ts    # Root module
│  │     │  └─ app-routing.module.ts # Main routing configuration
│  │     ├─ assets/             # Static assets (images, icons, etc.)
│  │     └─ environments/       # Environment configuration
│  │
│  ├─ core/             # Shared logic
│  │  └─ src/
│  │     └─ lib/
│  │        ├─ services/        # API and other services
│  │        ├─ guards/          # Route guards
│  │        ├─ interceptors/    # HTTP interceptors
│  │        └─ models/          # Data models
│  │
│  └─ ui/               # UI components
│     └─ src/
│        └─ lib/
│           └─ components/      # Reusable UI components
│              ├─ neo-button/
│              ├─ neo-card/
│              ├─ neo-input/
│              └─ neo-menubar/
│
├─ package.json         # Root package.json with workspace config
└─ pnpm-workspace.yaml  # pnpm workspace configuration
```

## Features

- Authentication and authorization with JWT
- Role-based access control
- Interviewer dashboard with analytics
- Interview creation and management
- Candidate interview session with proctoring
- Responsive design for all devices
