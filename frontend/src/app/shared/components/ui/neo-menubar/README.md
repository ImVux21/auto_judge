# Neo-Menubar Component

A neobrutalism-styled menubar component for Angular applications.

## Components

- `NeoMenubarComponent`: The main container for the menubar
- `NeoMenubarMenuComponent`: A menu container with trigger and content
- `NeoMenubarTriggerComponent`: The clickable trigger for a menu
- `NeoMenubarContentComponent`: The dropdown content container
- `NeoMenubarItemComponent`: An item within the menubar or dropdown
- `NeoMenubarSeparatorComponent`: A separator for dropdown menus

## Usage

```html
<app-neo-menubar>
  <app-neo-menubar-menu>
    <div menuTrigger>File</div>
    <div menuContent>
      <app-neo-menubar-item>
        <a class="block w-full" href="#">New File</a>
      </app-neo-menubar-item>
      <app-neo-menubar-item>
        <a class="block w-full" href="#">Open</a>
      </app-neo-menubar-item>
      <app-neo-menubar-separator></app-neo-menubar-separator>
      <app-neo-menubar-item>
        <a class="block w-full" href="#">Exit</a>
      </app-neo-menubar-item>
    </div>
  </app-neo-menubar-menu>
  
  <app-neo-menubar-item>
    <a href="#">Simple Link</a>
  </app-neo-menubar-item>
</app-neo-menubar>
```

## Styling

The menubar uses neobrutalism design principles with:
- Bold black borders
- Offset shadows
- Bright colors
- Simple, functional design

You can customize the appearance by passing a `className` prop to any component. 