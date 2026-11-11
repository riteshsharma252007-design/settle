# Settle: Technical Requirements Document (TRD)

Version 1.0 · 10 Nov 2026 · Companion documents: PRD, App Flow, UI/UX Brief, Backend Schema, Implementation Plan

## 1. Architecture

```
Browser (React single-page app, mobile-first)
   |  HTTPS: REST (JSON) and WebSocket (Socket.IO)
   v
One Node.js + Express service
   |-- serves the built React files in production
   |-- /api/* REST routes
   |-- Socket.IO server (chat)
   |-- pg connection pool
   v
PostgreSQL                 Cloudinary (profile photos)
```

Rules: one origin in production (no CORS, simple cookies). In development the Vite dev server (port 5173) proxies /api and /socket.io to Express (port 4000).

## 2. Stack (use exactly this; ask before adding any library)

| Layer               | Choice                                    | Notes                                                           |
| ------------------- | ----------------------------------------- | --------------------------------------------------------------- |
| Runtime             | Node.js, current LTS                      | Pin in .nvmrc and package.json engines                          |
| Language            | JavaScript, ES modules (type: module)     | TypeScript is a later option; describe shared shapes with JSDoc |
| Frontend            | React (latest stable) + Vite              | Single-page app                                                 |
| Routing             | React Router (createBrowserRouter)        |                                                                 |
| Styling             | Tailwind CSS v4                           | Tokens defined in CSS with @theme (see UI/UX Brief)             |
| Server state        | TanStack Query                            | Fetching, caching, retries                                      |
| Icons               | lucide-react                              |                                                                 |
| Backend             | Express                                   | Thin routes, logic in services                                  |
| Database access     | pg (node-postgres) with plain SQL         | No ORM in the MVP                                               |
| Validation          | zod                                       | Every request body, query and param                             |
| Password hashing    | bcryptjs, cost 12                         |                                                                 |
| Tokens              | jsonwebtoken (HS256)                      | Access token only; refresh tokens are random strings            |
| Security middleware | helmet, express-rate-limit, cookie-parser |                                                                 |
| Realtime            | socket.io and socket.io-client            |                                                                 |
| Uploads             | multer (memory) and cloudinary SDK        |                                                                 |
| Logging             | pino                                      | JSON logs                                                       |
| Tests               | Vitest (unit), Supertest (API)            |                                                                 |
| Quality             | ESLint and Prettier                       |                                                                 |
| Package manager     | npm workspaces                            | client and server packages                                      |

Pin exact versions in package.json. Do not introduce an ORM, Redux, a CSS-in-JS library or a UI kit.

## 3. Repository structure

```
settle/
  package.json              (workspaces: client, server)
  .nvmrc  .env.example  .gitignore  README.md
  client/
    index.html  vite.config.js
    src/
      main.jsx  App.jsx  routes.jsx
      api/           (fetch wrapper, one file per resource)
      auth/          (AuthContext, route guards)
      pages/         (one file per screen)
      components/    (shared UI pieces)
      hooks/  lib/  styles/theme.css
  server/
    src/
      index.js  app.js  socket.js  config.js
      routes/        (auth, profile, localities, discover, swipes, matches, messages, blocks, reports, account)
      services/      (authService, profileService, matching/, matchService, chatService, safetyService)
      db/            (pool.js, migrations/*.sql, queries/*.js, seed/)
      middleware/    (requireAuth, validate, errorHandler, rateLimits, csrfGuard)
      lib/           (tokens.js, time.js, cloudinary.js, constants.js)
    tests/           (unit/ and api/)
```

## 4. Environment variables

| Name                                                                   | Example                                    | Notes                           |
| ---------------------------------------------------------------------- | ------------------------------------------ | ------------------------------- |
| NODE\_ENV                                                              | development                                | production on the host          |
| PORT                                                                   | 4000                                       |                                 |
| DATABASE\_URL                                                          | postgres://user:pass@localhost:5432/settle | Separate settle\_test for tests |
| JWT\_ACCESS\_SECRET                                                    | 64+ random characters                      | Never committed                 |
| COOKIE\_SECURE                                                         | false in dev, true in production           |                                 |
| CLOUDINARY\_CLOUD\_NAME, CLOUDINARY\_API\_KEY, CLOUDINARY\_API\_SECRET | from the Cloudinary dashboard              |                                 |
| LOG\_LEVEL                                                             | info                                       |                                 |

Commit .env.example with names and fake values. Never commit .env.

## 5. API conventions

- Base path /api. JSON only. Database columns are snake\_case; API fields are camelCase.
- Success: `{ data: ... }`. Error: `{ error: { code, message, fields? } }`. Codes: VALIDATION\_ERROR (400), UNAUTHENTICATED (401), FORBIDDEN (403), NOT\_FOUND (404), CONFLICT (409), RATE\_LIMITED (429), INTERNAL (500).
- IDs are UUID strings (messages use numeric ids). Dates are ISO 8601; date of birth and move-in date are YYYY-MM-DD; times of day are 24-hour HH:MM strings converted to minutes after midnight on the server.
- Validate everything with zod; strip unknown fields.
- Return 404, not 403, for things the user should not know exist.

### Endpoints

| Method and path                                   | Auth   | Purpose                                                                                 |
| ------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| POST /api/auth/register                           | no     | email, password, confirmAge=true. Creates user and empty profile, sets cookies. 201     |
| POST /api/auth/login                              | no     | email, password. Sets cookies                                                           |
| POST /api/auth/refresh                            | cookie | Rotates refresh token, issues new access token                                          |
| POST /api/auth/logout                             | yes    | Revokes refresh token, clears cookies                                                   |
| GET /api/auth/me                                  | yes    | User, onboardingStep, profileComplete                                                   |
| GET /api/profile/me                               | yes    | Own full profile                                                                        |
| PATCH /api/profile/me/step/:n                     | yes    | n is 1 to 5. Validates that step, saves, returns nextStep. Step 5 completes the profile |
| PATCH /api/profile/me                             | yes    | Partial edit after onboarding                                                           |
| POST /api/profile/me/photo                        | yes    | multipart field photo; returns photoUrl                                                 |
| PATCH /api/profile/me/visibility                  | yes    | isDiscoverable true or false                                                            |
| GET /api/localities?city=&q=                      | yes    | Locality list for pickers                                                               |
| GET /api/discover                                 | yes    | Up to 10 candidate cards, best score first                                              |
| GET /api/discover/:userId                         | yes    | Profile detail with compatibility breakdown                                             |
| POST /api/swipes                                  | yes    | targetId, action (like or pass). Returns matched and matchId                            |
| GET /api/matches                                  | yes    | Matches with lastMessage, unreadCount, score                                            |
| GET /api/matches/:matchId                         | yes    | One match with the other person's profile                                               |
| GET /api/matches/:matchId/messages?before=&limit= | yes    | History, newest first, limit default 30                                                 |
| POST /api/matches/:matchId/messages               | yes    | body, clientId (REST fallback for socket send)                                          |
| POST /api/matches/:matchId/read                   | yes    | Marks the other person's messages as read                                               |
| GET /api/blocks                                   | yes    | Blocked users                                                                           |
| POST /api/blocks                                  | yes    | userId. Blocks and closes any match                                                     |
| DELETE /api/blocks/:userId                        | yes    | Unblock (does not reopen a closed match)                                                |
| POST /api/reports                                 | yes    | reportedUserId, matchId (optional), reason, details (optional)                          |
| DELETE /api/account                               | yes    | password. Deletes everything                                                            |
| GET /api/health                                   | no     | Returns ok                                                                              |

## 6. Authentication and sessions

- Access token: JWT (HS256), 15 minutes, payload sub (user id) and role. Cookie access\_token: httpOnly, Secure in production, SameSite=Lax, path /.
- Refresh token: 32 random bytes, base64url. Cookie refresh\_token: httpOnly, Secure in production, SameSite=Strict, path /api/auth, 30 days. Only its SHA-256 hash is stored (table refresh\_tokens).
- Rotation: every refresh issues a new token and revokes the old one. If a revoked token is presented again, revoke all of that user's tokens.
- Client: on a 401 call /api/auth/refresh once, then retry the original request. If it fails, log out and go to /login.
- CSRF: SameSite cookies plus a required header X-Requested-With: fetch on every POST, PATCH and DELETE, checked in csrfGuard.
- Passwords: 8 to 72 characters; hashed with bcryptjs cost 12; never logged or returned.
- Rate limits: auth routes 10 per 15 minutes per IP; swipes 60 per minute per user; messages 30 per minute per user; everything else 300 per 15 minutes per user.
- Socket.IO authentication: read the access\_token cookie in the handshake and verify it. Reject if invalid or expired; the client refreshes and reconnects.

## 7. Authorization rules

- Every route except register, login, refresh and health requires a valid access token.
- A user reads and writes only their own profile.
- A user may open /api/discover/:userId only if that person passes all hard filters with the viewer, or a match exists, and neither has blocked the other. Otherwise 404.
- Messages: only the two users of an active match may read or send.
- Closed matches (after a block) return 404 for chat routes.

## 8. Matching engine specification

Implement as pure functions in server/src/services/matching/ with no database calls inside the scoring code, so they are easy to unit test.

### 8.1 Profile shape used by the engine

`{ userId, gender, flatmateGenderPref, city, budgetMin, budgetMax, moveInDate, bedtimeMinutes, wakeMinutes, cleanliness, guestFrequency, smokes, okWithSmokers, hasPets, okWithPets, localityIds }`

### 8.2 Constants (in lib/constants.js; never hard-code elsewhere)

MIN\_SCORE = 50, DISCOVER\_BATCH = 10, CANDIDATE\_CAP = 200, weights below.

### 8.3 Hard filters (a candidate must pass all; applied in SQL, see Backend Schema section 5)

| #   | Rule                                                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- |
| H1  | Candidate is not the viewer                                                                                                        |
| H2  | Candidate profile is complete, is\_discoverable is true, and the user status is active                                             |
| H3  | Same city                                                                                                                          |
| H4  | No block in either direction                                                                                                       |
| H5  | The viewer has not already swiped on the candidate                                                                                 |
| H6  | Gender preference satisfied in both directions: Anyone accepts all; Women only requires gender woman; Men only requires gender man |
| H7  | Smoking: if the viewer smokes the candidate must be okay with smokers, and the reverse                                             |
| H8  | Pets: if the viewer has pets the candidate must be okay with pets, and the reverse                                                 |
| H9  | Budget ranges overlap: viewer.min <= candidate.max and candidate.min <= viewer.max                                                 |
| H10 | At least one shared locality                                                                                                       |

### 8.4 Score (0 to 100, symmetric)

score = round( 20 x budget + 20 x locality + 20 x sleep + 20 x cleanliness + 10 x guests + 10 x movein ), where each similarity is between 0 and 1.

| Criterion   | Weight | Similarity formula                                                                                           |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| Budget      | 20     | overlap / union, where overlap = min(maxA,maxB) - max(minA,minB) and union = max(maxA,maxB) - min(minA,minB) |
| Locality    | 20     | shared count / min(count A, count B)                                                                         |
| Sleep       | 20     | average of bedtime similarity and wake similarity, each = max(0, 1 - circularDiff / 240)                     |
| Cleanliness | 20     | 1 - abs(levelA - levelB) / 4                                                                                 |
| Guests      | 10     | rarely=0, sometimes=1, often=2; 1 - abs(diff) / 2                                                            |
| Move-in     | 10     | max(0, 1 - gapDays / 60)                                                                                     |

circularDiff(a, b) = min(abs(a - b), 1440 - abs(a - b)) in minutes. This handles midnight: 23:00 (1380) and 02:00 (120) differ by 180 minutes, not 1260.

### 8.5 Labels, statuses and card chips

- Overall label: 85 and above High fit; 70 to 84 Good fit; 50 to 69 Fair fit.
- Breakdown row status by similarity: 0.8 or more good (green); 0.5 up to 0.8 slightly different (amber); below 0.5 mismatch (red). Smoking and pet rows are always good (they passed the hard filters) with the text 'Dealbreaker cleared'.
- Sleep row shows the larger of the two time differences rounded to the nearest 0.5 hour, for example 'about 1.5h apart'.
- Card chips (at most 3, in this order): smoking ('Non-smoker' or 'Smoker'); pets ('Has pets', else 'Pet friendly' if okay with pets, else 'No pets'); sleep ('Night owl' if bedtime is between 00:00 and 06:00, 'Early bird' if wake time is 06:30 or earlier).

### 8.6 Worked examples (use as unit tests)

- Budget A 14000 to 22000, B 14000 to 18000: overlap 4000, union 8000, similarity 0.5.
- Bedtime 23:00 vs 02:00: circular difference 180, similarity 1 - 180/240 = 0.25.
- Cleanliness 4 vs 4: 1.0. Guests rarely vs often: 0.0. Move-in gap 30 days: 0.5.

### 8.7 Discover algorithm

1. Run the SQL candidate query (hard filters H1 to H10, limit CANDIDATE\_CAP).
2. Compute the score in JavaScript for each candidate.
3. Drop scores below MIN\_SCORE.
4. Sort by score descending, then profile updated time descending.
5. Return the first DISCOVER\_BATCH as cards.

### 8.8 Required unit tests

Every hard filter passes and fails correctly in both directions; midnight wrap in sleep similarity; budget overlap at exactly one shared rupee; symmetry (score(A,B) equals score(B,A)); labels at the boundaries 49, 50, 69, 70, 84, 85.

## 9. Real-time chat (Socket.IO)

- On connect, each socket joins the room user:{userId}. Emit events to that room so match lists and unread badges update too.
- Client to server: message:send (matchId, body, clientId) with an acknowledgement; message:read (matchId); typing (matchId, isTyping).
- Server to client: message:new (message); message:read (matchId, readerId, at); typing (matchId, userId, isTyping); match:new (match); match:closed (matchId).
- Always save the message in PostgreSQL first, then emit. clientId makes sends idempotent (duplicate sends return the stored message).
- Verify on every event that the user belongs to the match and the match is active.
- Single server instance in the MVP. A Redis adapter is needed before running several instances.

## 10. Photo upload

- multer memory storage, max 5 MB; allow jpeg, png, webp and check the file signature, not only the header.
- Upload to Cloudinary folder settle/profiles with a width limit of 1080px and automatic quality and format. Store photo\_url and photo\_public\_id.
- On replace or account deletion, delete the old image from Cloudinary.

## 11. Security requirements

- Parameterised SQL only; never build SQL from user input.
- helmet with a basic content security policy; HTTPS and HSTS in production.
- Validate all input; React escapes output; never use dangerouslySetInnerHTML.
- No personal data in logs (emails, tokens, message bodies).
- Authorization tests for every protected resource.
- Do not collect government IDs or Aadhaar in the MVP.
- Run npm audit before each release.

## 12. Performance targets

- Discover p95 under 500 ms with 10,000 profiles; message send to receive under 300 ms in the same region.
- Use the indexes in the Backend Schema; cap candidates at 200 per request.

## 13. Errors and logging

- One central error handler; every request gets a request id; log with pino as JSON.
- Map zod errors to VALIDATION\_ERROR with a message per field.
- Client: inline errors on forms, toast for network failures, a friendly error screen for unexpected failures.

## 14. Testing strategy

- Unit: the matching functions and time helpers (section 8.8).
- API integration (Supertest, separate settle\_test database): register and login flow, onboarding validation, swipe to match, simultaneous likes create one match, block closes the match, a user cannot read another match's messages.
- Seed script creates about 40 fake profiles with edge cases (see Backend Schema section 4).

## 15. Deployment

- One Node web service runs `npm run build` then `npm start`; Express serves client/dist with a fallback to index.html for non-API routes.
- Managed PostgreSQL with backups on. Run migrations on each deploy. The host must support WebSockets. Check current free-tier limits before choosing a host.
- Health check: GET /api/health.

## 16. Coding standards for AI agents

- Routes stay thin: validate, call a service, return. Business logic lives in services. SQL lives in db/queries.
- async/await only. Wrap async route handlers so errors reach the central handler.
- No magic numbers; use lib/constants.js.
- Add short comments that explain why, because the founder is learning from this code.
- Never edit an applied migration; add a new numbered file.
- Do not build anything listed as a non-goal in the PRD.

## 17. Accepted limitations in the MVP

Single server instance; no email delivery; no password reset; no push notifications; one photo; no moderation dashboard (reports are rows in the database); no automated face or ID checks.
