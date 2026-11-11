# Settle: Product Requirements Document (PRD)

Working name: Settle (placeholder) · Version 1.0 · 10 Nov 2026 · Status: ready for build · Audience: AI coding agents and the founder

## 1. Summary

Settle is a mobile-first web app that matches people who want to share a flat, based on how they actually live: budget, areas, sleep schedule, cleanliness, guests, smoking and pets. Matched people chat first and, in later releases, verify identity and meet before signing a roughly 11-month lease. The promise: find a flatmate you can actually live with. Safety, honesty and visible compatibility reasons come before growth tricks.

## 2. Problem

- A bad flatmate can ruin a year-long tenancy, and a lease is hard to exit.
- Existing platforms mostly list rooms. They do not help people judge lifestyle fit or trust the other person.
- Strangers need safety signals: honest profiles, hard dealbreakers, a safe way to meet, and a no-pressure way to say 'not a fit'.

## 3. Goals and non-goals

### MVP goals

| ID  | Goal                                     | Measure (pilot hypotheses, not promises)                                             |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| G1  | New users build a useful profile quickly | at least 60% of signups finish onboarding, median under 5 minutes                    |
| G2  | Never show incompatible people           | 0 profiles shown that break either person's dealbreakers (proved by automated tests) |
| G3  | Make compatibility understandable        | every profile shows a score and a per-criterion breakdown                            |
| G4  | Let matches talk safely                  | real-time chat only between mutual matches; block and report reachable in 2 taps     |
| G5  | Prove demand in one pilot area           | 500 signups; at least 25% of active users get a mutual match                         |

### Non-goals (do NOT build in the MVP)

Payments, escrow, deposits, rental agreements, eSign, stamp duty, ID or Aadhaar collection, background checks, flat or landlord listings, group matching (3 or more flatmates), social-graph 'mutual connections', super like, rewind, 24-hour match expiry, push notifications, native apps, Google sign-in, email verification, password reset, multiple languages, admin dashboard.

## 4. Users

| Persona                        | Description                                      | Needs                                                      |
| ------------------------------ | ------------------------------------------------ | ---------------------------------------------------------- |
| Riya, 24, working professional | New to a city for work, wants a gated 2BHK share | A safe person, similar routine and budget, near the office |
| Aman, 20, college student      | First time away from home, tight budget          | Affordable, sociable but not chaotic, no surprises         |
| Moderator (post-MVP)           | Reviews reports                                  | A simple report queue                                      |

Region: urban India. Currency: INR (₹). Language: English. Age: 18+ only.

## 5. Assumptions (do not ask the founder about these; implement them)

| #   | Assumption                                                                                                                                                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Working name is Settle. Keep it in one constant (client and server) so it is easy to rename.                                                                                                                                                 |
| A2  | The pilot city seeded in the database is Bengaluru (from the Stitch designs). City and localities are data, never hard-coded.                                                                                                                |
| A3  | Web app only. Designed at 390px width. On desktop show a centred column, max width 480px.                                                                                                                                                    |
| A4  | Email and password login only.                                                                                                                                                                                                               |
| A5  | No ID verification in the MVP. The verification field exists in the database, but nobody can become verified yet, so no badge is shown anywhere.                                                                                             |
| A6  | Flatmate gender preference has three values: Anyone, Women only, Men only. Known limitation: people who choose non-binary or prefer-not-to-say will not match with users who choose Women only or Men only. Founder to review before launch. |
| A7  | Before a match, show first name plus last initial (for example Rhea S.). After a mutual match, show the full name.                                                                                                                           |
| A8  | Before a match, show area-level localities only, never street addresses. The workplace name is optional and shown only after a match.                                                                                                        |
| A9  | One profile photo per user.                                                                                                                                                                                                                  |
| A10 | All score functions are symmetric, so both people always see the same score.                                                                                                                                                                 |
| A11 | Budget means monthly rent per person, in whole rupees.                                                                                                                                                                                       |
| A12 | Development uses fake test data only. Never store real government IDs.                                                                                                                                                                       |
| A13 | One deployment serves both the API and the web app (one origin).                                                                                                                                                                             |
| A14 | Terms and Privacy pages hold placeholder text until a lawyer reviews them.                                                                                                                                                                   |

## 6. Release scope

| Release                 | Contents                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1 (MVP, this document) | Auth, 5-step onboarding, matching engine, Discover, profile detail with breakdown, Matches, real-time chat, block, report, hide profile, delete account |
| R2                      | ID verification (after the policy decision), email verification, password reset, decision checklist, Google sign-in, photo carousel, notifications      |
| R3                      | Flat listings and verified-listing revenue, landlord side, rent-split tools, college or company partnerships                                            |

## 7. Functional requirements

Priority: P0 = must ship in the MVP. P1 = should ship in the MVP if time allows.

### Accounts

| ID    | Requirement                      | Acceptance criteria                                                                                                                                       | Pri |
| ----- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| FR-A1 | Register with email and password | Valid email, unique ignoring case; password 8 to 72 characters; user ticks 'I am 18 or older'; on success user is logged in and sent to onboarding step 1 | P0  |
| FR-A2 | Log in                           | A wrong email or wrong password gives the same generic message; rate limited                                                                              | P0  |
| FR-A3 | Stay logged in, log out          | Session survives a browser restart for up to 30 days; logout revokes the session on the server                                                            | P0  |
| FR-A4 | Legal links                      | Terms and Privacy links are visible on the sign-up screen                                                                                                 | P0  |

### Onboarding (5 steps)

| ID    | Requirement                     | Acceptance criteria                                                                                                                                                                           | Pri |
| ----- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| FR-P1 | Five-step onboarding            | Progress bar; Save & Exit on every step; returning users resume at the first incomplete step; each step saves on Next                                                                         | P0  |
| FR-P2 | Step 1: About you               | Full name, gender, who I want to live with (Anyone, Women only, Men only), city                                                                                                               | P0  |
| FR-P3 | Step 2: Search criteria         | Budget range slider ₹3,000 to ₹30,000+ in ₹500 steps with quick presets; 1 to 10 localities chosen from the list; move-in date (today or later, within 12 months)                             | P0  |
| FR-P4 | Step 3: Daily rhythm            | Bedtime and wake time (quick chips plus custom time); cleanliness level 1 to 5; guest frequency                                                                                               | P0  |
| FR-P5 | Step 4: Habits and dealbreakers | Toggles: I smoke, I have pets (public); Okay living with a smoker, Okay living with pets (private dealbreakers). The screen states plainly which are public and which are private             | P0  |
| FR-P6 | Step 5: Introduce yourself      | Photo (jpg, png or webp, max 5 MB), date of birth (18 or older), occupation, optional workplace, bio up to 200 characters, up to 6 tags. Finish marks the profile complete and opens Discover | P0  |
| FR-P7 | Edit profile later              | Every onboarding field is editable from the Profile tab; changes apply to matching immediately                                                                                                | P0  |

### Matching and Discover

| ID    | Requirement         | Acceptance criteria                                                                                                                                                                    | Pri |
| ----- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| FR-M1 | Hard filters        | A profile is shown only if it passes every hard filter in TRD section 8.3, in both directions                                                                                          | P0  |
| FR-M2 | Compatibility score | 0 to 100, symmetric, calculated as in TRD section 8.4. Labels: 85 and above High fit, 70 to 84 Good fit, 50 to 69 Fair fit. Below 50 is never shown                                    | P0  |
| FR-M3 | Discover deck       | One large card at a time from a batch of up to 10, best score first; an empty state appears when no profiles are left                                                                  | P0  |
| FR-M4 | Like and pass       | Two actions only; a decision cannot be undone in the MVP; a given person is shown to a user at most once                                                                               | P0  |
| FR-M5 | Mutual match        | When both people like each other, exactly one match is created, even if both like at the same moment. The second liker sees a match screen with Say hi and Keep browsing               | P0  |
| FR-M6 | Profile detail      | Tapping a card opens full detail with a row-by-row breakdown (budget, sleep, cleanliness, guests, smoking, pets, locality, move-in), each marked good, slightly different, or mismatch | P0  |
| FR-M7 | Dealbreaker privacy | Nobody is told they were filtered out; another person's private dealbreaker answers are never exposed                                                                                  | P0  |

### Matches and chat

| ID    | Requirement        | Acceptance criteria                                                                                                                                         | Pri |
| ----- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| FR-X1 | Matches screen     | New-matches row plus a list of all matches with name, score and key chips; button 'Say hi' (no messages yet) or 'Chat now'; empty state when there are none | P0  |
| FR-C1 | Real-time chat     | Text only, 1 to 2000 characters, only between matched users; delivered instantly when both are online and stored for later                                  | P0  |
| FR-C2 | History and unread | Latest 30 messages load first, older ones load on scroll up; unread counts on the Matches and Messages tabs; messages are marked read when the chat is open | P0  |
| FR-C3 | Safety banner      | Pinned card: meet in a public place first; never send money before meeting the person and seeing the flat. Dismissible per chat                             | P0  |
| FR-C4 | Quick replies      | Chips such as 'What's your move-in date?' and 'Can we meet this weekend?' put text into the input (never auto-send)                                         | P1  |
| FR-C5 | Journey tracker    | Shows Chat, Verify ID, Meet, Decide. Chat is active; the others show 'Coming soon'                                                                          | P1  |

### Safety, privacy and content

| ID    | Requirement          | Acceptance criteria                                                                                                                                                                    | Pri |
| ----- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| FR-S1 | Block                | From profile detail or the chat menu. The chat closes, neither person appears in the other's feed, and the blocked person is not notified                                              | P0  |
| FR-S2 | Report               | Reasons: fake profile, harassment, scam, inappropriate content, unsafe behaviour, other; optional details up to 500 characters; stored for review; the reported person is not notified | P0  |
| FR-S3 | Hide profile         | A toggle removes the user from other people's Discover without deleting matches                                                                                                        | P1  |
| FR-S4 | Delete account       | Requires the password; permanently deletes profile, matches, messages, swipes and photo; user is logged out                                                                            | P0  |
| FR-S5 | Honest privacy copy  | Every privacy statement in the UI must be true for the behaviour actually implemented                                                                                                  | P0  |
| FR-L1 | No fabricated claims | The UI contains no invented statistics (such as 'happy homes'), guarantees, or legal-validity claims                                                                                   | P0  |

## 8. Core business rules (summary; TRD section 8 is the full specification)

1. Hard filters remove people. They are never traded off against score: budget overlap, at least one shared locality, same city, smoking and pet dealbreakers both ways, gender preference both ways, no blocks, not already swiped.
2. The score ranks the people who remain: budget fit 20, locality fit 20, sleep fit 20, cleanliness fit 20, guest fit 10, move-in fit 10.
3. A match exists only after both people like each other.
4. Only matched users can message each other.
5. Blocking closes the match for both people and hides them from each other permanently.

## 9. Monetisation (design hooks only; build no payment code in the MVP)

- Likely first revenue: paid verification badge, a small success fee when two people confirm moving in together, partner commissions on move-in services (rental agreement, movers, internet), later broker or PG subscriptions and college or company deals.
- The MVP should log key events as structured server logs so these can be measured later: signup, onboarding\_completed, swipe, match\_created, message\_sent, report\_created.

## 10. Success metrics (pilot)

| Metric     | Definition                                                | Pilot target (hypothesis)  |
| ---------- | --------------------------------------------------------- | -------------------------- |
| Activation | Signups that complete onboarding                          | 60% or more                |
| Match rate | Active users with at least one mutual match within 7 days | 25% or more                |
| Chat start | Matches where both people send a message                  | 50% or more                |
| Retention  | Users active again after 7 days                           | 30% or more                |
| Safety     | Reports per 1,000 users, and time to review               | track, review every report |

## 11. Risks and mitigations

| Risk                                              | Mitigation                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Cold start: too few users to match                | Launch in one college or area; seed no fake users in production; invite-only waves                     |
| Safety incidents                                  | Block and report everywhere, safety banner, no personal contact details shared, ID verification in R2  |
| Privacy and legal (IDs, Aadhaar, data protection) | No IDs in the MVP; lawyer review before collecting any ID; data deletion works end to end              |
| Fake profiles                                     | Rate limits, report flow, verification in R2                                                           |
| Discrimination through filters                    | No diet or religion filters; gender preference limited to the three values above; review before launch |

## 12. Open questions for the founder (the agent implements the defaults above)

1. Verification policy: mandatory or optional, free or paid? Decide before R2.
2. How should non-binary users be handled by gender-preference filters (assumption A6)?
3. Final pilot city and final product name.
