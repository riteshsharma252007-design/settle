# Settle: Implementation Plan

Version 1.0 · 10 Nov 2026 · How to build the MVP in ten small milestones with an AI coding tool. Read together with the PRD, TRD, Backend Schema, App Flow and UI/UX Specification (and attach the 13 Stitch screenshots).

## 1. How to use these documents with AI tools

| Tool                                                   | How to use it                                                                                                                                                                                                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cursor, Claude Code, Windsurf or similar editor agents | Best fit. Put the six documents in a docs folder in the repository, put the rules in section 2 into the tool's rules file (for example .cursorrules, CLAUDE.md or AGENTS.md), then give one milestone at a time                                               |
| ChatGPT or Claude in a chat window                     | Paste the rules, the relevant documents and one milestone per conversation; copy the files it writes into your project; run the tests                                                                                                                         |
| Lovable, Bolt, Replit                                  | These tools usually generate their own stack and hosted backend, which differs from the Express and PostgreSQL stack here. Use them to prototype screens quickly, then rebuild with this plan, or adapt the TRD and Backend Schema to the stack the tool uses |

Prompt template for each milestone: 'Read docs/ (PRD, TRD, Backend Schema, App Flow, UI/UX Specification). Implement milestone Mx from docs/Implementation Plan only. Follow the acceptance criteria and write the listed tests. Do not start the next milestone. When finished, run the tests and give me a summary: files changed, how to run it, and anything you assumed.'

Because the aim is to learn: after each milestone ask the agent to explain every new file in plain language, read the tests, and commit before moving on.

## 2. Rules for the AI agent (paste into the tool's rules file)

1. Read the documents in this order before writing code: PRD, TRD, Backend Schema, App Flow, UI/UX Specification.
2. If documents conflict: for data and logic the Backend Schema wins, then the TRD, then the PRD; for appearance the UI/UX Specification wins.
3. Build only the current milestone. Never build anything listed as a non-goal in the PRD or marked Later in the UI/UX Specification.
4. Follow the Replace rows in the UI/UX Specification: never ship invented statistics, guarantees, verification badges or legal claims.
5. Use only the libraries listed in the TRD. Ask before adding any other.
6. Change the database only with a new numbered migration. Never edit an applied migration.
7. Use parameterised SQL only. Validate every input with zod. Never log passwords, tokens, emails or message text.
8. Never store government IDs. Fake data belongs only in the development seed script.
9. Keep routes thin, logic in services, SQL in db/queries, constants in lib/constants.js.
10. Write the tests named in the milestone, run them, and fix failures before declaring the milestone done.
11. Add short comments that explain why, not what, so a learner can follow the code.
12. Ask the founder only when a decision is truly missing from the documents; otherwise choose the documented default and say so.

## 3. Prerequisites

Install: Node.js current LTS, Git, PostgreSQL 16 or newer (and a viewer such as pgAdmin or DBeaver), VS Code or the chosen AI editor, and an HTTP client such as Postman. Create a GitHub repository and a free Cloudinary account (for photos). Create two local databases: settle and settle\_test.

## 4. Milestones

Each milestone ends with working software, passing tests and a Git commit. Rough effort assumes one person working part-time with an AI tool.

| #   | Milestone                    | Effort      |
| --- | ---------------------------- | ----------- |
| M0  | Project setup                | 1 day       |
| M1  | Database and migrations      | 1 to 2 days |
| M2  | Authentication               | 3 to 5 days |
| M3  | Onboarding and profile       | 5 to 7 days |
| M4  | Matching engine              | 4 to 6 days |
| M5  | Discover, swipes and matches | 5 to 7 days |
| M6  | Real-time chat               | 5 to 7 days |
| M7  | Safety and account           | 3 to 4 days |
| M8  | Hardening and polish         | 4 to 6 days |
| M9  | Deploy and pilot             | 2 to 3 days |

Total: roughly 6 to 10 weeks part-time. This is an estimate, not a promise; authentication and chat usually take longer than expected.

### M0: Project setup

- Create the npm workspace (client and server) as in the TRD repository structure; Vite React app; Express server with GET /api/health; Vite proxy for /api and /socket.io; ESLint and Prettier; .nvmrc; .env.example; README with run steps.
- Install Tailwind CSS v4 and define the colour tokens from the UI/UX Specification section 2; add the Inter font; show the Settle wordmark on a placeholder page.
- Acceptance: one command starts client and server; /api/health returns ok; lint passes.

### M1: Database and migrations

- pg connection pool; migration runner and schema\_migrations table; migration 001 from the Backend Schema; localities seed migration; development seed script (about 40 profiles, edge cases listed in the Backend Schema); test database setup.
- Acceptance: a fresh database migrates cleanly; seed fills it; tests confirm that bad data is rejected (budget max below min, cleanliness 7, a complete profile missing a photo).

### M2: Authentication

- Endpoints register, login, refresh, logout, me; cookies, token rotation and reuse detection, csrfGuard, rate limits (TRD section 6).
- Client: AuthContext, route guards (App Flow section 2), Welcome and Login screens (UI Specification screen 2, with its Replace rows, the 18+ checkbox, and the Google button hidden).
- Tests: duplicate email gives 409; wrong password and unknown email give the same message; refresh rotates; a reused refresh token revokes all sessions; protected routes return 401 without a cookie.
- Acceptance: App Flow flows 1, 2 and 11 work in the browser.

### M3: Onboarding and profile

- Endpoints PATCH /api/profile/me/step/:n (1 to 5), GET and PATCH /api/profile/me, GET /api/localities, POST /api/profile/me/photo (Cloudinary), visibility toggle.
- Client: five onboarding screens from the UI Specification (step 1 is specified in section 5 of that document), resume at the first incomplete step, Save & Exit, Preview Card, edit profile screen.
- Tests: each step rejects invalid input with field messages; under-18 date of birth rejected; profile\_completed\_at is set only after step 5 with all required fields; unsupported or oversized photos rejected.
- Acceptance: a new user can register, finish all five steps and land on Discover (empty for now).

### M4: Matching engine

- Pure scoring and filter functions exactly as in TRD section 8, with constants in one file; the Discover service (SQL candidates, score, sort, limit); GET /api/discover and GET /api/discover/:userId (card fields, chips, breakdown rows, privacy rules).
- Tests: all unit tests in TRD section 8.8, including midnight wrap and symmetry; an API test that private fields (ok\_with\_smokers, ok\_with\_pets, flatmate\_gender\_pref, date\_of\_birth, workplace before a match) never appear in another user's response; seeded edge cases behave as expected.
- Acceptance: for a seeded user the endpoint returns sensible people, best score first, none that break any dealbreaker.

### M5: Discover, swipes and matches

- POST /api/swipes with the locking transaction from the Backend Schema; GET /api/matches; match:new socket event can wait for M6.
- Client: Discover screen (screen 7), profile detail (screen 8), match overlay, Matches screen (screen 9), bottom navigation with badges.
- Tests: a like creates no match when the other has not liked; a mutual like creates exactly one match; two simultaneous mutual likes create exactly one match; a repeated swipe is harmless; a swiped person never reappears.
- Acceptance: App Flow flows 4, 5 and 6.

### M6: Real-time chat

- Socket.IO server with cookie authentication, rooms per user, events from TRD section 9; REST history, send fallback and read endpoints; unread counts.
- Client: Messages list, Chat screen (screen 10) with safety card, journey tracker (Verify ID shows 'Coming soon'), quick replies, typing indicator, optimistic send, retry, older-message loading; Say hi from the icebreaker.
- Tests: only the two members can read or send; a closed match returns 404; duplicate clientId does not duplicate a message; read marking updates the unread count.
- Acceptance: two browsers (two accounts) chat in real time; messages persist after reload.

### M7: Safety and account

- Block, unblock, report, hide profile, delete account (with password and Cloudinary photo delete); Profile and settings screens; block and report sheets; static Terms, Privacy and Safety Checklist pages with placeholder text.
- Tests: blocking closes the match and removes both people from each other's Discover; a report is stored; deleting an account removes all its rows; hiding removes a user from others' Discover.
- Acceptance: App Flow flows 8, 9 and 10.

### M8: Hardening and polish

- Go through the TRD security checklist; add loading, empty, error and offline states everywhere; accessibility pass from the UI Specification section 8; remove every item the UI Specification marks Replace or Later that still leaked into the screens; run npm audit; test Discover speed with 10,000 seeded profiles (seed script option) against the TRD target.
- Acceptance: no console errors; all screens usable at 390px and in a desktop centred column; all automated tests pass.

### M9: Deploy and pilot

- Single Node service serving the API and the built client; managed PostgreSQL with backups; environment variables; migrations on deploy; HTTPS; health check; error alerts. Check current host free-tier limits and WebSocket support first.
- Smoke test on the live site with two real accounts. Invite about 20 people from one college or area before opening wider.
- Acceptance: the manual test script below passes on the live site.

## 5. Definition of done (every milestone)

Code merged and committed; tests for the milestone written and passing; no TODO that affects acceptance; no new library outside the TRD; no secrets in Git; README updated with any new command or environment variable; the founder can run it from a clean checkout using the README.

## 6. Manual test script (run before any pilot)

1. Register two accounts in two browsers; finish onboarding with compatible answers.
2. Each sees the other on Discover; both like; the match overlay appears for the second liker; the first sees the match in Matches.
3. Chat both ways in real time; reload and confirm history; confirm unread badges clear when the chat is opened.
4. Make a third account that smokes while the first does not accept smokers; confirm they never see each other.
5. Block from the chat; confirm the chat disappears for both and neither appears in the other's Discover.
6. Submit a report; confirm a row appears in the database.
7. Hide a profile; confirm it disappears from others' Discover.
8. Delete an account; confirm its rows and photo are gone.
9. Log in on two devices; log out on one; the other keeps working until its session ends.
10. Try the app at 390px width and on a desktop browser.

## 7. Before real users sign up (launch checklist)

- A lawyer reviews the Terms of Service and Privacy Policy and the way data is stored and deleted.
- Every Replace item in the UI/UX Specification is done; no invented numbers, guarantees or verification claims remain.
- Decide how non-binary users are handled by gender-preference filters (PRD assumption A6).
- Backups are on; error alerts reach the founder; there is a way to review reports daily.
- Decide the verification policy (mandatory or optional, free or paid) before building Release 2.

## 8. Backlog after the MVP (in suggested order)

1. Email verification, password reset and email notifications for new matches and messages.
2. A simple admin view to review and act on reports.
3. ID verification through a third-party provider (policy decision and legal review first; store only the provider's result).
4. Ready to decide checklist for matched pairs.
5. Google sign-in, photo carousel, push notifications.
6. Revenue features: paid verification badge, success fee, partner services, then flat listings and broker subscriptions (see the unit-economics discussion).
