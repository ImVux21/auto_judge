# AutoJudge UI Library

This library provides reusable UI components for the AutoJudge platform, featuring a neobrutalism design style.

## Usage

Import the UiModule in your app module:

```typescript
import { UiModule } from '@autojudge/ui';

@NgModule({
  imports: [
    UiModule
  ]
})
export class AppModule { }
```

Or import individual components in standalone components:

```typescript
import { Component } from '@angular/core';
import { NeoButtonComponent } from '@autojudge/ui';

@Component({
  standalone: true,
  imports: [NeoButtonComponent],
  // ...
})
export class MyComponent {}
```

## Available Components

### Neo Button

A button component with neobrutalism styling.

```html
<app-neo-button>Click Me</app-neo-button>
<app-neo-button variant="outline">Outline</app-neo-button>
<app-neo-button variant="destructive">Delete</app-neo-button>
<app-neo-button size="sm">Small</app-neo-button>
<app-neo-button size="lg">Large</app-neo-button>
<app-neo-button [fullWidth]="true">Full Width</app-neo-button>
```

### Neo Card

A card component with neobrutalism styling.

```html
<app-neo-card>
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</app-neo-card>

<app-neo-card variant="secondary">
  <h2>Secondary Card</h2>
</app-neo-card>
```

### Neo Input

A form input component with neobrutalism styling.

```html
<app-neo-input 
  label="Email" 
  placeholder="Enter your email"
  description="We'll never share your email."
  formControlName="email">
</app-neo-input>
```

### Neo Menubar

A menubar component with neobrutalism styling.

```html
<app-neo-menubar>
  <app-neo-menubar-item>Home</app-neo-menubar-item>
  <app-neo-menubar-menu>
    <app-neo-menubar-trigger>Menu</app-neo-menubar-trigger>
    <app-neo-menubar-content>
      <app-neo-menubar-item>Item 1</app-neo-menubar-item>
      <app-neo-menubar-item>Item 2</app-neo-menubar-item>
      <app-neo-menubar-separator></app-neo-menubar-separator>
      <app-neo-menubar-item>Item 3</app-neo-menubar-item>
    </app-neo-menubar-content>
  </app-neo-menubar-menu>
</app-neo-menubar>
```

## Theme Colors

The UI library supports multiple themes:

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