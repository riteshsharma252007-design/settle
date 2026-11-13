# Settle

Settle is a mobile-first web app that matches people who want to share a flat,
based on how they actually live: budget, areas, sleep schedule, cleanliness,
guests, smoking and pets. Matched people chat first, then decide.

Status: **M0 (project setup) complete.** See `docs/` for the full plan.

## What you need installed

- Node.js 24 (the version in `.nvmrc`)
- Git
- PostgreSQL 16 or newer (needed from milestone M1 onwards)

## Run it on your computer

1. Download the code and go into the folder:

   ```bash
   git clone https://github.com/riteshsharma252007-design/settle.git
   cd settle
   ```

2. Install everything (one command installs both `client` and `server`):

   ```bash
   npm install
   ```

3. Create your private settings file from the template.

   Windows PowerShell:

   ```powershell
   copy .env.example .env
   ```

   Mac or Linux:

   ```bash
   cp .env.example .env
   ```

4. Start the app (this starts the server and the client together):

   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser. You should see the Settle logo
   and a card saying **Server status: ok**.

To stop the app, press Ctrl+C in the terminal.

## Useful commands

| Command                 | What it does                                     |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Starts the server (port 4000) and client (5173)  |
| `npm run dev -w server` | Starts only the server                           |
| `npm run dev -w client` | Starts only the client                           |
| `npm run lint`          | Checks the code for likely mistakes (ESLint)     |
| `npm run format`        | Rewrites all files into one consistent style     |
| `npm run format:check`  | Reports files that need formatting, changes none |

## Environment variables

Copy `.env.example` to `.env`. Never commit `.env`; it will hold secrets.

| Name       | Example     | Meaning                    |
| ---------- | ----------- | -------------------------- |
| `NODE_ENV` | development | `production` when deployed |
| `PORT`     | 4000        | Port the server listens on |

More variables (database, secrets, photo storage) are added in later milestones.

## Project structure

```
settle/
  client/    React app (Vite, Tailwind CSS)
  server/    Express API
  docs/      Planning documents (PRD, TRD, schema, and so on)
```

## How the two programs connect

In development the browser talks only to the client on port 5173. Vite quietly
forwards any request starting with `/api` to the server on port 4000. The browser
therefore sees a single origin, which keeps cookies and security simple.


## Database (M1)

Requires PostgreSQL 16 or newer with two empty databases: `settle` and `settle_test`.

### Environment files (never committed)

- `.env` in the project root, copied from `.env.example`, with `DATABASE_URL` pointing at `settle`.
- `.env.test` in the project root, with one line: `DATABASE_URL` pointing at `settle_test`.

### Commands (run from the project root)

| Command | What it does |
| --- | --- |
| `npm run migrate -w server` | Applies any new SQL files from `server/src/db/migrations` |
| `npm run seed -w server` | Fills `settle` with 40 fake people (development only; refuses to run in production) |
| `npm test -w server` | Migrates `settle_test` and runs the tests |

Fake users log in with their email (for example `rhea.sengupta@seed.settle.test`) and the password `DevPassword123`.

Never edit a migration that has been applied; add a new numbered file instead.