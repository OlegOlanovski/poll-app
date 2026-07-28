# Poll App

A responsive Angular learning project for creating surveys, voting, and viewing live results.

[Live demo](https://oleg-olanovski.developerakademie.net)

## Features

- active, past, urgent, and category-filtered surveys
- validated survey creation with dynamic questions and answers
- single-choice and multiple-choice voting with live results
- Supabase persistence with local fallback data
- responsive and accessible desktop, tablet, and mobile layouts
- browser protection against submitting the same survey twice

## Tech stack

Angular 21, TypeScript, SCSS, Reactive Forms, Supabase, Vitest, and Angular TestBed.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200/`.

## Tests and build

```bash
npm test -- --watch=false
npm run build
```

The project contains **46 unit and component tests**. E2E tests are not configured.

## Supabase

Run the SQL files from `supabase/migrations/` and `supabase/seed.sql`, then add the public project
URL and publishable key to `src/environments/environment.ts`.

Never add a database password or a `service_role` key to the Angular application.

The production files are generated in `dist/poll-app/browser/`. For Apache hosting, upload all
files from this directory, including `.htaccess`.
