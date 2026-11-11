# Settle: UI/UX Design Specification (from the Stitch screens)

Version 2.0 · 10 Nov 2026 · Source of truth: the 13 Stitch screenshots (attach all 13 when you give this document to an AI tool). This specification describes each screen as designed, says what to build in the MVP, and lists where the screenshots contain mistakes or claims that are not true yet.

Status words used below: **Build** = implement fully in the MVP. **Replace** = keep the layout, change the copy or data as stated. **Later** = keep the design, do not build yet, hide its entry points. **Defect** = a mistake in the screenshot; do not copy it.

## 1. Screenshot index

| Ref | Screen                                                  | Route              | MVP status                                           |
| --- | ------------------------------------------------------- | ------------------ | ---------------------------------------------------- |
| 1   | Hero illustration: two people on a coral sofa with chai | asset on /welcome  | Build (export as an image file)                      |
| 2   | Welcome and sign up                                     | /welcome           | Build, with Replace items                            |
| 3   | Onboarding step 2: Search criteria                      | /onboarding/2      | Build, with Replace items                            |
| 4   | Onboarding step 3: Daily rhythm                         | /onboarding/3      | Build                                                |
| 5   | Onboarding step 4: Habits and dealbreakers              | /onboarding/4      | Build, with Replace items                            |
| 6   | Onboarding step 5: Introduce yourself                   | /onboarding/5      | Build, with Replace items                            |
| 7   | Discover                                                | /discover          | Build, with Replace items                            |
| 8   | Flatmate profile                                        | /discover/:userId  | Build, with Replace items                            |
| 9   | Matches                                                 | /matches           | Build, with Replace items                            |
| 10  | Chat                                                    | /messages/:matchId | Build, with Replace items                            |
| 11  | ID verification                                         | later release      | Later                                                |
| 12  | Ready to decide                                         | later release      | Later                                                |
| 13  | Co-tenant agreement and eSign                           | later release      | Later; do not build without legal and finance review |

Screens that are required but missing from the screenshots (design them in the same style; specified in section 5): onboarding step 1, login, messages list, own profile and settings, match celebration, block and report sheets, empty and error states.

## 2. Visual language (as shown in the screenshots)

Colour tokens, estimated visually from the screenshots (replace with exact values if the Stitch export provides them, and keep the token names):

| Token       | Value                         | Use                                                                      |
| ----------- | ----------------------------- | ------------------------------------------------------------------------ |
| primary-700 | #0B6B5D                       | Deep teal: selected states, Chat Now, active navigation, progress, links |
| primary-100 | #DDF5EE                       | Mint: selected cards, info bars                                          |
| primary-50  | #EEFAF6                       | Lightest mint                                                            |
| accent-500  | #FF7A59                       | Coral: main call to action and Like                                      |
| accent-100  | #FFE3DA                       | Peach: icon squares                                                      |
| bg          | #F5F6FC                       | Page background                                                          |
| surface     | #FFFFFF                       | Cards                                                                    |
| field       | #ECEEF9                       | Lavender fill: inputs, chips, option cards                               |
| ink         | #12161F                       | Main text                                                                |
| ink-muted   | #5B6478                       | Secondary text                                                           |
| success     | #16A34A on #DCFCE7            | Verified, good match                                                     |
| warning     | #D97706 on #FEF3C7            | Slightly different                                                       |
| danger      | #DC2626 on #FEE2E2            | Mismatch, dealbreaker, delete                                            |
| font        | Inter, then system sans-serif | All text                                                                 |

Define these once as Tailwind CSS v4 theme variables (see the TRD). Contrast note: white text on the coral is about 2.7 to 1, so keep call-to-action labels bold at 17 to 18px, and consider a slightly deeper coral (#E8603E) in production to reach 3 to 1.

| Element           | Rule seen in the screenshots                                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page              | Lavender-white background, 16px side padding, 16 to 24px between cards                                                                                      |
| Cards             | White, 20px radius, soft shadow, 16px padding                                                                                                               |
| Headings          | Bold 26 to 28px, tight line height, near-black; sub-text 14 to 15px muted grey                                                                              |
| Section label     | Small caps 12px, wide letter spacing, teal, with a small line icon on the left (PREFERENCES, DAILY RHYTHM & HABITS, LIFESTYLE & COMPATIBILITY, FINAL TOUCH) |
| Primary button    | Full width, 52 to 56px tall, 16px radius, coral fill, white bold label with an arrow icon, soft coral shadow                                                |
| Secondary button  | Deep teal fill with white label (Chat Now); quiet button = lavender fill (Continue with Google)                                                             |
| Chips             | Pill shape, 13px text. Option = lavender fill. Selected = mint fill, teal text and a check. Removable = with x. Addable = with plus                         |
| Icon squares      | 40px, 12px radius, tinted fill (mint, green, peach, lavender) holding a 20px outline icon                                                                   |
| Info boxes        | 12px radius, light tint, small icon, 12 to 13px text; 'Why we ask:' boxes start with a bold lead-in                                                         |
| Icons             | Outline style, lucide-react                                                                                                                                 |
| Photos            | 24px radius; text over photos sits on a dark bottom gradient                                                                                                |
| Bottom navigation | 4 tabs (Discover, Matches, Messages, Profile), icon above label, active tab teal, coral count badges                                                        |
| Motion            | 150 to 250 ms; card swipe follows the finger; progress segments fill smoothly; honour reduced motion                                                        |

## 3. Shared components (build once, reuse everywhere)

| Component                     | Description                                                                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AppLogo                       | Dark-green rounded square with a white house outline and a small orange dot at its top right, then the word 'Settle'. Build as inline SVG plus text, never as a remote image |
| TopBar                        | Back arrow, centred title, kebab menu, 32px round avatar of the user (green dot when online)                                                                                 |
| StepHeader                    | Mint pill 'STEP n OF 5', step name beside it, 'Save & Exit' link on the right, below it a 5-segment bar with filled segments in deep teal                                    |
| SectionLabel                  | Teal small-caps label with a line icon                                                                                                                                       |
| WhyWeAsk                      | Tinted box with bulb or info icon and a bold 'Why we ask:' followed by one sentence                                                                                          |
| IconCardHeader                | 40px tinted icon square, bold title, muted subtitle                                                                                                                          |
| RangeSlider                   | Two thumbs on a teal track; 'Min' and 'Max' labels under the ends; the chosen range shown above in a mint 'target window' box                                                |
| PresetChip                    | Chip with emoji or icon; selecting it sets the slider                                                                                                                        |
| LocalityPicker                | Search field, selected chips with x and a count heading, popular chips with plus                                                                                             |
| RadioCard                     | Full-width card with icon, bold title, muted description, radio or check on the right; selected = mint fill and teal border                                                  |
| TimeTile                      | Tile with icon (moon or sun), label, big time, and four quick chips below; the last chip ends with a plus and opens a time picker                                            |
| LevelSelector                 | Five circular icons with labels; the selected one is filled deep teal; a segment bar below; a description box for the selected level                                         |
| ToggleRow                     | Icon square, bold title, small state tag, helper text, switch on the right                                                                                                   |
| VisibilityTag                 | Pill: 'Public' with globe icon, or 'Private' with lock icon                                                                                                                  |
| PhotoUploader                 | Round photo with ring, coral camera badge, buttons 'Upload New' and 'Use Camera'                                                                                             |
| CounterTextarea               | Text area with 'n / 200' counter at the bottom right                                                                                                                         |
| StickyCta                     | Bottom bar with the coral button and a small shield-icon note underneath                                                                                                     |
| ScoreRing                     | Circular progress ring with the number, and a label (High fit, Good fit, Fair fit)                                                                                           |
| BreakdownRow                  | Icon square, criterion name, status pill on the right (green, amber or red), two small value boxes (You and the other person), optional italic note                          |
| AvatarRing                    | Round photo with a teal ring, a score badge at the bottom, an optional green online dot, name and time under it                                                              |
| MessageBubble                 | Own = deep teal with white text, right; other = white, left, with small avatar; time and delivery ticks below                                                                |
| QuickReplyChip                | Pill chips above the message input that insert text                                                                                                                          |
| JourneyTracker                | 'Journey to Co-living' with 'STEP n OF 4', progress bar, four icons (Chat, Verify ID, Meet, Decide) each with a caption                                                      |
| SafetyCard                    | Mint card, shield icon, title, text, close button, link                                                                                                                      |
| Also needed in the same style | BottomSheet, Toast, Skeleton loaders, EmptyState                                                                                                                             |

## 4. Screen specifications

### Screen 2: Welcome and sign up (/welcome)

Top to bottom: AppLogo; headline 'Find a flatmate you can actually live with' (centred, bold, two lines); sub-text 'Lifestyle compatibility & trust-first flatmates across India's top cities.'; hero card with the sofa illustration (screenshot 1), 16px radius, with two translucent pills along the bottom (left: check icon and a claim; right: green pill listing cities); form card; the section label 'THE SETTLE SAFETY STANDARD' with three rows; footer.

Form card: button 'Continue with Google' (lavender, Google logo); divider 'OR CONTINUE WITH EMAIL'; field 'Email address' (mail icon, placeholder name@example.com); field 'Password' (lock icon, placeholder 'Create a strong password', eye toggle) with helper 'At least 8 characters'; coral button 'Create Account' with arrow; line 'Already have an account? Log in' (Log in teal and underlined).

Safety Standard rows (icon square, bold title, muted subtitle): Lifestyle-matched, 'Sleep, cleanliness & habits align'; ID-verified people, 'Govt KYC & workplace checks'; Meet before you move in, 'Safe public meetups & agreements'.

Footer: pill with shield icon '18+ only', then 'By continuing, you agree to Settle Terms of Service & Privacy Policy. 18+ only.' (the two names are links).

Behaviour: inline validation, eye toggle, loading state on the button. Add a checkbox 'I am 18 or older' directly above the button, because the footer text alone is not consent.

| Item                                                                       | Status and instruction                                                                                                                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Continue with Google and its divider                                       | Later: hide in the MVP (feature flag), so the email form sits directly under the hero                                                                               |
| Pill 'Over 45,000+ happy homes'                                            | Replace: no such number exists. Remove the pill, or use a true one such as 'Now live in Bengaluru'                                                                  |
| Pill 'Bangalore, Mumbai, NCR' and the sub-text 'across India's top cities' | Replace: list only the cities that are live, read from data                                                                                                         |
| Row 'ID-verified people'                                                   | Replace until verification exists: title 'Safety built in', subtitle 'Block and report anytime'. Restore the original wording in the release that adds verification |
| Row 'Meet before you move in'                                              | Replace the subtitle with 'Chat first, then meet in a public place'                                                                                                 |

### Screen 3: Onboarding step 2, Search criteria (/onboarding/2)

TopBar title 'Create your profile' (the screenshot says 'Chat Meetup': Defect), kebab menu, user avatar. StepHeader: 'STEP 2 OF 5', 'Search Criteria', 'Save & Exit', two segments filled. SectionLabel 'PREFERENCES'. Heading 'Where & how much do you want to spend?'. Sub-text 'We only match you with flatmates whose budgets overlap and who want to live in the same neighborhoods.'

1. Card 'Monthly rent budget' (icon, subtitle 'Per person share'). Inside, a mint box 'TARGET WINDOW' with the range in large teal text, for example '₹14,000 – ₹22,000 /mo'. Dual-thumb slider from ₹3,000 to ₹30,000+ in steps of ₹500 with labels 'Min ₹3,000' and 'Max ₹30,000+'. 'Quick presets:' chips: 'Student (₹8k–₹14k)', 'Young Pro (₹15k–₹25k)' (selected in the screenshot), 'Premium / Gated (₹25k+)'. WhyWeAsk: 'Rent mismatch is the #1 reason flatmates fall out. Setting a realistic range filters out incompatible flats early.'
2. Card 'Where in Bengaluru?' (the city name comes from the user's city; subtitle 'Pick at least 2–3 areas for best matches'). Search field 'Search localities (e.g. Indiranagar, B...'. Heading 'Selected Localities (3)' with removable chips (for example Koramangala, HSR Layout, Indiranagar). 'Popular nearby spots:' addable chips (Bellandur, BTM Layout, Domlur, Sarjapur Road, Whitefield). WhyWeAsk: 'Commutes matter! We'll prioritize people commuting in the same direction or looking within 3km of your preferred zones.' Rule: at least 1 and at most 10 localities; 2 to 3 is only a recommendation.
3. Card 'When are you moving in?' (subtitle 'Find someone on the exact same schedule'). Three RadioCards: 'Immediately' (Ready to move within 7 days), 'Within 1 Month' (Around 1st of next month; selected in the screenshot), 'Flexible / Browsing' (Looking 60+ days ahead). Field 'Target lease start date' with a 'Change' link opening a date picker. WhyWeAsk: 'Finding a flat takes 2–3 weeks. Aligning move-in dates prevents paying double rent.' Each option sets a default date (today + 7 days; the 1st of next month; today + 60 days); the user can override it with Change.

StickyCta: 'Continue to Lifestyle Habits' with arrow; note 'You can change these anytime in profile settings'.

| Item                                   | Status and instruction                                                 |
| -------------------------------------- | ---------------------------------------------------------------------- |
| 'Avg. 2BHK share in South BLR: ₹17.5k' | Replace: show only when real rent data exists; otherwise hide the line |
| Date '1st July 2025'                   | Defect: stale sample date; always compute from today                   |

### Screen 4: Onboarding step 3, Daily rhythm (/onboarding/3)

StepHeader 'STEP 3 OF 5 • Daily Rhythm', three segments filled. SectionLabel 'DAILY RHYTHM & HABITS'. Heading 'When do your days start & end?'. Sub-text 'Sleep mismatches create friction. We pair you with people who share a synchronized circadian clock.'

1. Card with two TimeTiles side by side. Bedtime (moon icon), large '11:00 PM', chips 10:00 PM, 11:00 PM (selected, filled deep teal), 12:00 AM, 1:00 AM+. Wake-up (sun icon on peach), large '7:00 AM', chips 6:00 AM, 7:00 AM (selected), 8:00 AM, 9:00 AM+. A chip ending in plus opens a time picker for later times. Under the tiles a mint bar: moon icon and '8 hrs rest window' (computed from the two times), and on the right 'Ideal sync' with a swap icon (show it when the rest window is 7 to 9 hours, otherwise hide).
2. Card 'How clean do you keep common areas?' with WhyWeAsk 'Dish rotations & chore duties are the #1 source of flatmate tension.' LevelSelector: Relaxed, Casual, Moderate, Tidy (selected), Spotless. Description box for the selected level; the screenshot shows level 4: 'Level 4: Tidy & Consistent' with 'Daily quick wipe-downs, shared maid schedule, no overnight dirty dishes in sink.' Proposed copy for the other levels, in the same style: Level 1 Relaxed: 'Cleans when it gets bad; fine with a lived-in look.' Level 2 Casual: 'Weekly clean-ups; dishes done within a day or two.' Level 3 Moderate: 'Regular tidying; dishes done the same day; chores shared on a rota.' Level 5 Spotless: 'Everything in its place, daily cleaning, strict rules for shared spaces.'
3. Card 'How often do you have guests or friends over?' (sub-text 'Keep house boundaries clear before you move in together.'). Three RadioCards: Rarely ('Quiet sanctuary — mostly alone time, prior notice needed for guests.'), Sometimes ('Weekend hangouts, study/work sessions with advance heads-up.', selected), Often ('Social home — friends over frequently, love hosting dinners and game nights.').
4. Mint InfoBar with shield icon: 'We prioritize flatmates whose daily rest windows align within ±1.5 hours.'

StickyCta: 'Continue to Lifestyle & Dealbreakers'; note 'Step 3 of 5 • You can adjust preferences anytime'.

Data: bedtime and wake time are stored as minutes after midnight; cleanliness 1 to 5; guest frequency rarely, sometimes or often.

### Screen 5: Onboarding step 4, Habits and dealbreakers (/onboarding/4)

StepHeader 'STEP 4 OF 5', four segments filled. SectionLabel 'LIFESTYLE & COMPATIBILITY'. Heading 'Set your living habits & boundaries'. Sub-text 'Be 100% honest. Finding the right fit prevents awkward roommate disputes later.'

1. Card with tag 'YOUR OWN HABITS' and VisibilityTag Public. Title 'About your habits', text 'This displays directly on your public compatibility profile.' Two ToggleRows: 'I smoke' (state tag 'Non-smoker' or 'Smoker'; helper 'Cigarettes, vape, or social smoking') and 'I have pets' (tag 'No pets' or 'Has pets'; helper 'Moving in with a companion animal'). Below, 'LIFESTYLE PREFERENCES' with two optional chips, 'Diet: Vegetarian & Non-veg friendly' and 'Work: Hybrid (3 days office)'. Rule: these two are shown on the profile only; they are never used for matching or filtering. They need two optional fields, diet and work mode (see the Backend Schema).
2. Card with red tag 'STRICT DEALBREAKERS' and VisibilityTag Private. Teal InfoBar: title 'Automatic discovery filter enabled', text 'Profiles mismatching your dealbreakers will be hidden from your feed, and your profile won't show to them either.' Two ToggleRows: 'Okay living with a smoker?' (helper 'Allow profiles with I smoke to appear in matches'; when off, a red tag 'Strictly non-smoking flatmates only'; when on, a neutral tag 'Smokers are fine') and 'Okay living with pets?' (helper 'Allow flatmates with indoor cats or dogs'; when on, a green tag 'Pet-friendly flatmates welcome'; when off, a red tag 'No pets in the flat'). WhyWeAsk: 'Habit mismatch is the leading cause of early lease breaks. Upfront alignment preserves peaceful homes.'

StickyCta: 'Continue to Profile Details'; note 'Step 4 of 5 • Dealbreakers remain private & unshared'.

| Item                                                                             | Status and instruction                                                                                                                 |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Banner 'High Compatibility Guarantee: Matches will share at least 85% of you...' | Replace: the product shows people from a score of 50 up, so it cannot promise 85. Use 'We only show people who fit your dealbreakers.' |
| Public versus private labels                                                     | Build exactly as shown; the labels must stay true (never show another person's dealbreaker answers)                                    |

### Screen 6: Onboarding step 5, Introduce yourself (/onboarding/5)

StepHeader 'STEP 5 OF 5 • FINAL STEP' with all segments filled and a 'Preview Card' link on the right (opens a preview of the user's own Discover card). Coral-tint tag 'FINAL TOUCH'. Heading 'Introduce yourself to future flatmates'.

1. Photo card: large round photo with a ring and a coral camera badge; buttons 'Upload New' and 'Use Camera'; hint 'Clear single-person face photo works best. Please avoid sunglasses, heavy filters, or group shots.'
2. Details card: 'Date of Birth' with a green pill showing the computed age (for example '25 years old'), helper, field in DD/MM/YYYY with calendar icon, helper 'Used to calculate your age badge. You must be 18+ to use Settle.' 'Occupation / Workplace' with helper 'Helps potential flatmates understand your commute schedule and rhythm.' 'About You (Lifestyle, Habits, Quirks)' with helper 'Keep it natural. Mention your routine, dietary vibe, or favorite weekend unwind.', a text area and a counter (for example '172 / 200'). 'Quick suggestions to add:' chips '+ Morning person', '+ Board games', '+ Filter coffee lover', '+ Quiet evenings'. Tapping a chip adds it to the user's tags (up to 6), shown as removable chips under the text area; it does not change the bio text.
3. Privacy card with shield icon, title 'Your privacy is safeguarded'.

StickyCta: 'Finish & See My Matches' with a sparkle icon. Footer: 'By continuing, you agree to the Settle Community Guidelines and fair housing anti-discrimination policies.'

| Item                                                                                        | Status and instruction                                                                                                                                     |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Line 'Profiles with a clear photo and genuine bio receive 4x more mutual match requests...' | Replace: no such data. Use 'A clear photo and an honest bio help people trust you.'                                                                        |
| Box 'Verified Selfie Check... Green Shield badge'                                           | Later: hide until verification exists                                                                                                                      |
| Privacy card text about government ID, flat number and contact numbers                      | Replace with true wording: 'Your exact address and contact details are never shown to other users.'                                                        |
| Single field 'Product Designer @ Swiggy'                                                    | Deviation: use two inputs inside the same card, 'Job title' and 'Company (optional)'. Discover shows only the job title; the company appears after a match |

### Screen 7: Discover (/discover)

Header: AppLogo, city pill 'Bengaluru' with a navigation icon and chevron, user avatar with green dot. Sub-row: pill '● 18 flatmates nearby' (the number is the count of remaining candidates), and one round filter button (sliders icon, small orange dot when filters differ from defaults) that opens a quick edit of search criteria.

Main card (rounded 24px, tall photo): top-left pill with shield icon and verification text; top-right ScoreRing ('87', 'Match', 'High fit'); bottom gradient with name and age and a small green check ('Rhea Sengupta, 24'), a line with job title, then wrapping chips: budget '₹14,000 – ₹18,000/mo', areas 'Indiranagar & Domlur', lifestyle chips (Night owl, Non-smoker, Pet friendly); hint 'Tap card for flat rules & commute details' with a chevron up.

Below the card: round Pass button (white, X), small star button, large coral round Like button (heart), and a caption. Bottom navigation: Discover (active), Matches (badge 3), Messages (badge 1), Profile.

| Item                                                     | Status and instruction                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Pill 'Govt ID & Work Verified'                           | Later: show a verified pill only when the profile's verification status is verified; nobody is verified in the MVP, so no pill |
| 'Moved 2 mo ago' after the job title                     | Replace: remove (not collected)                                                                                                |
| Job title 'at Razorpay'                                  | Replace: show the job title only; company after a match (Screen 6 deviation)                                                   |
| Chip 'Non-smo...' cut off                                | Defect: chips wrap onto a second line, never truncate                                                                          |
| Star (super like) and the history icon                   | Later: hide; the Pass and Like buttons stay centred                                                                            |
| Two filter icons (header and sub-row)                    | Defect: keep only the sub-row one                                                                                              |
| Hint 'flat rules & commute details'                      | Replace: 'Tap card to see why you match'                                                                                       |
| Caption 'Mutual matches reveal verified contact info'    | Replace: 'Chat opens when you both like each other'                                                                            |
| Logo shown as a broken image with the text 'Settle Logo' | Defect: use the inline SVG logo                                                                                                |

Behaviour: swipe right = Like, swipe left = Pass, tap = open Screen 8; the next card slides in; the match overlay (section 5) appears on a mutual like; an empty state shows when no cards remain.

### Screen 8: Flatmate profile (/discover/:userId)

TopBar 'Flatmate Profile' with back arrow, kebab (Report, Block) and user avatar. Photo header with a progress segment at the top; over the bottom of the photo: name and age with check, job title, a pin icon with 'Indiranagar, Bengaluru', and a ScoreRing ('87%', 'High Fit').

Sections in order:

1. Verification banner (shield icon, 'Verified Community Member' with a tier tag, a line about how they were verified).
2. 'Why You Match' heading with a pill '5 of 6 Essential Criteria' (the count of green rows among the six rows below). Six BreakdownRows, each showing You and the other person: Monthly Rent Budget (status 'Overlap: ₹15k–₹18k/mo', green; You ₹15,000–₹22,000, other ₹14,000–₹18,000); Sleep Schedule (status like '1.5h shift'; You 11:00 PM–7:00 AM, other 12:30 AM–8:30 AM; note 'Quiet-hours boundary easily manageable for both.'); Cleanliness Standard ('Perfect Match: Daily Tidy'; Level 4 versus Level 4); Smoking Habits ('Dealbreaker Cleared'); Pet Friendliness ('Cat Lover Welcome', text adapts to the other person's pets); Locality Focus ('Shared: Indiranagar', your areas versus theirs). Under a small heading 'More details' add two compact rows in the same style: Guests and Move-in date.
3. 'About Rhea': quote card with the bio; 'LIFESTYLE & VIBE' chips from the tags.
4. 'Search Criteria & Areas': target locality chips and 'Move-in Timeline' (for example 'Moving in by 1st August').
5. Sticky bottom bar: quiet button 'Pass' with X and coral button 'Like' with heart; footnote under it.

| Item                                                                                  | Status and instruction                                                                                                                                                 |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Verification banner with 'Tier 3', 'Aadhaar verified', corporate email                | Later: hide in the MVP                                                                                                                                                 |
| Smoking row 'Strict Non-smoker' and pet row 'Pet Friendly'                            | Replace: show only public facts (smoker or non-smoker, has pets or no pets). 'Strict' and 'Pet friendly' reveal private dealbreaker answers, which must never be shown |
| Pet detail 'Indoor cat (Mochi)'                                                       | Replace: 'Has pets' (pet type is not collected)                                                                                                                        |
| Sleep row in red for a 1.5 hour shift                                                 | Replace: use the status thresholds in the TRD, so 1.5 hours shows amber                                                                                                |
| Map with '15 mins commute to Razorpay HQ', 'Flat Preferences', '2 Mutual Connections' | Later: hide                                                                                                                                                            |
| Button 'Like & Send Invite'                                                           | Replace: 'Like' (there is no invite step)                                                                                                                              |
| Footnote 'Mutual likes unlock direct chat & verified contact details'                 | Replace: 'Chat opens when you both like each other'                                                                                                                    |

### Screen 9: Matches (/matches)

Header as on Discover. Row label '● MUTUAL COMPATIBILITY DECK'. Section 'New Matches' with a red pill '4 new', and a horizontal row of AvatarRings (name and time under each: 'Just now', '2h ago', 'Yesterday'). Section 'Mutual Matches' with sub-text 'You both said yes to living together' and a filter button.

Match cards: photo (rounded) with a small green shield on its corner, name and age, a score pill ('92% Fit', '87% Great Fit', '84% Match'), job title line, location and target line, up to three trait chips for what the two people share (for example 'Both Non-Smokers', '₹18k–₹22k Budget Match', 'Night Owls'), a time line ('Matched 2 hours ago', 'Active 15m ago'), and an action on the right: coral 'Say hi' when no messages exist yet, deep teal 'Chat Now' when a conversation exists.

Icebreaker card with sparkle icon at the bottom: 'Icebreaker suggestion' with an opening line. Tapping it opens the chat with the text in the input (never auto-sent). Template: 'Hey {first name}! Saw you're also looking around {shared locality}. When are you hoping to move in?'

| Item                                                     | Status and instruction                                   |
| -------------------------------------------------------- | -------------------------------------------------------- |
| Segmented control 'Active (3) / Empty State'             | Defect: demo control; remove                             |
| 'Expires in 24h', '18h left'                             | Replace: remove; matches do not expire in the MVP        |
| Calendar button next to the action                       | Later: hide (meeting scheduling)                         |
| Government ID chip                                       | Later: hide                                              |
| 'Say hi' shown in coral on one card and green on another | Defect: coral for Say hi, deep teal for Chat Now, always |
| Scores                                                   | The same person has one score on every screen            |

### Screen 10: Chat (/messages/:matchId)

Top bar: back arrow, avatar with green dot, name with check, mint chip '92% Match', 'Active now', kebab (Report, Block). Below it the JourneyTracker: 'Journey to Co-living', 'STEP 1 OF 4', and four steps: '1. Chat' (Active), '2. Verify ID' (Ready), '3. Meet' (Next), '4. Decide' (Lease). SafetyCard 'Safe Discovery First' (closable): 'Meet in a public cafe first. Never transfer rent, tokens, or security deposits before visiting the flat in person.' with the link 'Read Settle Safety Checklist'. Summary card of the match: avatar, name, score chip, 'Matched 2 hours ago • job title', chips (Non-Smoker, area, budget, Night Owl Friendly). Day separator 'Today'. Bubbles with time and ticks. Typing indicator 'Rhea is typing...'. Quick-reply chips 'What's your move-in date?' and 'Can we meet this weekend?'. Input row: text field 'Message Rhea...' and a coral round send button.

| Item                                               | Status and instruction                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| Step 2 shows 'Ready'                               | Replace: show 'Coming soon' until verification exists                  |
| Flat card 'Shortlisted Flat ₹28,500 / person'      | Later: hide. It also broke the budget rule (above both users' budgets) |
| The plus button and the shop icon in the input row | Later: hide                                                            |
| Matched-at, chips and budget in the summary card   | Use the same data as Matches (the screenshot shows a different budget) |
| 'Safety Checklist' link                            | Build as a simple static page of safety tips                           |

### Screen 11: ID verification (later release)

TopBar 'ID verification' (the screenshot says 'Id Verification': Defect). Pill 'High Trust Community'. Heading 'Get Verified for Trust & Safety'. Badge preview card. 'Strict Privacy Commitment' card with three tick lines. 'Simple 3-Step Process' (about 2 mins): 1 Upload Government ID (type chips Aadhaar, Passport, Driver's License, Voter ID; upload box; JPG, PNG or PDF up to 10MB), 2 Take a Quick Selfie (liveness check), 3 Automated Review & Approval (about 15 mins). 'How Your Status Progresses' tabs (Unverified, In Review, Verified), an 'Action Required' box, and the button 'Start Verification'. Do not build until the founder decides the policy (mandatory or optional, free or paid) and a lawyer reviews ID handling (Aadhaar has strict rules for private companies). Remove claims such as '3x Mutual Matches' and any security claim that is not true in the implementation.

### Screen 12: Ready to decide (later release)

TopBar 'Ready to decide?' (Defect: the screenshot says 'Id Verification'). Tag 'Stage 4 of 4 • Final Checkpoint'. Pair header 'You & Rhea', calm box 'There is no rush to commit'. 'Mutual Alignment Checklist' with 5 items (Chatted & vibe checked; IDs & background verified; Met in person; Rent & utility split agreed; House rules & dealbreakers), each showing a You chip and a partner chip that are confirmed independently. 'Agreed Terms Summary' with target move-in and monthly split. Buttons 'We're compatible: continue to agreement' and 'Not a comfortable fit'. Remove 'Settle Escrow Protection' and the mediator line unless those services exist.

### Screen 13: Co-tenant agreement and eSign (later release)

Shows tenure, signers, clause cards, an eSign trail and an Aadhaar OTP signature button, with claims about stamp duty and legal validity. Do not build. It needs a lawyer, a licensed eSign provider and a financial-regulation review, and it has no landlord side. Keep this screen only as a vision reference.

## 5. Screens missing from the screenshots (design in the same style)

| Screen                            | Specification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Onboarding step 1 (/onboarding/1) | StepHeader 'STEP 1 OF 5'; label 'ABOUT YOU'; heading 'Let's start with the basics'. Card: full name field. Card: gender as four RadioCards (Woman, Man, Non-binary, Prefer not to say). Card: 'I would like to live with' as three RadioCards (Anyone, Women only, Men only) with a Private tag and WhyWeAsk 'Some people feel safer sharing with a certain gender. This is never shown to others.' City select (Bengaluru, with 'More cities coming'). StickyCta 'Continue to Search Criteria' |
| Login (/login)                    | AppLogo, heading 'Welcome back', email and password fields, coral button 'Log in', link 'Create an account'                                                                                                                                                                                                                                                                                                                                                                                     |
| Messages list (/messages)         | TopBar 'Messages'; rows with round photo, name, last message preview, time, unread badge; empty state 'No conversations yet. Say hi to a match.'                                                                                                                                                                                                                                                                                                                                                |
| Profile and settings (/profile)   | A preview of the user's own Discover card, buttons 'Edit profile', toggle 'Hide my profile', 'Blocked users', 'Log out', danger row 'Delete account', links to Terms and Privacy                                                                                                                                                                                                                                                                                                                |
| Match overlay                     | Full-screen mint gradient, two overlapping round photos, heading 'It's a match!', score pill, coral button 'Say hi', quiet button 'Keep browsing'                                                                                                                                                                                                                                                                                                                                               |
| Block and report sheets           | Bottom sheets. Block: 'They will not be told. You will not see each other again.' with buttons Block and Cancel. Report: reason list (Fake profile, Harassment, Scam, Inappropriate content, Unsafe behaviour, Other), optional details (500 characters), button 'Send report', then toast 'Thanks. We will review this.'                                                                                                                                                                       |
| Empty and error states            | Discover: 'You have seen everyone for now. Check back soon or widen your localities and budget.' with a button to edit search criteria. Matches: 'No matches yet. Keep browsing.' Network error: message and Retry. Not found: short sentence and a button to Discover                                                                                                                                                                                                                          |

## 6. Copy corrections that apply everywhere

These lines appear in the screenshots but are not true for a new product. Keep the layout and replace the text. Do not ship invented numbers, guarantees or legal claims.

| Screenshot text                                                                                                    | Do this                                                       |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| 'Over 45,000+ happy homes'                                                                                         | Remove or replace with a true statement                       |
| '4x more mutual match requests', '3x Mutual Matches'                                                               | Remove                                                        |
| 'Avg. 2BHK share in South BLR: ₹17.5k'                                                                             | Show only with real data                                      |
| 'High Compatibility Guarantee', 'Peace-of-Mind Guarantee', 'Settle Escrow Protection', '24/7 relationship support' | Remove until the service exists                               |
| 'Govt ID & Work Verified', 'Verified Community Member Tier 3', 'Aadhaar verified'                                  | Show only for users whose status is verified (not in the MVP) |
| 'Karnataka Rent Control compliant', 'IT Act valid', 'e-Stamp duty pre-cleared'                                     | Do not use without legal review                               |
| 'Expires in 24h', '18h left', 'Moved 2 mo ago'                                                                     | Remove                                                        |

## 7. Defects in the screenshots (do not copy)

- Wrong top bar titles: 'Chat Meetup' on the onboarding steps; 'Id Verification' on the verification, decision and agreement screens.
- Broken logo image on Discover and Matches.
- Match scores and budgets differ for the same person (87% and 92%; budgets ₹14k–₹18k, ₹18k–₹22k and ₹25k–₹32k). Use one fixed sample set everywhere (below).
- Stale 2025 dates, and a 1999 birth date shown as 25 years old; use dates relative to today.
- A person described as a night owl on the card and an early riser in the bio; the user is named Rhea Sharma while the match is Rhea Sengupta.
- A flat priced above both users' budgets.

Sample data to reuse on every screen:

| Person          | Age | Job title         | Areas                   | Budget per month  | Score |
| --------------- | --- | ----------------- | ----------------------- | ----------------- | ----- |
| Rhea Sengupta   | 24  | Product Designer  | Indiranagar, Domlur     | ₹14,000 – ₹18,000 | 87    |
| Kabir Sharma    | 26  | Software Engineer | Koramangala, HSR Layout | ₹16,000 – ₹22,000 | 84    |
| Ananya Deshmukh | 25  | Brand Strategist  | HSR Layout, BTM Layout  | ₹13,000 – ₹19,000 | 81    |

## 8. Accessibility and responsiveness

- Designed at 390px width. On desktop show a centred column, maximum width 480px.
- Body text contrast at least 4.5 to 1; large text and bold call-to-action labels at least 3 to 1.
- Tap targets at least 44px; visible focus rings; every icon-only button has a text label for screen readers.
- Errors use text, not colour alone. Support zoom to 200%. Respect reduced motion.
- Every screen has loading (skeleton), empty, error and offline states.
