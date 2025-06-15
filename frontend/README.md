# AutoJudge Frontend

This is the frontend application for AutoJudge, an automated interview assessment platform.

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

- Node.js 14.x or higher
- npm 6.x or higher

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open your browser to `http://localhost:4200`

### Build

To build the project for production:

```bash
npm run build
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

- Angular 17
- Tailwind CSS
- RxJS
- Angular Router

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
