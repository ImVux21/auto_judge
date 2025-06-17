# Migration to Monorepo Structure

## What's Been Done

1. **Created Monorepo Structure**
   - Set up pnpm workspaces with `pnpm-workspace.yaml`
   - Created three packages: `main`, `core`, and `ui`
   - Updated root `package.json` with workspace scripts

2. **Created Package Configuration**
   - Created `package.json` for each package
   - Set up Angular library configuration for `core` and `ui` packages
   - Updated TypeScript to version 5.5.x for Angular 19 compatibility
   - Updated zone.js to version 0.15.x

3. **Created Directory Structure**
   - Set up proper directory structure for each package
   - Created migration script to move files from the old structure

4. **Updated Documentation**
   - Updated README.md with monorepo information
   - Created this migration guide

## What Needs to Be Done Next

1. **Fix Import Paths**
   - Update all import paths in the main application to use `@autojudge/core` and `@autojudge/ui`
   - Update component references in templates

2. **Update Component Files**
   - Move component files to their respective packages
   - Update component selectors if needed

3. **Fix Dependency Issues**
   - Resolve peer dependency warnings
   - Update `lucide-angular` to a version compatible with Angular 19
   - Check if `@angular/cdk` needs to be downgraded to match Angular 19

4. **Test the Build**
   - Build each package individually
   - Test the full application build
   - Fix any build errors

5. **Update Angular Configuration**
   - Update Angular configuration files for each package
   - Set up proper path mapping in tsconfig files

6. **Update CI/CD Pipeline**
   - Update any CI/CD pipeline configurations to work with the monorepo structure

## How to Complete the Migration

1. **Move Core Files**
   - Move all service files from `src/app/shared/services` to `packages/core/src/lib/services`
   - Move all guard files from `src/app/shared/guards` to `packages/core/src/lib/guards`
   - Move all interceptor files from `src/app/shared/interceptors` to `packages/core/src/lib/interceptors`
   - Move all model files from `src/app/shared/models` to `packages/core/src/lib/models`

2. **Move UI Files**
   - Move all UI component files from `src/app/shared/components` to `packages/ui/src/lib/components`

3. **Update Main App**
   - Update imports in the main app to use `@autojudge/core` and `@autojudge/ui`
   - Update the app module to import `CoreModule` and `UiModule`

4. **Build and Test**
   - Run `pnpm build:core` and `pnpm build:ui` to build the libraries
   - Run `pnpm start` to test the application

## Common Issues and Solutions

1. **Import Path Issues**
   - Use path aliases in tsconfig.json to make imports cleaner
   - Make sure to use the correct import paths: `@autojudge/core` and `@autojudge/ui`

2. **Build Order Issues**
   - Always build libraries before the main application
   - Use the root `pnpm build` script to ensure proper build order

3. **Dependency Issues**
   - Use `workspace:*` for internal dependencies
   - Make sure to use compatible versions of external dependencies 