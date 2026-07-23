# Poll App

An Angular learning project for creating surveys, voting, and viewing live results. Survey data
can be stored in Supabase; when Supabase is not configured, the app automatically uses browser
`localStorage` for local development.

## Extras

- Supabase persistence with Row Level Security and a localStorage fallback
- live survey results that update after every submitted vote
- active, past, urgent, and category-filtered survey views
- responsive desktop, tablet, and mobile layouts
- accessible keyboard controls and form validation
- hover animations and a custom survey-list scrollbar
- 28 unit tests covering components, filtering, voting, and persistence

## Supabase setup

1. Create a Supabase project.
2. Open the project SQL Editor and run
   `supabase/migrations/20260719113000_create_poll_schema.sql`.
3. Run `supabase/seed.sql` in the SQL Editor to add the demo surveys.
4. Open **Project Settings → Data API** and copy the Project URL and Publishable key.
5. Add both public values to `src/environments/environment.ts`:

```ts
export const environment = {
  supabase: {
    url: 'https://YOUR_PROJECT.supabase.co',
    publishableKey: 'YOUR_PUBLISHABLE_KEY',
  },
} as const;
```

Never put the database password or a `service_role`/secret key in Angular code. The browser uses
only the public publishable key. Row Level Security is enabled by the migration, and database
changes are performed through the restricted `create_survey` and `submit_survey_vote` functions.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.9.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
