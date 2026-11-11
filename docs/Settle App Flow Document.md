# Settle: App Flow Document

Version 1.0 · 10 Nov 2026 · Describes every screen, route, guard, user flow, state and edge case of the MVP. Companion to the PRD, TRD, UI/UX Brief, Backend Schema and Implementation Plan.

## 1. Route map

| Path                            | Screen                                                              | Access                                                  |
| ------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------- |
| /welcome                        | Welcome and sign up                                                 | Public. If logged in, redirect by the guard rules below |
| /login                          | Log in                                                              | Public                                                  |
| /onboarding/1 to /onboarding/5  | Profile setup steps                                                 | Logged in, profile not complete                         |
| /discover                       | Discover deck                                                       | Logged in, profile complete                             |
| /discover/:userId               | Profile detail and compatibility breakdown                          | Logged in, profile complete                             |
| /matches                        | New matches and all matches                                         | Logged in, profile complete                             |
| /messages                       | Conversation list (matches with at least one message, newest first) | Logged in, profile complete                             |
| /messages/:matchId              | Chat                                                                | Logged in, member of the match                          |
| /profile                        | Own profile and settings                                            | Logged in                                               |
| /profile/edit                   | Edit profile (reuses onboarding step components)                    | Logged in, profile complete                             |
| /profile/safety                 | Blocked users, hide profile, delete account                         | Logged in                                               |
| /legal/terms and /legal/privacy | Placeholder legal pages                                             | Public                                                  |
| anything else                   | Not found screen                                                    | Public                                                  |

Bottom navigation (Discover, Matches, Messages, Profile) appears only on /discover, /matches, /messages, /profile and their list screens. It is hidden on onboarding, profile detail and chat.

## 2. App start and route guards

On every full page load the client asks GET /api/auth/me. If that returns 401 it calls POST /api/auth/refresh once and retries. Then:

| State                         | Visiting                                                                      | Result                                   |
| ----------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------- |
| Not logged in                 | any protected path                                                            | redirect to /welcome                     |
| Logged in, profile incomplete | any path except /onboarding/\* and /legal/\*                                  | redirect to /onboarding/{onboardingStep} |
| Logged in, profile incomplete | /onboarding/n where n is greater than the saved step                          | redirect to the saved step               |
| Logged in, profile complete   | /welcome, /login, /onboarding/\*                                              | redirect to /discover                    |
| Logged in                     | /messages/:matchId where the user is not in the match, or the match is closed | Not found screen                         |

While /api/auth/me is loading, show a full-screen loading state, not a flash of the login page.

## 3. Core flows

### Flow 1: Sign up

1. User opens /welcome, enters email and password (8 to 72 characters), ticks 'I am 18 or older', taps Create Account.
2. Client validates; server validates again.
3. Success: server creates the user and an empty profile, sets cookies; client goes to /onboarding/1.
4. Errors: email already used (show 'An account with this email already exists. Log in?'); weak or long password (inline message); rate limited (toast 'Too many attempts, try again in a few minutes').

### Flow 2: Log in

1. User opens /login, enters email and password.
2. Success: cookies set; guard sends the user to /discover or the saved onboarding step.
3. Failure: 'Incorrect email or password' (the same message for both cases).

### Flow 3: Onboarding

Each step has a progress bar, Back arrow, Save & Exit, and a primary button. Next validates the step, saves it with PATCH /api/profile/me/step/:n, then moves on. Save & Exit saves valid data and goes to /welcome with the session kept; the next visit resumes at the first incomplete step.

| Step | Title                      | Fields                                                            |
| ---- | -------------------------- | ----------------------------------------------------------------- |
| 1    | About you                  | full name, gender, who I want to live with, city                  |
| 2    | Where and how much         | budget range, localities (1 to 10), move-in date                  |
| 3    | Your daily rhythm          | bedtime, wake time, cleanliness 1 to 5, guest frequency           |
| 4    | Your habits and boundaries | I smoke, I have pets, okay with smokers, okay with pets           |
| 5    | Introduce yourself         | photo, date of birth, occupation, workplace (optional), bio, tags |

Step 5 Finish: the photo upload (POST /api/profile/me/photo) completes first; then the final PATCH marks the profile complete; the client goes to /discover.

Errors: under 18 (inline 'You must be 18 or older to use Settle'); bio over 200 characters (counter turns red, Next disabled); unsupported photo type or over 5 MB (inline message, keep other fields).

### Flow 4: Browse and decide on Discover

1. /discover loads GET /api/discover (up to 10 cards, best score first) and shows a skeleton while loading.
2. The top card shows photo, display name and age, score ring and label, budget range, localities, up to 3 chips. Pass (X) and Like (heart) buttons sit below. Swipe left or right on touch devices does the same.
3. Tapping the card body opens /discover/:userId (Flow 5).
4. Pass or Like calls POST /api/swipes and immediately shows the next card (optimistic). If the request fails, bring the card back and show a toast.
5. When 2 cards remain, prefetch the next batch. When no cards remain, show the empty state: 'You have seen everyone for now. Check back soon or widen your localities and budget.' with a button to edit search criteria.

### Flow 5: Profile detail

1. Opens from a card. Loads GET /api/discover/:userId.
2. Shows photo, name, age, occupation, score ring, the 'Why you match' rows (budget, sleep, cleanliness, guests, smoking, pets, locality, move-in), bio, tags, localities.
3. Sticky bottom bar: Pass and Like. A three-dot menu offers Report and Block.
4. After Pass or Like the user returns to /discover with the next card.

### Flow 6: Mutual match

1. The user taps Like; the server stores the like and checks for the other person's like in one transaction.
2. If both liked: the server creates one match, returns matched=true and matchId. The client shows a full-screen match celebration with both photos, 'Say hi' (goes to /messages/:matchId) and 'Keep browsing'.
3. The other person, if online, receives a match:new event and a toast; otherwise the match appears in their Matches tab with a New badge.

### Flow 7: Chat

1. /messages/:matchId loads the match header (photo, full name, score, journey tracker) and the latest 30 messages.
2. The safety banner is pinned at the top until dismissed (remember dismissal in local storage per match).
3. The user types and taps send. The client adds the message at once with a sending state and emits message:send with a clientId. On acknowledgement it becomes sent; on failure it shows a Retry control.
4. The other person's messages arrive through message:new. While the chat is open, the client emits message:read and the sender sees a Seen mark.
5. Scrolling to the top loads older messages (GET with before).
6. Typing indicator appears while the other person types.
7. If the match closes (block), the screen shows 'This conversation is no longer available' and returns to /messages.

### Flow 8: Block

1. From the three-dot menu on profile detail or chat, user taps Block, confirms in a bottom sheet ('They will not be told. You will not see each other again.').
2. POST /api/blocks. The match (if any) closes for both people; both disappear from each other's feeds.
3. The client goes back to the previous list with a toast 'User blocked'.

### Flow 9: Report

1. From the same menu, user taps Report and chooses a reason (required) and optional details (max 500 characters).
2. POST /api/reports. Toast: 'Thanks. We will review this.' The reported person is not told. The sheet then offers 'Also block this person' (not pre-selected).

### Flow 10: Edit profile, hide profile, delete account

- Profile tab shows the user's own card preview and an Edit button opening /profile/edit, which uses the same field groups as onboarding. Save applies at once.
- /profile/safety has a Hide my profile toggle, the Blocked users list with Unblock, Log out, and Delete account.
- Delete account asks for the password and shows what will be removed. On success the client clears state and goes to /welcome.

### Flow 11: Session expiry

Any API call that returns 401 triggers one refresh and a retry. If refresh fails, clear client state and go to /login with the message 'Please log in again'. Socket.IO reconnects after a successful refresh.

## 4. State machines

| Entity  | States and transitions                                                                                                                                                                    |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account | registered (onboarding step 1 to 5) to active; active to hidden (toggle) and back; active or hidden to deleted (permanent); active to suspended (set manually in the database in the MVP) |
| Swipe   | none to like or pass. Immutable                                                                                                                                                           |
| Match   | created active; active to closed on block. Closed is final                                                                                                                                |
| Message | sending (client only) to sent to read                                                                                                                                                     |

## 5. Edge cases the build must handle

| Case                                              | Required behaviour                                                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Both people like each other at the same moment    | Exactly one match is created (database lock, see Backend Schema section 5)                              |
| User likes someone who then deletes their account | Swipe row is removed by cascade; nothing breaks                                                         |
| User is blocked while chat is open                | Next send fails with match closed; client shows the unavailable screen                                  |
| Same user logs in on two devices                  | Both work; socket events go to both through the user room                                               |
| Send message while offline                        | Message stays in sending state; Retry on reconnect; clientId prevents duplicates                        |
| User edits dealbreakers after matching            | Existing matches stay; the new rules apply to future Discover results                                   |
| User changes city                                 | Old localities are cleared; step 2 must be completed again before Discover works                        |
| Empty states                                      | No matches, no messages, no candidates, no blocked users: each has a friendly message and a next action |
| Slow or failed network                            | Skeleton loaders; toast on failure; no blank screens                                                    |
| Double tap on Like                                | Second request is ignored (409 from the server is treated as success on the client)                     |
| Browser back during onboarding                    | Allowed; data already saved is shown again                                                              |

## 6. Screen to API map

| Screen            | Calls                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Welcome, Login    | POST /api/auth/register, POST /api/auth/login                                            |
| App shell         | GET /api/auth/me, POST /api/auth/refresh                                                 |
| Onboarding 1 to 5 | PATCH /api/profile/me/step/:n, GET /api/localities, POST /api/profile/me/photo           |
| Discover          | GET /api/discover, POST /api/swipes                                                      |
| Profile detail    | GET /api/discover/:userId, POST /api/swipes, POST /api/blocks, POST /api/reports         |
| Matches           | GET /api/matches                                                                         |
| Messages list     | GET /api/matches                                                                         |
| Chat              | GET /api/matches/:matchId, GET and POST messages, POST read, Socket.IO events            |
| Profile and edit  | GET and PATCH /api/profile/me, POST photo                                                |
| Safety settings   | PATCH visibility, GET and DELETE /api/blocks, DELETE /api/account, POST /api/auth/logout |

## 7. After the MVP (reference only; do not build now)

- ID verification flow: upload ID, selfie, review, status Unverified, Pending, Verified. Needs the founder's policy decision and a legal review first.
- Ready to decide: both people confirm separately that they chatted, verified IDs, met in person, agreed rent split and house rules. Either can choose 'Not a comfortable fit'.
- Flat listings, rent split and agreements are separate later products.
