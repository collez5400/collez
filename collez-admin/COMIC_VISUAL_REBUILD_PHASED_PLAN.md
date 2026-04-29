# COLLEZ — Comic-Style Visual Rebuild (Phased Master Plan)

## Purpose
Rebuild the COLLEZ app UI as a *full visual rebuild from scratch* using the provided comic-style references (and the COLLEZ logo) as the **only source of truth** for:
- layout structure
- spacing rhythm
- typography style
- color usage
- component shapes, borders, shadows
- visual density and overall “sticker/comic world” vibe

This document is **plan-only** (no UI mockups, no code).

---

## Source-of-truth References (for layout + styling behavior)
The plan below is derived from these provided screens (the exact reference screens you pasted above in the chat):

### COLLEZ Logo (provided)
Logo asset file in this workspace:

`C:\Users\Two Stars HQ\.cursor\projects\c-Users-Two-Stars-HQ-Desktop-collez/assets/c__Users_Two_Stars_HQ_AppData_Roaming_Cursor_User_workspaceStorage_c7123c16d2cecfaee064142bf6d2e0b7_images_image-3bb487bd-8b89-43d8-aca3-f215835ef014.png`

Embedded preview (for humans):

![COLLEZ logo](C:\Users\Two Stars HQ\.cursor\projects\c-Users-Two-Stars-HQ-Desktop-collez/assets/c__Users_Two_Stars_HQ_AppData_Roaming_Cursor_User_workspaceStorage_c7123c16d2cecfaee064142bf6d2e0b7_images_image-3bb487bd-8b89-43d8-aca3-f215835ef014.png)

1. `Splash Screen`
2. `Onboarding 1 (Campus Heroes)`
3. `Onboarding 2 (Win with friends / podium)`
4. `Onboarding 3 (Rewards)`
5. `Login / Signup`
6. `Home Dashboard`
7. `Tasks Screen (Missions tabs + task cards + FAB)`
8. `Vault (Notes / PDFs / Subjects style)`
9. `Timetable Screen (day chips + class cards)`
10. `Attendance Screen (danger zone + subject cards)`
11. `Discover / Friends (Connect page with search + filter chips + profile cards)`
12. `Rankings / Leaderboard (podium + rank cards)`

The provided COLLEZ logo image is used as the branding anchor.

---

## Non-Negotiable Visual System (extracted from references)

### 1) Borders
- Thick black outlines everywhere (brutal/brisk comic ink).
- Avoid thin/subtle borders—if a border is present, it must be visually assertive.

### 2) Colors
- High saturation and strong contrast.
- Yellow + Purple dominance.
- Use cyan/red/green accents for “state” and “reward” meaning (danger, urgent, bonus XP, etc.).
- Avoid dull/muted palettes (no grey-heavy SaaS feel).

### 3) Depth + Shadow
- Heavy offset shadows on interactive elements and cards.
- Layered UI: cards on cards, sticker props that sit above surfaces.
- Halftone textures and comic burst effects layered over dark backgrounds.

### 4) Typography
- Bold, heavy, expressive display headings.
- Comic/display style for hero titles (often uppercase, with extra weight or outline/stroke feel).
- Body text uses clean readable type, but never thin/minimal.

### 5) Component Style Language
- Buttons feel physical/chunky:
  - thick border/ink
  - hard drop shadow (offset)
  - “press” interaction: translate + shadow reduction
  - occasional glossy rim highlight / shimmer for energy
- Cards feel like comic panels:
  - thick ink border
  - halftone overlay in the surface
  - state badges (URGENT, UP NEXT, COMPLETED, etc.)
- Icons are filled/illustrated and playful (avoid outline/minimal icon sets).

---

## App Feature Mapping (from your COLLEZ context)
Academics: `Attendance`, `GPA/CGPA`, `Timetable`, `Exams`, `Notes`, `Assignments`  
Social: `Marketplace`, `Lost & Found`, `Events`, `Clubs`, `Community`  
Productivity: `Tasks`, `Planner`, `Reminders`  
Utility: `Fees`, `Transport`, `Documents`  
Gamification: `XP`, `Streaks`, `Leaderboards`, `Rewards`

Important constraint: Marketplace/Lost&Found/Clubs/Community/Exams/Assignments were not individually shown in the provided references. Where a specific reference layout is missing, this document uses the **closest reference grammar** (card, badge, tab chips, list rows) and marks those areas as **Reference Gap — confirm layout when additional references arrive**.

---

## Visual Design Principles (how each screen should “feel”)
- The product should feel like: **Game + Social app + Comic world**.
- No “dashboard spreadsheet vibe.”
- Every screen should have:
  1. at least one primary action cluster (missions, join now, up next, danger action, follow/msg)
  2. progression/status proof (XP chip, streak card, rank highlight)
  3. thick ink structure (borders + shadows) that organizes content

---

## REQUIRED Phases (1–9)

Each phase includes:
1. 🎯 Objective
2. 🎨 Reference(s) used
3. 🔁 What current UI is being replaced
4. 🧱 New layout structure (clear description)
5. 🧩 Components involved
6. 💡 UX improvement reasoning
7. ⚙️ Implementation priority

---
## Completion Stats (Live)
Last updated: Wednesday, Apr 29, 2026

Overall:
- Phase progress: **Phase 1 (Brand System) in progress (~67%)**
- Completed (Phase 1): `ComicBrandShell` background grammar, Splash refactor to use it + striped loading feel, onboarding Step 1/2/3 story-beat layout updates, and Login wrapped in the same brand shell.
- Remaining (Phase 1): replace Step 1 hero placeholder (“HERO PANEL”) with the real illustration art, tune rewards starburst + floating XP “prop” motion, and extract podium primitives into reusable components.

Next phase to ship: **PHASE 2 — Design System**

---

## PHASE 1 — Brand System
### 1) 🎯 Objective
Establish COLLEZ’s “comic universe” identity: wordmark lockup, yellow/purple dominance, thick-ink borders, halftone textures, and offset shadow depth—so every subsequent screen inherits the same visual gravity.

### 2) 🎨 Reference(s) used
- `COLLEZ logo`
- `Splash Screen`
- `Onboarding 1/2/3`
- `Login / Signup` (header + action framing)

### 3) 🔁 What current UI is being replaced
- Any existing splash/onboarding/login layout, typography hierarchy, and background style that does not:
  - prioritize thick black ink
  - use halftone/burst layers
  - apply heavy offset shadows

### 4) 🧱 New layout structure (CLEAR description)
Create a brand shell used everywhere:
- Full-screen dark space base with ambient glow circles and halftone overlay.
- Splash:
  - central COLLEZ wordmark/branding
  - loading bar (striped/energy feel)
  - “brand promise” headline
- Onboarding is three story beats:
  1. Hero illustration inside a comic cutout panel + offset caption box
  2. Podium visual + progress indicators + “storyline” header
  3. Rewards explosion visual + floating XP props + big CTA

### 5) 🧩 Components involved
- Wordmark lockup
- Loading/progress bar
- Hero illustration panel (comic cutout frame)
- Podium visualization primitives
- Reward explosion spotlight card
- Chunky CTA button

### 6) 💡 UX improvement reasoning
Onboarding teaches the core loop (progress + rewards + social status) through spectacle—not explanation. This reduces early drop-off and makes the app instantly feel like a world.

### 7) ⚙️ Implementation priority
**P0 (foundational).** No other phase can proceed without this shared brand grammar.

### ✅ Phase 1 Completion Snapshot
Done:
- Shared brand shell grammar is implemented (full-screen dark base + halftone + ambient glows).
- Splash + Login/Onboarding now inherit the same background + branding lockup language.
- Onboarding story beats are in place:
  - Beat 1: comic cutout hero panel + offset caption box
  - Beat 2: podium beat framed with a storyline header + progress
  - Beat 3: rewards explosion spotlight with XP “props” + big CTA

Left:
- Swap the Beat 1 placeholder hero copy (“HERO PANEL”) for the actual comic illustration art.
- Fine-tune starburst intensity + floating XP prop motion to match reference “explosion” density.
- Extract podium primitives (Beat 2) into a reusable component set (Phase 2 dependency).

---

## PHASE 2 — Design System
### 1) 🎯 Objective
Convert the brand rules into reusable UI primitives: comic panels, sticker chips, physical buttons, and navigation bars—so screens become consistent without drifting into SaaS patterns.

### 2) 🎨 Reference(s) used
- `Home Dashboard` (hero section + missions)
- `Tasks Screen` (mission tabs + task cards + FAB)
- `Login / Signup` (button gloss/shadow behavior)
- `Discover` (search + filter chips + profile cards)
- `Rankings` (podium + list rows)

### 3) 🔁 What current UI is being replaced
- Existing component set that yields thin borders, neutral/grey palettes, or flat cards.

### 4) 🧱 New layout structure (CLEAR description)
Define core primitives with consistent rules:
- **Comic Panel Card**
  - thick border
  - halftone overlay inside surfaces
  - offset shadow and layered highlight corners
- **Physical Button**
  - chunky padding
  - thick outline
  - hard drop shadow
  - press interaction: translate + remove shadow
  - optional glossy rim highlight / shimmer energy
- **Sticker Chips / Badges**
  - rounded-full XP chips
  - state badges: URGENT, UP NEXT, COMPLETED, DANGER ZONE labels
- **Navigation**
  - Top bar: yellow-dominant header with avatar + COLLEZ label + XP icon/prop
  - Bottom nav (mobile): icon+label tiles with active yellow tile + thick black border + shadow
- **Progress Widgets**
  - XP bar with stripe energy
  - circular progress ring inside status cards

### 5) 🧩 Components involved
- Card system (comic panel)
- Button system (physical + glossy)
- Chip/badge system
- Progress widgets (bar + circle)
- Top bar + bottom nav variants

### 6) 💡 UX improvement reasoning
Once primitives are correct, every feature can be implemented as “comic composition” rather than “standard app UI,” preventing accidental modernization.

### 7) ⚙️ Implementation priority
**P0.** All later phases depend on these primitives.

---

## PHASE 3 — Core Screens (Academics)
### 1) 🎯 Objective
Rebuild academic experiences into comic-panel missions and status cards: attendance emotion, timetable day chips, and vault collectible subjects.

### 2) 🎨 Reference(s) used
- `Attendance Screen`
- `Timetable Screen`
- `Vault (Subjects + Notes/PDF style)`
- `Home Dashboard` (academics surfaced as missions/next actions)
- `Tasks Screen` (mission tab grammar)

### 3) 🔁 What current UI is being replaced
- Academic pages that look like:
  - scheduling spreadsheets
  - academic dashboards
  - minimal grey study planners

### 4) 🧱 New layout structure (CLEAR description)
#### A) Attendance
- A stacked three-part layout:
  1. **DANGER ZONE** warning panel with an urgent action callout
  2. **OVERALL STATUS** panel with large circular progress ring + bold text
  3. **SUBJECTS** grid:
     - each subject card uses its own state color identity and progress ring

#### B) Timetable
- Top-level:
  - page header + comic display hero
  - “Add Event”/“Add Subject” comic button
- Day navigation:
  - horizontal day chips (Mon–Fri/M–Sat depending on reference rules)
  - one active chip with energetic glow
- Timetable body:
  - class cards in a grid:
    - past/completed card style (muted but still thick)
    - up-next style (glow/pulse + “UP NEXT” badge)
    - today/important style (yellow hero highlight)

#### C) Academic Vault (Notes/Assignments/Exams as collectible patterns)
- Convert “academic documents” into a vault collectible grid:
  - Subjects are collectible cards with:
    - icon
    - subject title
    - item-count badge
    - halftone/inner glow overlay
- Notes/PDF can reuse the `Vault` screen grammar:
  - horizontal quick actions
  - subjects grid
  - recent activity list rows (thick ink)

### 5) 🧩 Components involved
- Danger warning panel card
- Status progress widgets (bar/circle)
- Subject cards with progress rings
- Day chips
- Class cards (past/up-next/today/future variants)
- Vault subjects collectible cards
- Recent activity row cards

### 6) 💡 UX improvement reasoning
Attendance uses emotion + urgency (danger panel). Timetable uses game-like day navigation and card “beats.” Vault turns academia into collectible inventory, which boosts exploration.

### 7) ⚙️ Implementation priority
**P0–P1.** Academics are the utility driver of daily use.

---

## PHASE 4 — Social Features
### 1) 🎯 Objective
Make social feel like squads + connect + status proof: Discover search, filter chips, and student profile cards with Follow/Msg.

### 2) 🎨 Reference(s) used
- `Friends / Social (Discover)`
- `Rankings / Leaderboard` (social proof)
- `Home Dashboard` (motivational callouts)

### 3) 🔁 What current UI is being replaced
- Social UIs that are:
  - feed-like with neutral list rows
  - lacking thick ink structure
  - missing social action buttons (Follow/Msg)

### 4) 🧱 New layout structure (CLEAR description)
#### A) Connect / Discover
- Header:
  - display hero “CONNECT”
- Search:
  - thick-outline search bar with focused ring
- Filters:
  - horizontal scrolling filter chips (All Squads + specific squads)
- Student card grid:
  - each profile card contains:
    - avatar circle
    - name
    - role/title badge
    - tag chips
    - XP/level indicator
    - bottom action row: Follow + Msg (chunky buttons)

#### B) Rankings-as-shareable identity (social glue)
- Leaderboard “You” highlight becomes a shareable identity block:
  - podium energy + distinct highlighted card

### 5) 🧩 Components involved
- Search bar primitive
- Filter chip scroller
- Profile card grid
- Follow/Msg button row
- XP/level status snippets
- Leaderboard “You” highlight card

### 6) 💡 UX improvement reasoning
Social should be “actionable instantly.” The Discover layout makes actions unavoidable and scanning fast.

### 7) ⚙️ Implementation priority
**P1.** Social boosts retention and daily revisits once academics are already addictive.

---

## PHASE 5 — Productivity Layer
### 1) 🎯 Objective
Rebuild tasks and planner/reminders into comic mission mechanics: mission tabs + card grid + XP reward cues + FAB add energy.

### 2) 🎨 Reference(s) used
- `Tasks Screen`
- `Home Dashboard`
- `Timetable Screen` (planner structure via day chips)

### 3) 🔁 What current UI is being replaced
- Standard productivity screens with minimal visual hierarchy, thin borders, grey lists, or generic “todo apps.”

### 4) 🧱 New layout structure (CLEAR description)
#### A) Tasks / Missions
- Header:
  - big comic missions heading + short motivation line
- Tabs:
  - Today / Upcoming / Done / Important using chunky pill buttons
- Mission list:
  - card grid with state:
    - urgent = red-ish identity + URGENT badge
    - normal = purple identity badge (e.g., STUDY)
  - each card shows:
    - title
    - due/time label
    - +XP reward chip
- FAB:
  - floating add button, thick ink and offset shadow

#### B) Planner (mapped from timetable + tasks)
- Use day chips row grammar
- Planner cards reuse the class card format but content becomes “task/event mission tiles”

#### C) Reminders
- Reminders become the same “urgent mission” card family:
  - state badge + due label + XP callout

### 5) 🧩 Components involved
- Mission tabs
- Mission cards (urgent/normal/completed)
- XP reward chips
- FAB add button
- Planner day chips + planner cards

### 6) 💡 UX improvement reasoning
Productivity must feel like “progressing in a game.” XP chips and mission tabs create clear next actions and encourage daily completion.

### 7) ⚙️ Implementation priority
**P1.** Productivity supports the daily loop after academics ship.

---

## PHASE 6 — Gamification
### 1) 🎯 Objective
Make progression spectacle: streak cards, XP progress, podium leaderboards, and rewards milestones.

### 2) 🎨 Reference(s) used
- `Rankings / Leaderboard` (podium + highlight)
- `Home Dashboard` (WHAT’S UP, HERO + XP/streak)
- `Onboarding 2` (podium narrative)
- `Onboarding 3` (rewards explosion CTA)
- `Tasks Screen` (+XP chips)

### 3) 🔁 What current UI is being replaced
- Any gamification that is only a small stat row or minimal counters.

### 4) 🧱 New layout structure (CLEAR description)
#### A) Leaderboards
- Tabs:
  - COLLEGE / CITY / WEEKLY (use the reference tab grammar)
- Podium:
  - 1st/2nd/3rd place blocks with avatar circles + thick numbered banners
- List:
  - standard rank cards with:
    - rank number
    - avatar
    - name + department/college text
    - XP number badge
  - “You” highlighted card with a unique edge connector/shape

#### B) Streak + XP surfaces
- Home has a persistent hero section:
  - “WHAT’S UP, HERO?” header
  - XP progress bar
- Streak card:
  - pulsing “!” overlay bubble (as seen in references)

#### C) Rewards milestones
- Milestone celebration uses onboarding 3 “explosion” language:
  - central pop-art image/card
  - floating XP/FX props
  - CTA button

### 5) 🧩 Components involved
- Podium blocks
- Rank list rows
- Streak card with pulse badge
- XP progress bar
- Rewards explosion celebratory panel

### 6) 💡 UX improvement reasoning
Gamification is the retention engine. Spectacle creates dopamine; always-visible status builds identity and routine.

### 7) ⚙️ Implementation priority
**P0–P1.** Gamification rules shape every screen’s meaning.

---

## PHASE 7 — Motion & Delight
### 1) 🎯 Objective
Bring comic-world feel through micro-motion: press, lift, pulse, shimmer, and progress transitions.

### 2) 🎨 Reference(s) used
- `Tasks Screen` (hover lift + press active behavior)
- `Login / Signup` (glossy rim highlight and CTA energy)
- `Rankings` (bounce crown vibe)
- `Onboarding` screens (reward explosion momentum)

### 3) 🔁 What current UI is being replaced
- Static UI with no “game feel,” where buttons don’t react and states don’t animate.

### 4) 🧱 New layout structure (CLEAR description)
Global interaction behavior (apply consistently):
- Buttons:
  - `press` = translate + remove shadow
  - optional shimmer/gloss on primary CTAs
- Cards:
  - hover/lift = slight translate up
- Status badges:
  - pulse on active/in-progress states (“!” and “UP NEXT”)
- Progress:
  - animated fill for bars; animated transitions for counters where references show it

### 5) 🧩 Components involved
- Physical button component
- Comic panel card component
- Badge/pulse component
- Progress bar/circle animation wrappers

### 6) 💡 UX improvement reasoning
Motion increases perceived quality and makes actions feel “real” without adding UI clutter.

### 7) ⚙️ Implementation priority
**P1.** Depends on Phase 2 primitives.

---

## PHASE 8 — Growth & Retention
### 1) 🎯 Objective
Increase habit formation with daily missions, social status loops, and shareable identity surfaces.

### 2) 🎨 Reference(s) used
- `Home Dashboard` (daily missions callouts + XP)
- `Tasks Screen` (Today/Upcoming/Done/Important)
- `Rankings` (leaderboard identity + you highlight)
- `Onboarding 2/3` (podium/rewards narrative and CTA pacing)

### 3) 🔁 What current UI is being replaced
- Any retention mechanics that feel like reminders/settings rather than a daily game loop.

### 4) 🧱 New layout structure (CLEAR description)
- Daily loop surfaces:
  - Home hero “WHAT’S UP, HERO?” (progress and status)
  - Missions board section (most immediate “do X now”)
  - Leaderboard quick glance (identity reinforcement)
- Weekly social reinforcement:
  - leaderboard category tabs become the “ritual schedule”
- Rewards cadence:
  - milestone celebrations use the explosion style

### 5) 🧩 Components involved
- Daily hero XP section
- Missions/Tasks tabs + completion prompts
- Leaderboard “mini” + ritual callouts
- Rewards milestone celebrations

### 6) 💡 UX improvement reasoning
Retention is built on predictability: students should know what to do next daily, and they should see their identity change as a result.

### 7) ⚙️ Implementation priority
**P2.** Ship core fun first.

---

## PHASE 9 — Dev Handoff
### 1) 🎯 Objective
Provide engineering a “non-drift” specification: token rules, component grammar, and per-screen layout patterns directly mapped to references.

### 2) 🎨 Reference(s) used
- All screens listed in Source-of-truth section.

### 3) 🔁 What current UI is being replaced
- “Implicit” styling logic (where developers might accidentally drift into modern minimal UI).

### 4) 🧱 New layout structure (CLEAR description)
Deliver a per-screen checklist that states:
- which reference layout grammar to follow
- which card types must exist
- required state badges
- mandatory interaction feel (press/lift/pulse)
- required background overlays (halftone/burst/ambient glow)

### 5) 🧩 Components involved
- Token spec (colors/shadows/border weight)
- Primitive components inventory (cards, buttons, chips, nav, progress)
- Screen blueprint checklist

### 6) 💡 UX improvement reasoning
This prevents “almost comic” drift and ensures the UI matches the provided references at every state.

### 7) ⚙️ Implementation priority
**P0/P1** for documentation completeness during the earliest implementation.

---

## EXTRA STRATEGIC OUTPUT (MANDATORY)

### A) Which screens to redesign FIRST (highest impact)
1. `Home Dashboard`
2. `Tasks Screen (Missions)`
3. `Timetable Screen (day chips + class cards)`
4. `Rankings / Leaderboard (podium + “You” highlight)`
5. `Attendance Screen (danger emotion + subject progress cards)`

### B) Which features can go VIRAL among students
1. Podium leaderboard screenshots (especially “You” highlight + rank numbers)
2. Streak pulse badges + milestone celebration explosion cards
3. Bonus XP callouts (“ONLY X TASKS LEFT FOR BONUS XP” panels)

### C) Which UI patterns increase DAILY USAGE
1. Daily missions tabs (`Today / Upcoming / Done / Important`)
2. Always-visible XP progress bar / “WHAT’S UP, HERO?” hero header
3. Timetable day selector chips (game-like quick navigation)
4. State chips everywhere (URGENT, UP NEXT, COMPLETED, DANGER ZONE)

### D) What to REMOVE from cluttered student apps (to avoid failure conditions)
Remove/avoid:
1. Thin borders / subtle dividers
2. Muted/grey-heavy palettes
3. Flat minimalist panels
4. Generic SaaS dashboard layout hierarchy
5. Over-distribution of information without a clear mission/progression meaning

### E) How to make COLLEZ feel like a BILLION-DOLLAR product
1. Enforce a single comic composition language (thick ink + hard shadow + halftone + sticker chips).
2. Make spectacle functional (podiums and explosions are not decoration; they teach progression and status).
3. Ensure every screen answers: “What should I do next?” and “How am I winning?”

### F) Exact execution order (step-by-step)
1. Implement `PHASE 1` (Brand shell: Splash + Onboarding story beats + logo integration rules).
2. Implement `PHASE 2` (primitives: comic panels, physical buttons, chips/badges, nav, progress widgets).
3. Implement `PHASE 3` core academics:
   - Attendance
   - Timetable
   - Vault academic collectibles (Subjects + Notes/PDF grammar)
4. Implement `PHASE 5` productivity layer:
   - Tasks missions tabs + XP task cards + FAB
   - Planner/reminders using the same mission card family
5. Implement `PHASE 6` gamification surfaces:
   - Leaderboard tabs + podium + “You” highlight
   - Streak/XP visual widgets + milestone celebration panels
6. Implement `PHASE 4` social:
   - Discover search + filter chips + profile cards with Follow/Msg
7. Implement `PHASE 7` motion:
   - global press/lift/pulse/shimmer rules
8. Implement `PHASE 8` growth:
   - daily loop reinforcement + weekly ritual surfaces + milestone cadence
9. Lock `PHASE 9` handoff:
   - per-screen blueprint checklist and non-drift review criteria

---

## Reference Gaps (needs additional references to meet “ONLY source-of-truth” constraint)
When additional UI references are provided, these should be mapped precisely using the same process:
1. `Marketplace` screen(s)
2. `Lost & Found` screen(s)
3. `Events` screen(s) (if separate from trivia)
4. `Clubs` screen(s)
5. `Community` screen(s)
6. `Exams` screens and `Assignments` screens (separate from tasks)
7. `Fees`, `Transport`, and `Documents` screens

Until those references arrive, those areas must remain in “closest reference grammar” mode and must not claim exact layout matching.

