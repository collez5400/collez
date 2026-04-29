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
- Phase progress: **Phase 2 (Design System) complete**
- Completed (Phase 1): `ComicBrandShell` grammar, splash/login/onboarding rebuild, Step 1 comic illustration, Step 2 reusable podium primitives, and Step 3 reward explosion + floating XP prop tuning.
- Completed (Phase 2): reusable `ComicPanelCard`, `GradientButton` physical gloss behavior, `StickerChip` badge system, `ComicProgressBar` + `ComicProgressRing`, and navigation primitives (`TopAppBar`, `BottomNavBar`) rolled into onboarding + home + friends + rankings + vault surfaces.

Next phase to ship: **PHASE 3 — Core Screens (Academics)**

---

## PHASE 1 — Brand System
### 1) 🎯 Objective
Establish COLLEZ’s “comic universe” identity **exactly as shown in the references**: Space/Grotesk display typography, bold stroked hero titles, yellow/purple glow language, thick-ink borders, halftone + particle props, and hard offset shadows—so every subsequent screen inherits the same visual gravity (and cannot drift into “generic app UI”).

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
- Full-screen dark space base with ambient glow circles and halftone/particle overlay.
- Typography system (from references):
  - Display/Headlines: `Space Grotesk` (heavy, uppercase preferred, tight tracking).
  - Body: `Plus Jakarta Sans` (medium weight; never thin/minimal).
- Color anchors (from references’ Tailwind configs):
  - Background: `#161309`
  - Primary container (brand yellow): `#ffd400`
  - Secondary container (electric purple): `#6b03f1`
  - On-background text: `#eae2cf`
- “Ink + depth” measurements (seen across reference screens):
  - Borders: typically `3px–4px` solid near-black (`#000` / `#111111`).
  - Shadows: hard offset shadows like `2px/4px/6px/8px` in both x/y with **no blur** (e.g. `shadow-[6px_6px_0px_0px_#111111]`).
  - Press interaction: translate by the same magnitude and reduce/remove shadow (e.g. `active:translate-x-[4px] active:translate-y-[4px]` + smaller shadow or none).
- Splash:
  - central COLLEZ wordmark/branding
  - loading bar (striped/energy feel)
  - “brand promise” headline using display font + stroke/shadow treatment (reference uses text stroke + drop shadow).
- Onboarding is three story beats:
  1. Hero illustration inside a comic cutout panel + offset caption box
  2. Podium visual + progress indicators + “storyline” header
  3. Rewards explosion visual + floating XP props + big CTA
- Login/Signup framing:
  - “Access card” style panel: rotated slightly, thick border (`4px`) + hard shadow, uppercase labels, glossy rim buttons.

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
- None. Phase 1 implementation checklist is complete.

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
Define core primitives with **measurable** rules pulled directly from the reference HTML:

- **Global “ink + depth” rules (applies to all primitives)**
  - Border thickness: `3px` (most elements) or `4px` (hero/primary surfaces).
  - Border color: `#000` / `#111111` (no soft greys).
  - Shadow: hard offset, no blur; common offsets: `2px`, `4px`, `6px`, `8px`.
  - Press: move by `1px–6px` (matching the shadow magnitude) + shadow reduction/removal (the references repeatedly use this exact physicality).
  - Highlight rim: optional “glossy” top/left rim via a faint white border overlay (e.g. subtle `border-t`/`border-l` on top of the component).

- **Comic Panel Card (`ComicPanelCard`)**
  - Surface: purple container (`secondary-container`) or surface container variants, always with thick border and hard shadow.
  - Corner accent + subtle inner highlight (reference uses a faint top/left highlight overlay).
  - Layout usage: missions/task cards/profile cards/list rows all derive from this.

- **Physical Button (`GradientButton` / CTA buttons)**
  - Default: yellow `primary-container` CTA with `3–4px` border + `6px` hard shadow.
  - Interaction: active translate (e.g. `4px`) and shadow collapse.
  - Label style: uppercase, `Space Grotesk`, tracking-widest/strong tracking.
  - Gloss: “glossy rim” behavior consistent with login/signup reference buttons.

- **Sticker Chips / Badges (`StickerChip`)**
  - Shape: rounded-full “sticker” pills with `2–3px` border + small hard shadow.
  - Usage: XP chips, state badges (`URGENT`, `UP NEXT`, `COMPLETED`, `DANGER ZONE`), reward props.
  - Icon: filled style (references use Material Symbols with fill enabled).

- **Navigation (`TopAppBar`, `BottomNavBar`)**
  - Top bar: yellow-dominant header with thick bottom border + hard shadow; uppercase brand label; avatar “coin” element.
  - Bottom nav (mobile): tile-like icon+label tabs; active tab pops (yellow tile, border, shadow, slight lift).

- **Progress Widgets (`ComicProgressBar`, `ComicProgressRing`)**
  - Bar: stripe-energy fill with glow emphasis around yellow (`#ffd400`) and thick border container.
  - Ring: thick border ring inside status cards; used as “proof” element (rank/mission/attendance style).

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

### ✅ Phase 2 Completion Snapshot
Done:
- Card system: shared comic panel primitive with halftone + thick ink + corner accent (`ComicPanelCard`) is implemented and used on key surfaces.
- Button system: shared physical button behavior with chunky border, hard shadow, press translation, and glossy rim/highlight (`GradientButton`) is implemented.
- Chip/badge system: reusable sticker chip primitive (`StickerChip`) is implemented and used for XP/state badges across onboarding, leaderboard, and social/vault views.
- Progress widgets:
  - Stripe-energy horizontal progress primitive (`ComicProgressBar`) implemented and reused for onboarding and XP/task progress.
  - Circular progress primitive (`ComicProgressRing`) implemented and reused for ranking and mission completion widgets.
- Navigation:
  - Top bar updated to yellow-dominant comic framing with avatar/brand/XP chip.
  - Bottom nav updated to tile-like comic tabs with active yellow tile and heavy ink/shadow treatment.

Left:
- None in Phase 2 scope. Remaining work shifts to Phase 3+ feature-specific screen rebuilds.

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


HERE ARE ALL THE REFERENCES, MAKE THE CHANGES ACCORDINGLY ---
<!-- Onboarding 2 -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Onboarding - Screen 2</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&amp;family=Space+Grotesk:wght@300..700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 1;
        }
    </style>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#4d4632",
                        "surface-container-high": "#2e2a1e",
                        "on-tertiary-fixed-variant": "#474646",
                        "on-primary-fixed-variant": "#554500",
                        "on-surface": "#eae2cf",
                        "on-primary-fixed": "#231b00",
                        "on-surface-variant": "#d0c6ab",
                        "surface-container-lowest": "#110e05",
                        "surface-bright": "#3d392c",
                        "error": "#ffb4ab",
                        "primary-fixed-dim": "#ebc300",
                        "primary-fixed": "#ffe177",
                        "tertiary-fixed": "#e5e2e1",
                        "tertiary-container": "#dad7d6",
                        "on-primary": "#3b2f00",
                        "background": "#161309",
                        "on-tertiary-fixed": "#1c1b1b",
                        "outline": "#999077",
                        "on-secondary": "#3d0090",
                        "on-tertiary-container": "#5e5d5d",
                        "surface-variant": "#393428",
                        "surface-dim": "#161309",
                        "surface-container-highest": "#393428",
                        "secondary-container": "#6b03f1",
                        "on-secondary-fixed": "#24005b",
                        "primary": "#fff3d6",
                        "tertiary-fixed-dim": "#c8c6c5",
                        "error-container": "#93000a",
                        "inverse-primary": "#715d00",
                        "on-tertiary": "#313030",
                        "on-primary-container": "#705c00",
                        "on-secondary-container": "#d7c4ff",
                        "surface-container": "#231f14",
                        "surface-container-low": "#1f1b10",
                        "secondary": "#d1bcff",
                        "inverse-surface": "#eae2cf",
                        "secondary-fixed": "#eaddff",
                        "surface-tint": "#ebc300",
                        "on-error": "#690005",
                        "tertiary": "#f7f3f3",
                        "on-background": "#eae2cf",
                        "on-error-container": "#ffdad6",
                        "surface": "#161309",
                        "primary-container": "#ffd400",
                        "inverse-on-surface": "#343024",
                        "on-secondary-fixed-variant": "#5800c8",
                        "secondary-fixed-dim": "#d1bcff"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "unit": "8px",
                        "container-max": "1440px",
                        "gutter": "24px",
                        "margin-mobile": "20px",
                        "margin-desktop": "64px"
                    },
                    "fontFamily": {
                        "display-hero": ["Space Grotesk"],
                        "button-label": ["Space Grotesk"],
                        "body-lg": ["Plus Jakarta Sans"],
                        "body-md": ["Plus Jakarta Sans"],
                        "headline-lg": ["Space Grotesk"],
                        "headline-md": ["Space Grotesk"]
                    },
                    "fontSize": {
                        "display-hero": ["72px", { "lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "700" }],
                        "button-label": ["16px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700" }],
                        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "500" }],
                        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
                        "headline-lg": ["40px", { "lineHeight": "1.2", "fontWeight": "700" }],
                        "headline-md": ["24px", { "lineHeight": "1.2", "fontWeight": "700" }]
                    }
                }
            }
        }
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background min-h-screen flex flex-col font-body-md text-body-md text-on-background relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
<!-- Ambient Glow Background -->
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] max-w-[800px] max-h-[800px] bg-primary-container/20 rounded-full blur-[100px] z-0 pointer-events-none"></div>
<main class="flex-1 flex flex-col w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 relative z-10">
<!-- Progress Indicators -->
<div class="flex justify-center items-center gap-3 pt-4 mb-8">
<div class="w-12 h-2 rounded-full bg-surface-container-highest border border-[#000]"></div>
<div class="w-12 h-2 rounded-full bg-primary-container border-2 border-[#000] shadow-[2px_2px_0px_0px_#000]"></div>
<div class="w-12 h-2 rounded-full bg-surface-container-highest border border-[#000]"></div>
</div>
<!-- Central Visualization Canvas -->
<div class="flex-1 flex flex-col justify-center items-center relative py-12">
<!-- Podium Graphic (Neo-Comic Style) -->
<div class="flex items-end justify-center gap-4 md:gap-8 w-full max-w-md mx-auto h-[320px] relative">
<!-- Rank 2 (Left) -->
<div class="flex flex-col items-center z-10 translate-y-4">
<!-- Avatar -->
<div class="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-[#000] bg-surface-variant shadow-[4px_4px_0px_0px_#000] mb-[-16px] z-20 overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Portrait of a young confident woman with colorful dynamic lighting, neo-comic style halftone background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuANsPI04stmqa17vUdkKygDCftw2bFyxFg2GycVfoUIST08Fg_RrsjZ_W52MwGCxjo_c_cNcFwZyk_Wb_3pDrwTaznRH4vaf-bp99prH1Q99c0ZgaJGWAN4rSekxHWdtWhhFjspG8m-zRCnUfkrn6C182Jine182iPIKnrq_27BNF772wedVEYU2yqyWn_zL0ndkw4NlGSbUVm4Nj-ztPmk2DikENVMRqDQUAgfEY3rJxjtDmNLX-6S6mLyQ-DYLz4UdQ_4BD2ni84"/>
</div>
<!-- Score Chip -->
<div class="bg-surface-container-high border-[3px] border-[#000] rounded-full px-3 py-1 flex items-center justify-center gap-1 z-30 mb-2 shadow-[2px_2px_0px_0px_#000] -rotate-3">
<span class="material-symbols-outlined text-[14px] text-on-surface">local_fire_department</span>
<span class="font-button-label text-[12px] text-on-surface">850</span>
</div>
<!-- Block -->
<div class="w-20 md:w-24 h-[140px] bg-secondary-container border-[3px] border-[#000] shadow-[6px_6px_0px_0px_#000] rounded-t-xl flex justify-center pt-4 relative overflow-hidden">
<div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2)_0%,transparent_50%)]"></div>
<span class="font-display-hero text-headline-lg text-on-secondary-container mix-blend-overlay">2</span>
</div>
</div>
<!-- Rank 1 (Center) -->
<div class="flex flex-col items-center z-30">
<!-- Avatar -->
<div class="relative w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-[#000] bg-primary-container shadow-[6px_6px_0px_0px_#000] mb-[-20px] z-20 overflow-hidden ring-4 ring-primary-container/30 ring-offset-4 ring-offset-background">
<img class="w-full h-full object-cover" data-alt="Portrait of a young man smiling confidently, lit with vibrant neon yellow and purple lights, cyberpunk aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7tohADb8ROeyYIH8l4zCl4Ds15LoSgCKY2Gbfaq4D4m6q6GaS2LtLYdqS_EiX8-H7UoqfIIteKS9SYhS6N4sZHvo0fF3JQ5e42Wf8ZOhm6jT5o5b0fauqYLiROrbRsG6cEM8fAE1DYOeOQm8HtzINoWPzXXKMklKzXpCrsZUy4YXAs61qYp3JNkJU4MeXhgsSIbySJvi0okcZMlz8-e3CXHMGBLdDjztixWk7nKYP5S2rqbqfEZHRPAeNmkH1xmdkmT-1J7to2M0"/>
</div>
<!-- Score Chip (Premium) -->
<div class="bg-primary-container border-[3px] border-[#000] rounded-full px-4 py-1.5 flex items-center justify-center gap-1 z-30 mb-3 shadow-[4px_4px_0px_0px_#000] scale-110 rotate-2">
<span class="material-symbols-outlined text-[16px] text-on-primary-container">star</span>
<span class="font-button-label text-[14px] text-on-primary-container">1200</span>
</div>
<!-- Block -->
<div class="w-24 md:w-28 h-[200px] bg-primary border-[3px] border-[#000] shadow-[8px_8px_0px_0px_#000] rounded-t-xl flex justify-center pt-4 relative overflow-hidden">
<!-- Halftone/Highlight texture -->
<div class="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:4px_4px] opacity-20"></div>
<span class="font-display-hero text-display-hero text-on-primary drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">1</span>
</div>
</div>
<!-- Rank 3 (Right) -->
<div class="flex flex-col items-center z-10 translate-y-12">
<!-- Avatar -->
<div class="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-[#000] bg-surface-container-high shadow-[4px_4px_0px_0px_#000] mb-[-16px] z-20 overflow-hidden">
<img class="w-full h-full object-cover grayscale opacity-80" data-alt="Close up portrait of a girl with stylish sunglasses and vibrant contrasting lighting in a dark room" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7b1sGHbPSZ1KPS6cnBcWsg-35aRrMIWXE--xLGBfA3i35TOCiJxhhyv7PtKCE2dxR5v2s29qaig-5Xfi9pZibIUfljSEGCi6g6poAmH_sGf4tkAHWz5rtv8f5U4VyuIYB6AWuFt2lK6IiYjkES-Urv-F0cJI7oX4YcYV8IVLsEbqXT99R__R_Est6ua35WyDJXAQ4v3YkOw2ZoKWtI7a33WxPTXYtmd925k2_sQlrVooDZK0AR87ktAbRpkFyp8bTIyMk_IQuAeo"/>
</div>
<!-- Score Chip -->
<div class="bg-surface-container border-[3px] border-[#000] rounded-full px-3 py-1 flex items-center justify-center gap-1 z-30 mb-2 shadow-[2px_2px_0px_0px_#000] rotate-3">
<span class="material-symbols-outlined text-[14px] text-on-surface-variant">local_fire_department</span>
<span class="font-button-label text-[12px] text-on-surface-variant">600</span>
</div>
<!-- Block -->
<div class="w-20 md:w-24 h-[100px] bg-surface-container-highest border-[3px] border-[#000] shadow-[4px_4px_0px_0px_#000] rounded-t-xl flex justify-center pt-4 relative">
<span class="font-display-hero text-headline-md text-on-surface mix-blend-overlay">3</span>
</div>
</div>
</div>
</div>
<!-- Typography & Storytelling -->
<div class="text-center mb-10 flex flex-col items-center gap-4">
<h1 class="font-headline-lg text-headline-lg text-primary drop-shadow-[2px_2px_0px_#000] tracking-tight">
                Win with friends.
            </h1>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-sm">
                Dominate the leaderboard, earn exclusive badges, and prove who reigns supreme in your circle.
            </p>
</div>
<!-- Sticky CTA Area -->
<div class="mt-auto pt-4 pb-2 w-full max-w-md mx-auto">
<button class="w-full block text-center bg-primary-container text-on-primary-container font-button-label text-button-label py-5 px-6 border-[3px] border-[#000] shadow-[6px_6px_0px_0px_#000] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all duration-75 relative overflow-hidden group">
<!-- Glossy highlight -->
<div class="absolute top-0 left-0 w-full h-1/3 bg-white/20"></div>
<span class="relative z-10 tracking-widest">NEXT</span>
</button>
</div>
</main>
</body></html>

<!-- Splash Screen -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>COLLEZ - Splash Screen</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&amp;family=Space+Grotesk:wght@400;500;700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "outline-variant": "#4d4632",
                    "surface-container-high": "#2e2a1e",
                    "on-tertiary-fixed-variant": "#474646",
                    "on-primary-fixed-variant": "#554500",
                    "on-surface": "#eae2cf",
                    "on-primary-fixed": "#231b00",
                    "on-surface-variant": "#d0c6ab",
                    "surface-container-lowest": "#110e05",
                    "surface-bright": "#3d392c",
                    "error": "#ffb4ab",
                    "primary-fixed-dim": "#ebc300",
                    "primary-fixed": "#ffe177",
                    "tertiary-fixed": "#e5e2e1",
                    "tertiary-container": "#dad7d6",
                    "on-primary": "#3b2f00",
                    "background": "#161309",
                    "on-tertiary-fixed": "#1c1b1b",
                    "outline": "#999077",
                    "on-secondary": "#3d0090",
                    "on-tertiary-container": "#5e5d5d",
                    "surface-variant": "#393428",
                    "surface-dim": "#161309",
                    "surface-container-highest": "#393428",
                    "secondary-container": "#6b03f1",
                    "on-secondary-fixed": "#24005b",
                    "primary": "#fff3d6",
                    "tertiary-fixed-dim": "#c8c6c5",
                    "error-container": "#93000a",
                    "inverse-primary": "#715d00",
                    "on-tertiary": "#313030",
                    "on-primary-container": "#705c00",
                    "on-secondary-container": "#d7c4ff",
                    "surface-container": "#231f14",
                    "surface-container-low": "#1f1b10",
                    "secondary": "#d1bcff",
                    "inverse-surface": "#eae2cf",
                    "secondary-fixed": "#eaddff",
                    "surface-tint": "#ebc300",
                    "on-error": "#690005",
                    "tertiary": "#f7f3f3",
                    "on-background": "#eae2cf",
                    "on-error-container": "#ffdad6",
                    "surface": "#161309",
                    "primary-container": "#ffd400",
                    "inverse-on-surface": "#343024",
                    "on-secondary-fixed-variant": "#5800c8",
                    "secondary-fixed-dim": "#d1bcff"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "unit": "8px",
                    "container-max": "1440px",
                    "gutter": "24px",
                    "margin-mobile": "20px",
                    "margin-desktop": "64px"
            },
            "fontFamily": {
                    "display-hero": [
                            "Space Grotesk"
                    ],
                    "button-label": [
                            "Space Grotesk"
                    ],
                    "body-lg": [
                            "Plus Jakarta Sans"
                    ],
                    "body-md": [
                            "Plus Jakarta Sans"
                    ],
                    "headline-lg": [
                            "Space Grotesk"
                    ],
                    "headline-md": [
                            "Space Grotesk"
                    ]
            },
            "fontSize": {
                    "display-hero": [
                            "72px",
                            {
                                    "lineHeight": "1.1",
                                    "letterSpacing": "-0.04em",
                                    "fontWeight": "700"
                            }
                    ],
                    "button-label": [
                            "16px",
                            {
                                    "lineHeight": "1",
                                    "letterSpacing": "0.05em",
                                    "fontWeight": "700"
                            }
                    ],
                    "body-lg": [
                            "18px",
                            {
                                    "lineHeight": "1.6",
                                    "fontWeight": "500"
                            }
                    ],
                    "body-md": [
                            "16px",
                            {
                                    "lineHeight": "1.6",
                                    "fontWeight": "400"
                            }
                    ],
                    "headline-lg": [
                            "40px",
                            {
                                    "lineHeight": "1.2",
                                    "fontWeight": "700"
                            }
                    ],
                    "headline-md": [
                            "24px",
                            {
                                    "lineHeight": "1.2",
                                    "fontWeight": "700"
                            }
                    ]
            }
          },
        },
      }
    </script>
<style>
        .halftone-bg {
            background-image: radial-gradient(circle at center, rgba(107, 3, 241, 0.15) 2px, transparent 2px);
            background-size: 16px 16px;
        }
        .progress-stripe {
            background: linear-gradient(
                45deg,
                rgba(0, 0, 0, 0.1) 25%,
                transparent 25%,
                transparent 50%,
                rgba(0, 0, 0, 0.1) 50%,
                rgba(0, 0, 0, 0.1) 75%,
                transparent 75%,
                transparent
            );
            background-size: 16px 16px;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-body-md text-body-md halftone-bg">
<!-- Ambient Glow Effects -->
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-secondary-container rounded-full blur-[100px] opacity-40 mix-blend-screen pointer-events-none"></div>
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[300px] max-h-[300px] bg-primary-container rounded-full blur-[80px] opacity-30 mix-blend-screen pointer-events-none"></div>
<!-- Comic Particles (Static for prompt) -->
<div class="absolute inset-0 pointer-events-none">
<div class="absolute top-[20%] left-[15%] w-3 h-3 bg-primary-container rounded-full shadow-[2px_2px_0_#111111] border-2 border-[#111111]"></div>
<div class="absolute top-[30%] right-[20%] w-4 h-4 bg-secondary-container rounded-full shadow-[2px_2px_0_#111111] border-2 border-[#111111]"></div>
<div class="absolute bottom-[25%] left-[25%] w-2 h-2 bg-primary-container rounded-full shadow-[1px_1px_0_#111111] border border-[#111111]"></div>
<div class="absolute top-[60%] right-[10%] w-5 h-5 bg-secondary-container rounded-full shadow-[3px_3px_0_#111111] border-2 border-[#111111]"></div>
</div>
<!-- Main Content Container -->
<div class="relative z-10 flex flex-col items-center justify-center w-full max-w-container-max px-gutter">
<!-- Logo -->
<div class="relative mb-8">
<div class="absolute inset-0 bg-primary-container blur-[40px] opacity-50 rounded-full mix-blend-screen"></div>
<img alt="COLLEZ Logo" class="w-48 h-48 md:w-64 md:h-64 object-contain relative z-20 drop-shadow-[8px_8px_0_#111111]" data-alt="Bold, stylized 'COLLEZ' wordmark logo in a dynamic neo-comic style with thick black outlines, vibrant yellow and electric purple highlights, floating in dark space." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUwqsBSBMI3N8CzBTEstITdobk7jcU3sX_1iiwrAfSY21x45MshxVl9TxGCid7DpY-yMc_NBvMdtYFCvj0nEPTtrMQxDMdyvOfkfQBtDmMR1DzUQFSS7xJ1mfNbYEdUCuytUlfQPuWoyiVQuKH6n_fMrd3-fLHwz8zBJo_R89V6x3jMOIlNuLKpDdYvoByiWiSNPgvbrn7_glCgi9KuVc7Y9k1HWHcXhncXcrcv79IroC6cCjPaOXKtgTqS1jbXK9a3LAhvE7hyqY"/>
</div>
<!-- Headline -->
<h1 class="font-display-hero text-display-hero text-center text-primary mb-16 drop-shadow-[4px_4px_0_#6b03f1] uppercase" style="-webkit-text-stroke: 2px #111111;">
            LEVEL UP<br/>COLLEGE LIFE
        </h1>
<!-- Loading Bar -->
<div class="w-full max-w-md relative mt-8">
<!-- Decorative Border Box -->
<div class="w-full h-8 bg-surface-container-lowest border-[3px] border-[#111111] rounded-lg shadow-[4px_4px_0_#6b03f1] p-1 relative overflow-hidden">
<!-- Inner Progress -->
<div class="h-full bg-primary-container w-[70%] rounded-DEFAULT border-r-2 border-[#111111] progress-stripe shadow-[0_0_15px_#ffd400]">
<!-- Glossy Highlight -->
<div class="absolute top-0 left-0 right-0 h-[2px] bg-white/40 z-10"></div>
</div>
</div>
<!-- Loading Text -->
<div class="mt-4 text-center">
<span class="font-button-label text-button-label text-primary tracking-widest uppercase">Initializing...</span>
</div>
</div>
</div>
</body></html>

<!-- Login / Signup -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>COLLEZ - Login</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;900&amp;family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "outline-variant": "#4d4632",
                      "surface-container-high": "#2e2a1e",
                      "on-tertiary-fixed-variant": "#474646",
                      "on-primary-fixed-variant": "#554500",
                      "on-surface": "#eae2cf",
                      "on-primary-fixed": "#231b00",
                      "on-surface-variant": "#d0c6ab",
                      "surface-container-lowest": "#110e05",
                      "surface-bright": "#3d392c",
                      "error": "#ffb4ab",
                      "primary-fixed-dim": "#ebc300",
                      "primary-fixed": "#ffe177",
                      "tertiary-fixed": "#e5e2e1",
                      "tertiary-container": "#dad7d6",
                      "on-primary": "#3b2f00",
                      "background": "#161309",
                      "on-tertiary-fixed": "#1c1b1b",
                      "outline": "#999077",
                      "on-secondary": "#3d0090",
                      "on-tertiary-container": "#5e5d5d",
                      "surface-variant": "#393428",
                      "surface-dim": "#161309",
                      "surface-container-highest": "#393428",
                      "secondary-container": "#6b03f1",
                      "on-secondary-fixed": "#24005b",
                      "primary": "#fff3d6",
                      "tertiary-fixed-dim": "#c8c6c5",
                      "error-container": "#93000a",
                      "inverse-primary": "#715d00",
                      "on-tertiary": "#313030",
                      "on-primary-container": "#705c00",
                      "on-secondary-container": "#d7c4ff",
                      "surface-container": "#231f14",
                      "surface-container-low": "#1f1b10",
                      "secondary": "#d1bcff",
                      "inverse-surface": "#eae2cf",
                      "secondary-fixed": "#eaddff",
                      "surface-tint": "#ebc300",
                      "on-error": "#690005",
                      "tertiary": "#f7f3f3",
                      "on-background": "#eae2cf",
                      "on-error-container": "#ffdad6",
                      "surface": "#161309",
                      "primary-container": "#ffd400",
                      "inverse-on-surface": "#343024",
                      "on-secondary-fixed-variant": "#5800c8",
                      "secondary-fixed-dim": "#d1bcff"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "unit": "8px",
                      "container-max": "1440px",
                      "gutter": "24px",
                      "margin-mobile": "20px",
                      "margin-desktop": "64px"
              },
              "fontFamily": {
                      "display-hero": [
                              "Space Grotesk"
                      ],
                      "button-label": [
                              "Space Grotesk"
                      ],
                      "body-lg": [
                              "Plus Jakarta Sans"
                      ],
                      "body-md": [
                              "Plus Jakarta Sans"
                      ],
                      "headline-lg": [
                              "Space Grotesk"
                      ],
                      "headline-md": [
                              "Space Grotesk"
                      ]
              },
              "fontSize": {
                      "display-hero": [
                              "72px",
                              {
                                      "lineHeight": "1.1",
                                      "letterSpacing": "-0.04em",
                                      "fontWeight": "700"
                              }
                      ],
                      "button-label": [
                              "16px",
                              {
                                      "lineHeight": "1",
                                      "letterSpacing": "0.05em",
                                      "fontWeight": "700"
                              }
                      ],
                      "body-lg": [
                              "18px",
                              {
                                      "lineHeight": "1.6",
                                      "fontWeight": "500"
                              }
                      ],
                      "body-md": [
                              "16px",
                              {
                                      "lineHeight": "1.6",
                                      "fontWeight": "400"
                              }
                      ],
                      "headline-lg": [
                              "40px",
                              {
                                      "lineHeight": "1.2",
                                      "fontWeight": "700"
                              }
                      ],
                      "headline-md": [
                              "24px",
                              {
                                      "lineHeight": "1.2",
                                      "fontWeight": "700"
                              }
                      ]
              }
      },
          },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
        }
        
        /* Halftone pattern overlay */
        .bg-halftone {
            background-image: radial-gradient(circle, rgba(17, 14, 5, 0.4) 2px, transparent 2.5px);
            background-size: 10px 10px;
        }

        /* Glossy inner rim light */
        .glossy-rim {
            box-shadow: inset 0px 2px 0px 0px rgba(255,255,255,0.4);
        }
        
        /* Hard brutalist shadow for interactive elements */
        .hard-shadow {
            box-shadow: 4px 4px 0px 0px #110e05;
        }
        
        .hard-shadow-lg {
            box-shadow: 8px 8px 0px 0px #110e05;
        }

        /* Custom scrollbar for webkit */
        ::-webkit-scrollbar {
            width: 12px;
        }
        ::-webkit-scrollbar-track {
            background: #161309; 
        }
        ::-webkit-scrollbar-thumb {
            background: #393428; 
            border: 2px solid #110e05;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background min-h-screen flex items-center justify-center p-gutter relative overflow-hidden font-body-md text-body-md selection:bg-primary-container selection:text-on-primary-container">
<!-- Ambient background glow -->
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary-container/20 rounded-full blur-[120px] pointer-events-none"></div>
<!-- Student ID Card Container -->
<main class="relative w-full max-w-[420px] bg-secondary-container rounded-xl border-[4px] border-surface-container-lowest hard-shadow-lg overflow-hidden transform rotate-[-1deg] transition-transform hover:rotate-0 duration-300 z-10 flex flex-col">
<!-- Halftone Texture Overlay -->
<div class="absolute inset-0 bg-halftone pointer-events-none mix-blend-overlay"></div>
<!-- Card Header / Lanyard Area -->
<div class="relative w-full pt-8 pb-4 flex flex-col items-center border-b-[4px] border-surface-container-lowest bg-secondary-container z-20">
<!-- Lanyard Hole -->
<div class="w-16 h-3 rounded-full border-[3px] border-surface-container-lowest bg-background hard-shadow absolute top-4"></div>
<div class="mt-4 flex flex-col items-center">
<div class="w-20 h-20 rounded-full border-[4px] border-surface-container-lowest hard-shadow bg-surface overflow-hidden mb-4 p-1">
<img alt="Collez Logo" class="w-full h-full object-cover rounded-full bg-background" data-alt="Small collegiate brand logo with bold typography and mascot in vibrant colors" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdnk2JN1C57laN2pwatgtIOgPbR9Zc9DwgnVpNsTtRGE8FdDKR0UhNQM3YouLpAiynZtlRSZPnsEUwaMnIxFcYSGD5HCob_KXYBqWwX_2kvh1_QUo2BT9PN1UEsA_qjcRkj8stUgkBGulbjAojYPX1W0aaoy-9FKtxtj633R_R80tfeSVNAqlNW1iW35y2p7bMB8eIDmVe2s5ZllNbdoieXnqGWHOKlETKrbbfKP-fSh0MxJ4iWZAGnBN14ZKasFLsqBnkqs12458"/>
</div>
<h1 class="font-headline-lg text-headline-lg text-on-secondary-container uppercase text-center leading-none tracking-tight">
                    COLLEZ<br/>
<span class="font-headline-md text-headline-md text-on-secondary-container/80 tracking-widest">ACCESS CARD</span>
</h1>
</div>
</div>
<!-- Card Body / Login Actions -->
<div class="relative p-6 flex flex-col gap-4 z-20 bg-secondary-container">
<p class="font-body-md text-body-md text-on-secondary-container/90 text-center mb-2 font-bold uppercase tracking-wider">
                Authenticate Identity
            </p>
<!-- Login Options -->
<button class="w-full h-14 bg-surface text-on-surface border-[3px] border-surface-container-lowest rounded-lg flex items-center justify-center gap-3 font-button-label text-button-label uppercase glossy-rim hard-shadow active:translate-y-1 active:shadow-none transition-all">
<span class="material-symbols-outlined" data-icon="account_circle">account_circle</span>
                Continue with Google
            </button>
<button class="w-full h-14 bg-surface text-on-surface border-[3px] border-surface-container-lowest rounded-lg flex items-center justify-center gap-3 font-button-label text-button-label uppercase glossy-rim hard-shadow active:translate-y-1 active:shadow-none transition-all">
<span class="material-symbols-outlined" data-icon="devices">devices</span>
                Continue with Apple
            </button>
<button class="w-full h-14 bg-surface text-on-surface border-[3px] border-surface-container-lowest rounded-lg flex items-center justify-center gap-3 font-button-label text-button-label uppercase glossy-rim hard-shadow active:translate-y-1 active:shadow-none transition-all">
<span class="material-symbols-outlined" data-icon="mail">mail</span>
                Continue with Email
            </button>
<button class="w-full h-14 bg-tertiary-container text-on-tertiary-container border-[3px] border-surface-container-lowest rounded-lg flex items-center justify-center gap-3 font-button-label text-button-label uppercase glossy-rim hard-shadow active:translate-y-1 active:shadow-none transition-all mt-2">
<span class="material-symbols-outlined" data-icon="badge">badge</span>
                Use College ID
            </button>
<!-- Barcode Decoration -->
<div class="flex justify-center items-end gap-1 h-12 mt-4 opacity-60 mix-blend-multiply">
<div class="w-1 h-full bg-surface-container-lowest"></div>
<div class="w-2 h-full bg-surface-container-lowest"></div>
<div class="w-1 h-4/5 bg-surface-container-lowest"></div>
<div class="w-3 h-full bg-surface-container-lowest"></div>
<div class="w-1 h-full bg-surface-container-lowest"></div>
<div class="w-1 h-3/5 bg-surface-container-lowest"></div>
<div class="w-2 h-full bg-surface-container-lowest"></div>
<div class="w-1 h-full bg-surface-container-lowest"></div>
<div class="w-4 h-full bg-surface-container-lowest"></div>
<div class="w-1 h-4/5 bg-surface-container-lowest"></div>
<div class="w-2 h-full bg-surface-container-lowest"></div>
<div class="w-1 h-full bg-surface-container-lowest"></div>
</div>
</div>
<!-- Bottom Action Area -->
<div class="relative p-6 pt-0 z-20">
<!-- Primary CTA -->
<button class="w-full py-5 bg-primary-container text-on-primary-container border-[4px] border-surface-container-lowest rounded-lg flex items-center justify-center gap-2 font-headline-md text-headline-md uppercase glossy-rim hard-shadow-lg active:translate-y-2 active:shadow-none transition-all overflow-hidden relative group">
<!-- Inner moving gradient for extra energy -->
<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                ENTER COLLEZ
                <span class="material-symbols-outlined text-[32px]" data-icon="arrow_forward" data-weight="fill" style="font-variation-settings: 'FILL' 1;">arrow_forward</span>
</button>
</div>
</main>
</body></html>

<!-- Tasks Screen -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>COLLEZ - Tasks</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;family=Space+Grotesk:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#4d4632",
                        "surface-container-high": "#2e2a1e",
                        "on-tertiary-fixed-variant": "#474646",
                        "on-primary-fixed-variant": "#554500",
                        "on-surface": "#eae2cf",
                        "on-primary-fixed": "#231b00",
                        "on-surface-variant": "#d0c6ab",
                        "surface-container-lowest": "#110e05",
                        "surface-bright": "#3d392c",
                        "error": "#ffb4ab",
                        "primary-fixed-dim": "#ebc300",
                        "primary-fixed": "#ffe177",
                        "tertiary-fixed": "#e5e2e1",
                        "tertiary-container": "#dad7d6",
                        "on-primary": "#3b2f00",
                        "background": "#161309",
                        "on-tertiary-fixed": "#1c1b1b",
                        "outline": "#999077",
                        "on-secondary": "#3d0090",
                        "on-tertiary-container": "#5e5d5d",
                        "surface-variant": "#393428",
                        "surface-dim": "#161309",
                        "surface-container-highest": "#393428",
                        "secondary-container": "#6b03f1",
                        "on-secondary-fixed": "#24005b",
                        "primary": "#fff3d6",
                        "tertiary-fixed-dim": "#c8c6c5",
                        "error-container": "#93000a",
                        "inverse-primary": "#715d00",
                        "on-tertiary": "#313030",
                        "on-primary-container": "#705c00",
                        "on-secondary-container": "#d7c4ff",
                        "surface-container": "#231f14",
                        "surface-container-low": "#1f1b10",
                        "secondary": "#d1bcff",
                        "inverse-surface": "#eae2cf",
                        "secondary-fixed": "#eaddff",
                        "surface-tint": "#ebc300",
                        "on-error": "#690005",
                        "tertiary": "#f7f3f3",
                        "on-background": "#eae2cf",
                        "on-error-container": "#ffdad6",
                        "surface": "#161309",
                        "primary-container": "#ffd400",
                        "inverse-on-surface": "#343024",
                        "on-secondary-fixed-variant": "#5800c8",
                        "secondary-fixed-dim": "#d1bcff"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "unit": "8px",
                        "container-max": "1440px",
                        "gutter": "24px",
                        "margin-mobile": "20px",
                        "margin-desktop": "64px"
                    },
                    "fontFamily": {
                        "display-hero": ["Space Grotesk"],
                        "button-label": ["Space Grotesk"],
                        "body-lg": ["Plus Jakarta Sans"],
                        "body-md": ["Plus Jakarta Sans"],
                        "headline-lg": ["Space Grotesk"],
                        "headline-md": ["Space Grotesk"]
                    },
                    "fontSize": {
                        "display-hero": ["72px", { "lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "700" }],
                        "button-label": ["16px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700" }],
                        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "500" }],
                        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
                        "headline-lg": ["40px", { "lineHeight": "1.2", "fontWeight": "700" }],
                        "headline-md": ["24px", { "lineHeight": "1.2", "fontWeight": "700" }]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .icon-fill {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        
        /* Comic book halftone dot effect subtle overlay */
        .halftone-bg {
            background-image: radial-gradient(rgba(255, 212, 0, 0.1) 2px, transparent 2px), radial-gradient(rgba(107, 3, 241, 0.1) 2px, transparent 2px);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
        }

        /* Diagonal stripes for progress/activity */
        .stripe-bg {
            background-image: repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 10px,
                rgba(0,0,0,0.1) 10px,
                rgba(0,0,0,0.1) 20px
            );
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background min-h-screen relative pb-24 pt-24 font-body-md halftone-bg">
<!-- TopAppBar (Shared Component JSON Mapping) -->
<header class="fixed w-full top-0 border-b-[4px] border-[#111111] z-40 bg-yellow-400 dark:bg-yellow-500 text-black dark:text-black font-['Space_Grotesk'] font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center px-6 h-20 transition-all">
<div class="flex items-center gap-3">
<div class="w-10 h-10 bg-[#111111] rounded-full border-2 border-white flex items-center justify-center text-yellow-400 text-xl overflow-hidden">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="Close up portrait of a young student with colorful glasses and bright background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQrKaQLjKA7CeR3aeIEUpNWJh6znokZCdD2TpFe-RlyaVTaZJKruaUJZsyXiFxqONKDAoem8uJsw5E43_-F0gD79u9r0SYbYC3m4lGOpigBQWKKH6cYhcMnCa4Ft1ulvd4mXyfff6XGmsMBvB1n0S4kyHu2a3ycWRzzkP-e6rgTxoLUxWt7KNScv83iwrxAP1t6ge-noraPxGgMaA8b0FTdBy5pTJYVJeupWKcfJVZX_COfvS2qfo3x32buvE8sE9N9JvzUTcCLzo"/>
</div>
<h1 class="text-2xl font-black italic text-black uppercase">COLLEZ</h1>
</div>
<div class="hidden md:flex gap-6 items-center">
<a class="text-black/70 hover:bg-white/20 px-3 py-2 rounded-md transition-all" href="#">HOME</a>
<a class="text-black bg-white/20 px-3 py-2 rounded-md transition-all" href="#">TASKS</a>
<a class="text-black/70 hover:bg-white/20 px-3 py-2 rounded-md transition-all" href="#">VAULT</a>
</div>
<button class="flex items-center gap-2 bg-[#111111] text-yellow-400 px-4 py-2 rounded-full border-2 border-[#111111] shadow-[2px_2px_0px_0px_#ffffff] active:translate-y-1 active:shadow-none transition-all hover:bg-white/20">
<span class="font-button-label text-button-label uppercase">2500 XP</span>
<span class="material-symbols-outlined icon-fill" data-icon="local_fire_department">local_fire_department</span>
</button>
</header>
<!-- Main Content -->
<main class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
<!-- Header & Tabs -->
<div class="mb-8">
<div class="flex justify-between items-end mb-6">
<div>
<h2 class="font-headline-lg text-headline-lg text-primary-container drop-shadow-[4px_4px_0_#111111] tracking-tight uppercase">Missions</h2>
<p class="font-body-lg text-body-lg text-on-surface-variant mt-2">Crush these to rank up.</p>
</div>
</div>
<!-- Tabs -->
<div class="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
<button class="flex-shrink-0 bg-primary-container text-[#111111] border-[3px] border-[#111111] rounded-full px-6 py-2 font-button-label text-button-label uppercase shadow-[4px_4px_0px_0px_#111111] active:translate-y-1 active:shadow-none transition-all">
                    Today
                </button>
<button class="flex-shrink-0 bg-surface-container-high text-on-surface border-[3px] border-[#111111] rounded-full px-6 py-2 font-button-label text-button-label uppercase shadow-[4px_4px_0px_0px_#111111] hover:bg-surface-variant active:translate-y-1 active:shadow-none transition-all">
                    Upcoming
                </button>
<button class="flex-shrink-0 bg-surface-container-high text-on-surface border-[3px] border-[#111111] rounded-full px-6 py-2 font-button-label text-button-label uppercase shadow-[4px_4px_0px_0px_#111111] hover:bg-surface-variant active:translate-y-1 active:shadow-none transition-all">
                    Done
                </button>
<button class="flex-shrink-0 bg-surface-container-high text-on-surface border-[3px] border-[#111111] rounded-full px-6 py-2 font-button-label text-button-label uppercase shadow-[4px_4px_0px_0px_#111111] hover:bg-surface-variant active:translate-y-1 active:shadow-none transition-all">
                    Important
                </button>
</div>
</div>
<!-- Task List (Today) -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
<!-- Task Card 1: High Priority -->
<div class="relative bg-secondary-container border-[4px] border-[#111111] rounded-xl p-5 shadow-[6px_6px_0px_0px_#ffd400] transition-transform hover:-translate-y-1 flex flex-col justify-between min-h-[180px]">
<!-- Inner Highlight -->
<div class="absolute top-0 left-0 w-full h-full border-t-2 border-l-2 border-white/20 rounded-xl pointer-events-none"></div>
<div class="flex justify-between items-start mb-4 relative z-10">
<button class="w-8 h-8 rounded border-[3px] border-[#111111] bg-surface flex items-center justify-center text-on-surface hover:bg-primary-container hover:text-[#111111] transition-colors group">
<span class="material-symbols-outlined text-xl group-hover:scale-110 transition-transform" data-icon="shield">shield</span>
</button>
<div class="bg-error text-[#111111] font-button-label text-[12px] uppercase px-3 py-1 rounded-full border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                        URGENT
                    </div>
</div>
<div class="relative z-10">
<h3 class="font-headline-md text-headline-md text-white drop-shadow-[2px_2px_0_#111111] leading-tight mb-2">Complete Calculus Assignment</h3>
<div class="flex items-center justify-between mt-4">
<span class="font-body-md text-body-md text-white/90 font-bold bg-[#111111]/30 px-2 py-1 rounded">Due 11:59 PM</span>
<span class="font-button-label text-button-label text-primary-container drop-shadow-[1px_1px_0_#111111]">+500 XP</span>
</div>
</div>
</div>
<!-- Task Card 2: Normal -->
<div class="relative bg-surface-container-high border-[4px] border-[#111111] rounded-xl p-5 shadow-[6px_6px_0px_0px_#6b03f1] transition-transform hover:-translate-y-1 flex flex-col justify-between min-h-[180px]">
<div class="absolute top-0 left-0 w-full h-full border-t-2 border-l-2 border-white/10 rounded-xl pointer-events-none"></div>
<div class="flex justify-between items-start mb-4 relative z-10">
<button class="w-8 h-8 rounded border-[3px] border-[#111111] bg-surface flex items-center justify-center text-on-surface hover:bg-primary-container hover:text-[#111111] transition-colors group">
<span class="material-symbols-outlined text-xl group-hover:scale-110 transition-transform" data-icon="shield">shield</span>
</button>
<div class="bg-primary-fixed text-[#111111] font-button-label text-[12px] uppercase px-3 py-1 rounded-full border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                        STUDY
                    </div>
</div>
<div class="relative z-10">
<h3 class="font-headline-md text-[20px] font-bold text-on-surface leading-tight mb-2">Read Chapter 4: Neo-Brutalism</h3>
<div class="flex items-center justify-between mt-4">
<span class="font-body-md text-body-md text-on-surface-variant font-bold bg-[#111111] px-2 py-1 rounded">2 Hours</span>
<span class="font-button-label text-button-label text-secondary drop-shadow-[1px_1px_0_#111111]">+150 XP</span>
</div>
</div>
</div>
</div>
</main>
<!-- Floating Action Button -->
<button class="fixed bottom-24 right-6 md:right-12 w-16 h-16 bg-primary-container text-[#111111] rounded-full border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex items-center justify-center hover:scale-105 active:translate-y-2 active:shadow-none transition-all z-30 group">
<span class="material-symbols-outlined text-3xl font-bold group-hover:rotate-90 transition-transform duration-300" data-icon="add">add</span>
<div class="absolute inset-0 rounded-full border-t-2 border-l-2 border-white/40 pointer-events-none"></div>
</button>
<!-- BottomNavBar (Shared Component JSON Mapping) - Hidden on desktop -->
<nav class="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 py-3 bg-white dark:bg-zinc-900 border-t-[4px] border-[#111111] shadow-[0_-4px_0px_0px_rgba(0,0,0,1)] z-50">
<a class="flex flex-col items-center p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined text-2xl mb-1" data-icon="home">home</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">HOME</span>
</a>
<a class="flex flex-col items-center p-2 bg-yellow-400 text-black border-2 border-black rounded-lg scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform duration-100 ease-in-out relative -top-2" href="#">
<span class="material-symbols-outlined text-2xl mb-1 icon-fill" data-icon="checklist">checklist</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">TASKS</span>
</a>
<a class="flex flex-col items-center p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined text-2xl mb-1" data-icon="inventory_2">inventory_2</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">VAULT</span>
</a>
<a class="flex flex-col items-center p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined text-2xl mb-1" data-icon="leaderboard">leaderboard</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">RANK</span>
</a>
<a class="flex flex-col items-center p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined text-2xl mb-1" data-icon="person">person</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">PROFILE</span>
</a>
</nav>
</body></html>

<!-- Onboarding 1 -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Onboarding - Campus Heroes</title>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Google Fonts: Space Grotesk & Plus Jakarta Sans -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500&amp;family=Space+Grotesk:wght@700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#4d4632",
                        "surface-container-high": "#2e2a1e",
                        "on-tertiary-fixed-variant": "#474646",
                        "on-primary-fixed-variant": "#554500",
                        "on-surface": "#eae2cf",
                        "on-primary-fixed": "#231b00",
                        "on-surface-variant": "#d0c6ab",
                        "surface-container-lowest": "#110e05",
                        "surface-bright": "#3d392c",
                        "error": "#ffb4ab",
                        "primary-fixed-dim": "#ebc300",
                        "primary-fixed": "#ffe177",
                        "tertiary-fixed": "#e5e2e1",
                        "tertiary-container": "#dad7d6",
                        "on-primary": "#3b2f00",
                        "background": "#161309",
                        "on-tertiary-fixed": "#1c1b1b",
                        "outline": "#999077",
                        "on-secondary": "#3d0090",
                        "on-tertiary-container": "#5e5d5d",
                        "surface-variant": "#393428",
                        "surface-dim": "#161309",
                        "surface-container-highest": "#393428",
                        "secondary-container": "#6b03f1",
                        "on-secondary-fixed": "#24005b",
                        "primary": "#fff3d6",
                        "tertiary-fixed-dim": "#c8c6c5",
                        "error-container": "#93000a",
                        "inverse-primary": "#715d00",
                        "on-tertiary": "#313030",
                        "on-primary-container": "#705c00",
                        "on-secondary-container": "#d7c4ff",
                        "surface-container": "#231f14",
                        "surface-container-low": "#1f1b10",
                        "secondary": "#d1bcff",
                        "inverse-surface": "#eae2cf",
                        "secondary-fixed": "#eaddff",
                        "surface-tint": "#ebc300",
                        "on-error": "#690005",
                        "tertiary": "#f7f3f3",
                        "on-background": "#eae2cf",
                        "on-error-container": "#ffdad6",
                        "surface": "#161309",
                        "primary-container": "#ffd400",
                        "inverse-on-surface": "#343024",
                        "on-secondary-fixed-variant": "#5800c8",
                        "secondary-fixed-dim": "#d1bcff"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "unit": "8px",
                        "container-max": "1440px",
                        "gutter": "24px",
                        "margin-mobile": "20px",
                        "margin-desktop": "64px"
                    },
                    "fontFamily": {
                        "display-hero": ["Space Grotesk"],
                        "button-label": ["Space Grotesk"],
                        "body-lg": ["Plus Jakarta Sans"],
                        "body-md": ["Plus Jakarta Sans"],
                        "headline-lg": ["Space Grotesk"],
                        "headline-md": ["Space Grotesk"]
                    },
                    "fontSize": {
                        "display-hero": ["72px", { "lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "700" }],
                        "button-label": ["16px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700" }],
                        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "500" }],
                        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
                        "headline-lg": ["40px", { "lineHeight": "1.2", "fontWeight": "700" }],
                        "headline-md": ["24px", { "lineHeight": "1.2", "fontWeight": "700" }]
                    }
                }
            }
        }
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background h-screen w-full flex flex-col relative overflow-hidden font-body-md text-body-md text-on-background selection:bg-primary-container selection:text-on-primary-container">
<!-- Simulated Halftone Texture Background -->
<div class="absolute inset-0 z-0 pointer-events-none" style="background-image: radial-gradient(#d7c4ff 1px, transparent 1px); background-size: 8px 8px; opacity: 0.15;">
</div>
<!-- Comic Energy Radial Glow -->
<div class="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_30%,_rgba(107,3,241,0.25)_0%,_rgba(22,19,9,1)_75%)]"></div>
<!-- Main Canvas Area (Navigation Suppressed for Onboarding Intent) -->
<main class="flex-grow flex flex-col items-center justify-center px-6 pt-8 pb-[140px] z-10 relative">
<!-- Hero Illustration Panel (Comic Book Cutout Style) -->
<div class="w-full max-w-sm aspect-[3/4] bg-surface-container border-[4px] border-[#111111] rounded-2xl shadow-[8px_8px_0px_0px_#111111] overflow-hidden relative -rotate-2 mb-10 transform origin-bottom">
<!-- Background Texture inside panel -->
<div class="absolute inset-0 bg-secondary-container/20 mix-blend-overlay z-10 pointer-events-none"></div>
<img class="w-full h-full object-cover grayscale contrast-125 mix-blend-luminosity opacity-90" data-alt="Graphic novel style low-angle shot of heroic student silhouettes striding confidently across a university campus, backlit by dramatic electric purple and cyan energy bursts against a deep black night sky" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkWWYIwiryFLjkZfw-lbzodAgkAuFWo2MzSczI8XZb5u-bKK6T1tqB66Ye8W-dNSE7eXykTLRSIpCmKDdsv0RZYOGmvsMgP-WBtLIJN0zXAWeVs5Qc7o3flfotAFoqg3Dv0cyInhwEQ3l-dBwcyriisvp5V_H9VTyk_srVOk61VEmyptTfI5ufmI86nKcqcfDP-foTtFMyMbUMuseycDBgxesIE63E5Ojhrc1-W9no8n5frtezhk3ZuwqdF9rfdfFHqKwMxhK5SzM"/>
<!-- Inner Vignette/Shadow -->
<div class="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent z-20 opacity-80 pointer-events-none"></div>
</div>
<!-- Headline Caption Box -->
<div class="relative z-20 rotate-1 max-w-[300px]">
<!-- Decorative offset backing for text -->
<div class="absolute inset-0 bg-surface-tint border-[4px] border-[#111111] rounded-xl translate-x-2 translate-y-2 pointer-events-none"></div>
<div class="relative bg-surface px-6 py-4 border-[4px] border-[#111111] rounded-xl flex items-center justify-center text-center">
<h1 class="font-headline-lg text-headline-lg text-surface-tint uppercase drop-shadow-[0_2px_0_#111111]">
                    Everything college.<br/>One app.
                </h1>
</div>
</div>
</main>
<!-- Fixed Bottom CTA Area -->
<div class="fixed bottom-0 left-0 w-full px-6 pb-10 pt-16 z-50 bg-gradient-to-t from-background via-background/90 to-transparent flex justify-center pointer-events-none">
<!-- Interactive Button Wrapper (pointer-events-auto restores interaction over the gradient block) -->
<div class="w-full max-w-sm pointer-events-auto relative group cursor-pointer">
<!-- Neon Glow Effect -->
<div class="absolute inset-0 bg-primary-container blur-xl opacity-30 rounded-full group-hover:opacity-50 transition-opacity duration-300"></div>
<!-- Physical Button Body -->
<button class="relative w-full py-5 px-6 bg-primary-container border-[4px] border-[#111111] rounded-2xl shadow-[6px_6px_0px_0px_#111111] flex items-center justify-center gap-3 overflow-hidden transform transition-transform active:translate-y-[4px] active:translate-x-[4px] active:shadow-[2px_2px_0px_0px_#111111]">
<!-- Glossy Skeuomorphic Highlight (Top Rim) -->
<div class="absolute inset-0 border-t-[3px] border-white/60 rounded-2xl pointer-events-none"></div>
<!-- Glossy Skeuomorphic Highlight (Left Rim) -->
<div class="absolute inset-0 border-l-[2px] border-white/40 rounded-2xl pointer-events-none"></div>
<span class="font-button-label text-button-label text-on-primary-container uppercase tracking-widest z-10">NEXT</span>
<span class="material-symbols-outlined text-on-primary-container font-black text-[28px] z-10" style="font-variation-settings: 'FILL' 1;">
                    arrow_forward
                </span>
</button>
</div>
</div>
</body></html>

<!-- Onboarding 3 -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Onboarding - Rewards</title>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&amp;family=Plus+Jakarta+Sans:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Theme Configuration -->
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "outline-variant": "#4d4632",
                    "surface-container-high": "#2e2a1e",
                    "on-tertiary-fixed-variant": "#474646",
                    "on-primary-fixed-variant": "#554500",
                    "on-surface": "#eae2cf",
                    "on-primary-fixed": "#231b00",
                    "on-surface-variant": "#d0c6ab",
                    "surface-container-lowest": "#110e05",
                    "surface-bright": "#3d392c",
                    "error": "#ffb4ab",
                    "primary-fixed-dim": "#ebc300",
                    "primary-fixed": "#ffe177",
                    "tertiary-fixed": "#e5e2e1",
                    "tertiary-container": "#dad7d6",
                    "on-primary": "#3b2f00",
                    "background": "#161309",
                    "on-tertiary-fixed": "#1c1b1b",
                    "outline": "#999077",
                    "on-secondary": "#3d0090",
                    "on-tertiary-container": "#5e5d5d",
                    "surface-variant": "#393428",
                    "surface-dim": "#161309",
                    "surface-container-highest": "#393428",
                    "secondary-container": "#6b03f1",
                    "on-secondary-fixed": "#24005b",
                    "primary": "#fff3d6",
                    "tertiary-fixed-dim": "#c8c6c5",
                    "error-container": "#93000a",
                    "inverse-primary": "#715d00",
                    "on-tertiary": "#313030",
                    "on-primary-container": "#705c00",
                    "on-secondary-container": "#d7c4ff",
                    "surface-container": "#231f14",
                    "surface-container-low": "#1f1b10",
                    "secondary": "#d1bcff",
                    "inverse-surface": "#eae2cf",
                    "secondary-fixed": "#eaddff",
                    "surface-tint": "#ebc300",
                    "on-error": "#690005",
                    "tertiary": "#f7f3f3",
                    "on-background": "#eae2cf",
                    "on-error-container": "#ffdad6",
                    "surface": "#161309",
                    "primary-container": "#ffd400",
                    "inverse-on-surface": "#343024",
                    "on-secondary-fixed-variant": "#5800c8",
                    "secondary-fixed-dim": "#d1bcff"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "unit": "8px",
                    "container-max": "1440px",
                    "gutter": "24px",
                    "margin-mobile": "20px",
                    "margin-desktop": "64px"
            },
            "fontFamily": {
                    "display-hero": [
                            "Space Grotesk"
                    ],
                    "button-label": [
                            "Space Grotesk"
                    ],
                    "body-lg": [
                            "Plus Jakarta Sans"
                    ],
                    "body-md": [
                            "Plus Jakarta Sans"
                    ],
                    "headline-lg": [
                            "Space Grotesk"
                    ],
                    "headline-md": [
                            "Space Grotesk"
                    ]
            },
            "fontSize": {
                    "display-hero": [
                            "72px",
                            {
                                    "lineHeight": "1.1",
                                    "letterSpacing": "-0.04em",
                                    "fontWeight": "700"
                            }
                    ],
                    "button-label": [
                            "16px",
                            {
                                    "lineHeight": "1",
                                    "letterSpacing": "0.05em",
                                    "fontWeight": "700"
                            }
                    ],
                    "body-lg": [
                            "18px",
                            {
                                    "lineHeight": "1.6",
                                    "fontWeight": "500"
                            }
                    ],
                    "body-md": [
                            "16px",
                            {
                                    "lineHeight": "1.6",
                                    "fontWeight": "400"
                            }
                    ],
                    "headline-lg": [
                            "40px",
                            {
                                    "lineHeight": "1.2",
                                    "fontWeight": "700"
                            }
                    ],
                    "headline-md": [
                            "24px",
                            {
                                    "lineHeight": "1.2",
                                    "fontWeight": "700"
                            }
                    ]
            }
          }
        }
      }
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background min-h-screen w-full flex flex-col overflow-hidden relative selection:bg-primary-container selection:text-on-primary-container">
<!-- Halftone / Comic Burst Background Effect -->
<div class="absolute inset-0 z-0 opacity-10 pointer-events-none" style="background-image: repeating-conic-gradient(from 0deg, var(--tw-colors-background) 0deg 10deg, var(--tw-colors-secondary-container) 10deg 20deg);"></div>
<!-- Main Canvas -->
<main class="relative z-10 flex-1 flex flex-col justify-center items-center p-8 max-w-container-max mx-auto w-full h-full">
<!-- Floating Particles (Neo-Comic Style) -->
<div class="absolute top-[15%] left-[10%] w-16 h-16 bg-primary-container border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_#111111] -rotate-12 z-20">
<span class="material-symbols-outlined text-black font-bold text-3xl" style="font-variation-settings: 'FILL' 1;">monetization_on</span>
</div>
<div class="absolute top-[25%] right-[10%] w-12 h-12 bg-error border-[3px] border-black rounded-lg flex items-center justify-center shadow-[4px_4px_0px_0px_#111111] rotate-12 z-20">
<span class="material-symbols-outlined text-black font-bold text-2xl" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
</div>
<div class="absolute bottom-[35%] left-[5%] w-14 h-14 bg-secondary border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_#111111] rotate-45 z-20">
<span class="material-symbols-outlined text-black font-bold text-2xl" style="font-variation-settings: 'FILL' 1;">star</span>
</div>
<div class="absolute bottom-[40%] right-[8%] px-4 py-2 bg-surface-tint border-[3px] border-black rounded-full shadow-[4px_4px_0px_0px_#111111] -rotate-6 z-20">
<span class="font-button-label text-button-label text-black uppercase">+500 XP</span>
</div>
<!-- Central Exploding Visual -->
<div class="relative w-full max-w-sm aspect-square mb-12 flex items-center justify-center z-10">
<!-- Decorative Backing Shape -->
<div class="absolute inset-4 bg-secondary-container rounded-[2rem] border-[4px] border-black -z-10 rotate-6 shadow-[8px_8px_0px_0px_#111111]"></div>
<!-- Main Image Container -->
<div class="w-full h-full rounded-3xl border-[4px] border-black overflow-hidden shadow-[4px_4px_0px_0px_#111111] relative bg-surface-container -rotate-3 group">
<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
<img alt="Rewards Explosion" class="w-full h-full object-cover object-center scale-110 group-hover:scale-125 transition-transform duration-700 ease-out mix-blend-lighten" data-alt="Vibrant pop-art illustration of a glowing purple treasure chest bursting open, erupting with shiny gold coins, glowing diamonds, and neon star badges, dynamic comic book action lines radiating outwards against a dark gritty background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbtcyfwbQTcIP7Tn2LiFDF23-vLCkTS8cLB4ZLbubAAwsSwSnesPzGluirdJmN04isW1-Zovxjm9z8Ig2rQpEujLU3JA1BRG92i8-s97WC3ZIrLCD97lLzVppi9A17pLUyvrUpJ4GMNn56UtRQpmQidBXHF9kcaBnUfqSeUdA3w9YfuluGGrC674GBcfsAaqOZfSLMTybGmVgJ3qs0MQQkAQO55H3MewbntcKGOv4721jzQtrIsVM9vz6omvVAGG-UFBVju87E-os"/>
</div>
</div>
<!-- Typography Section -->
<div class="text-center z-10 mb-16 flex flex-col gap-6 items-center">
<h1 class="font-display-hero text-display-hero text-primary uppercase drop-shadow-[4px_4px_0px_#111111] leading-none -skew-x-3">
                Stay<br/>Consistent.
            </h1>
<div class="bg-primary-container border-[3px] border-black px-6 py-3 shadow-[6px_6px_0px_0px_#111111] rotate-2 inline-block">
<h2 class="font-headline-md text-headline-md text-black uppercase tracking-tight">
                    Get rewarded.
                </h2>
</div>
</div>
<!-- Call to Action -->
<div class="w-full max-w-xs mt-auto pb-12 z-20">
<button class="w-full relative block text-center bg-secondary-container text-on-secondary-container font-button-label text-button-label py-5 px-8 rounded-xl border-[4px] border-black shadow-[6px_6px_0px_0px_#111111] hover:shadow-[8px_8px_0px_0px_#111111] hover:-translate-y-1 active:translate-y-2 active:shadow-none transition-all duration-150 uppercase tracking-widest overflow-hidden group">
<!-- Glossy Rim Light -->
<div class="absolute top-0 left-0 w-full h-2 bg-white/30 rounded-t-lg pointer-events-none group-active:opacity-0 transition-opacity"></div>
<!-- Button Text -->
<span class="relative z-10 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)] text-white">START NOW</span>
<!-- Inner Glow -->
<div class="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] pointer-events-none group-active:shadow-none"></div>
</button>
</div>
</main>
</body></html>

<!-- Home Dashboard -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Home Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&amp;family=Space+Grotesk:wght@400;500;700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style type="text/tailwindcss">
    @layer utilities {
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .icon-fill {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .brutal-border {
            border: 3px solid #111111;
        }
        .brutal-shadow {
            box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
        }
        .brutal-shadow-lg {
            box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
        }
        .brutal-shadow-yellow {
            box-shadow: 4px 4px 0px 0px #ffd400;
        }
        .brutal-shadow-purple {
            box-shadow: 4px 4px 0px 0px #d1bcff;
        }
        .neon-glow-yellow {
            box-shadow: 0 0 40px rgba(255, 212, 0, 0.4);
        }
        .halftone-bg {
            background-image: radial-gradient(circle, #393428 2px, transparent 2px);
            background-size: 10px 10px;
        }
        .progress-stripe {
            background-image: repeating-linear-gradient(
                -45deg,
                rgba(0,0,0,0.1),
                rgba(0,0,0,0.1) 10px,
                transparent 10px,
                transparent 20px
            );
        }
        .comic-bg {
            background-image: radial-gradient(#d1bcff 1px, transparent 1px);
            background-size: 8px 8px;
        }
    }
</style>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        "colors": {
                "outline-variant": "#4d4632",
                "surface-container-high": "#2e2a1e",
                "on-tertiary-fixed-variant": "#474646",
                "on-primary-fixed-variant": "#554500",
                "on-surface": "#eae2cf",
                "on-primary-fixed": "#231b00",
                "on-surface-variant": "#d0c6ab",
                "surface-container-lowest": "#110e05",
                "surface-bright": "#3d392c",
                "error": "#ffb4ab",
                "primary-fixed-dim": "#ebc300",
                "primary-fixed": "#ffe177",
                "tertiary-fixed": "#e5e2e1",
                "tertiary-container": "#dad7d6",
                "on-primary": "#3b2f00",
                "background": "#161309",
                "on-tertiary-fixed": "#1c1b1b",
                "outline": "#999077",
                "on-secondary": "#3d0090",
                "on-tertiary-container": "#5e5d5d",
                "surface-variant": "#393428",
                "surface-dim": "#161309",
                "surface-container-highest": "#393428",
                "secondary-container": "#6b03f1",
                "on-secondary-fixed": "#24005b",
                "primary": "#fff3d6",
                "tertiary-fixed-dim": "#c8c6c5",
                "error-container": "#93000a",
                "inverse-primary": "#715d00",
                "on-tertiary": "#313030",
                "on-primary-container": "#705c00",
                "on-secondary-container": "#d7c4ff",
                "surface-container": "#231f14",
                "surface-container-low": "#1f1b10",
                "secondary": "#d1bcff",
                "inverse-surface": "#eae2cf",
                "secondary-fixed": "#eaddff",
                "surface-tint": "#ebc300",
                "on-error": "#690005",
                "tertiary": "#f7f3f3",
                "on-background": "#eae2cf",
                "on-error-container": "#ffdad6",
                "surface": "#161309",
                "primary-container": "#ffd400",
                "inverse-on-surface": "#343024",
                "on-secondary-fixed-variant": "#5800c8",
                "secondary-fixed-dim": "#d1bcff"
        },
        "borderRadius": {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
        },
        "spacing": {
                "unit": "8px",
                "container-max": "1440px",
                "gutter": "24px",
                "margin-mobile": "20px",
                "margin-desktop": "64px"
        },
        "fontFamily": {
                "display-hero": [
                        "Space Grotesk"
                ],
                "button-label": [
                        "Space Grotesk"
                ],
                "body-lg": [
                        "Plus Jakarta Sans"
                ],
                "body-md": [
                        "Plus Jakarta Sans"
                ],
                "headline-lg": [
                        "Space Grotesk"
                ],
                "headline-md": [
                        "Space Grotesk"
                ]
        },
        "fontSize": {
                "display-hero": [
                        "72px",
                        {
                                "lineHeight": "1.1",
                                "letterSpacing": "-0.04em",
                                "fontWeight": "700"
                        }
                ],
                "button-label": [
                        "16px",
                        {
                                "lineHeight": "1",
                                "letterSpacing": "0.05em",
                                "fontWeight": "700"
                        }
                ],
                "body-lg": [
                        "18px",
                        {
                                "lineHeight": "1.6",
                                "fontWeight": "500"
                        }
                ],
                "body-md": [
                        "16px",
                        {
                                "lineHeight": "1.6",
                                "fontWeight": "400"
                        }
                ],
                "headline-lg": [
                        "40px",
                        {
                                "lineHeight": "1.2",
                                "fontWeight": "700"
                        }
                ],
                "headline-md": [
                        "24px",
                        {
                                "lineHeight": "1.2",
                                "fontWeight": "700"
                        }
                ]
        }
},
    },
  }
</script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background min-h-screen pb-24 flex flex-col font-body-md overflow-x-hidden">
<!-- TopAppBar -->
<header class="bg-yellow-400 dark:bg-yellow-500 docked full-width top-0 border-b-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center w-full px-6 h-20 sticky z-40">
<div class="flex items-center gap-4">
<img alt="Avatar" class="w-12 h-12 rounded-full border-2 border-black" data-alt="Portrait of a young person smiling softly with warm lighting, close up, shallow depth of field" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfvoMyX4LhwH72PuO8kZCyzMjqwsNjiIb4zUqKeLg8Tjsf8tzMNrwYzTcSlRyAjKsMFisy--umxlKQi0hD1IEtp2mgNtuD8_-vQmwHLppL7mMDIMy_XIZIRsF45pV4IPYa7Qllul3lpOHu9cSzoHkEQdDB2tXfiY9kB1yrV1-r-azkxFC0RhNMKSyrUYiPFNS3OG2ECFQ7C9RvjwZdjjvWm5fxqP8xDgTLS8wgR00c1CxChNDK3sheJF3Ew5nwNy7L9_Ua2y3YIEY"/>
<h1 class="text-black dark:text-black font-['Space_Grotesk'] font-black uppercase tracking-tighter text-2xl italic">COLLEZ</h1>
</div>
<div class="flex items-center gap-4 text-black">
<span class="font-button-label text-button-label">2500 XP</span>
<span class="material-symbols-outlined icon-fill text-3xl">local_fire_department</span>
<span class="material-symbols-outlined text-3xl cursor-pointer hover:bg-white/20 p-2 rounded-full transition-all">notifications</span>
</div>
</header>
<main class="flex-grow p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-8 md:gap-12">
<!-- Hero Section: Daily XP -->
<section class="bg-surface-container-high rounded-xl brutal-border brutal-shadow-purple p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden halftone-bg">
<div class="absolute -right-10 -top-10 text-primary-container/10">
<span class="material-symbols-outlined text-[200px] icon-fill transform rotate-12">bolt</span>
</div>
<div>
<h2 class="font-headline-lg text-headline-lg text-primary uppercase mb-2">WHAT'S UP, HERO?</h2>
<p class="font-body-lg text-body-lg text-on-surface-variant">Level 12 • 450 XP to Next Level</p>
</div>
<div class="w-full bg-surface-container-lowest h-6 md:h-8 rounded-full brutal-border overflow-hidden relative">
<div class="h-full bg-primary-container w-[75%] progress-stripe transition-all duration-1000 ease-out relative shadow-[0_0_20px_#ffd400]">
<div class="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-[2px]"></div>
</div>
</div>
</section>
<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-gutter">
<!-- Left Column (Missions & Motivation) -->
<div class="md:col-span-8 flex flex-col gap-8">
<!-- Motivation Banner -->
<div class="bg-secondary p-4 md:p-6 rounded-lg brutal-border brutal-shadow flex items-center gap-4 comic-bg relative overflow-hidden">
<div class="bg-white brutal-border p-3 rounded-xl absolute -left-2 top-2 transform -rotate-12">
<span class="material-symbols-outlined text-black icon-fill text-3xl">star</span>
</div>
<div class="pl-12 z-10">
<p class="font-headline-md text-headline-md text-black uppercase leading-tight">ONLY 2 TASKS LEFT FOR BONUS XP</p>
</div>
</div>
<!-- Today's Missions -->
<section class="flex flex-col gap-4">
<h3 class="font-headline-md text-headline-md text-primary uppercase flex items-center gap-2">
<span class="material-symbols-outlined icon-fill">swords</span> Today's Missions
                </h3>
<div class="grid grid-cols-1 gap-4">
<!-- Task Card 1 -->
<div class="bg-surface-variant p-4 md:p-5 rounded-lg brutal-border brutal-shadow flex items-center justify-between group hover:-translate-y-1 transition-transform cursor-pointer">
<div class="flex items-center gap-4">
<div class="w-8 h-8 rounded border-2 border-black bg-background flex items-center justify-center group-active:bg-primary-container transition-colors">
<!-- check icon hidden initially -->
</div>
<div>
<h4 class="font-button-label text-button-label text-on-surface uppercase">Attend Data Structures</h4>
<p class="font-body-md text-body-md text-on-surface-variant text-sm">Room 402 • 10:00 AM</p>
</div>
</div>
<div class="bg-primary-container text-black font-button-label text-button-label px-3 py-1 rounded-full brutal-border text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            +50 XP
                        </div>
</div>
<!-- Task Card 2 -->
<div class="bg-surface-variant p-4 md:p-5 rounded-lg brutal-border brutal-shadow flex items-center justify-between group hover:-translate-y-1 transition-transform cursor-pointer">
<div class="flex items-center gap-4">
<div class="w-8 h-8 rounded border-2 border-black bg-background flex items-center justify-center group-active:bg-primary-container transition-colors">
</div>
<div>
<h4 class="font-button-label text-button-label text-on-surface uppercase">Submit Physics Lab</h4>
<p class="font-body-md text-body-md text-on-surface-variant text-sm">Due today 11:59 PM</p>
</div>
</div>
<div class="bg-primary-container text-black font-button-label text-button-label px-3 py-1 rounded-full brutal-border text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            +100 XP
                        </div>
</div>
</div>
</section>
<!-- Upcoming Classes (Horizontal Scroll) -->
<section class="flex flex-col gap-4">
<h3 class="font-headline-md text-headline-md text-primary uppercase flex items-center gap-2">
<span class="material-symbols-outlined icon-fill">school</span> Upcoming
                </h3>
<div class="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar">
<div class="min-w-[240px] bg-secondary-container p-5 rounded-lg brutal-border brutal-shadow-yellow snap-start flex flex-col gap-3 relative overflow-hidden">
<div class="absolute -right-4 -bottom-4 opacity-20">
<span class="material-symbols-outlined text-[100px] icon-fill text-white">functions</span>
</div>
<div class="bg-black/20 w-fit px-2 py-1 rounded text-xs font-bold uppercase text-white tracking-wider">In 30 mins</div>
<h4 class="font-headline-md text-headline-md text-white">Calculus II</h4>
<p class="font-body-md text-body-md text-white/80">Prof. Smith • Hall B</p>
</div>
<div class="min-w-[240px] bg-surface-bright p-5 rounded-lg brutal-border brutal-shadow snap-start flex flex-col gap-3 relative overflow-hidden">
<div class="absolute -right-4 -bottom-4 opacity-10">
<span class="material-symbols-outlined text-[100px] icon-fill text-white">science</span>
</div>
<div class="bg-black/40 w-fit px-2 py-1 rounded text-xs font-bold uppercase text-white tracking-wider">2:00 PM</div>
<h4 class="font-headline-md text-headline-md text-on-surface">Chem Lab</h4>
<p class="font-body-md text-body-md text-on-surface-variant">Building C</p>
</div>
</div>
</section>
</div>
<!-- Right Column (Stats & Actions) -->
<div class="md:col-span-4 flex flex-col gap-8">
<!-- Stats Grid -->
<div class="grid grid-cols-2 md:grid-cols-1 gap-4">
<!-- Streak Card -->
<div class="bg-surface-variant rounded-xl brutal-border brutal-shadow p-5 flex flex-col items-center justify-center text-center gap-2">
<div class="w-16 h-16 bg-error-container rounded-full flex items-center justify-center brutal-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative">
<span class="material-symbols-outlined icon-fill text-error text-3xl">local_fire_department</span>
<div class="absolute -top-2 -right-2 bg-primary-container w-6 h-6 rounded-full brutal-border flex items-center justify-center text-[10px] font-bold text-black animate-pulse">!</div>
</div>
<h4 class="font-headline-md text-headline-md text-on-surface">12 DAYS</h4>
<p class="font-button-label text-button-label text-error uppercase text-sm">Active Streak</p>
</div>
<!-- Attendance Card -->
<div class="bg-surface-variant rounded-xl brutal-border brutal-shadow p-5 flex flex-col items-center justify-center text-center gap-3">
<!-- Faux Circular Progress -->
<div class="relative w-20 h-20">
<svg class="w-full h-full transform -rotate-90" viewbox="0 0 100 100">
<circle class="brutal-border" cx="50" cy="50" fill="none" r="40" stroke="#111111" stroke-width="8"></circle>
<circle cx="50" cy="50" fill="none" r="40" stroke="#ffd400" stroke-dasharray="251" stroke-dashoffset="37" stroke-linecap="round" stroke-width="8"></circle>
</svg>
<div class="absolute inset-0 flex items-center justify-center">
<span class="font-button-label text-button-label text-on-surface">85%</span>
</div>
</div>
<p class="font-button-label text-button-label text-primary uppercase text-sm">Attendance</p>
</div>
</div>
<!-- Quick Actions -->
<div class="flex flex-col gap-3 mt-auto md:mt-0">
<button class="bg-secondary-container hover:bg-secondary transition-colors text-white hover:text-black py-4 px-6 rounded-lg brutal-border brutal-shadow-yellow font-button-label text-button-label uppercase flex items-center justify-center gap-2 active:translate-y-1 active:shadow-none">
<span class="material-symbols-outlined">add_task</span> Add Task
                </button>
<button class="bg-surface-bright hover:bg-surface-variant transition-colors text-on-surface py-4 px-6 rounded-lg brutal-border brutal-shadow font-button-label text-button-label uppercase flex items-center justify-center gap-2 active:translate-y-1 active:shadow-none">
<span class="material-symbols-outlined">upload_file</span> Upload PDF
                </button>
</div>
</div>
</div>
</main>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 py-3 bg-white dark:bg-zinc-900 border-t-4 border-black z-50 shadow-[0_-4px_0px_0px_rgba(0,0,0,1)] md:hidden">
<!-- HOME (Active) -->
<a class="flex flex-col items-center gap-1 p-2 bg-yellow-400 text-black border-2 border-black rounded-lg scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform duration-100 ease-in-out active:scale-95 min-w-[64px]" href="#">
<span class="material-symbols-outlined icon-fill">home</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">HOME</span>
</a>
<!-- TASKS -->
<a class="flex flex-col items-center gap-1 p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-transform duration-100 ease-in-out active:scale-95 min-w-[64px]" href="#">
<span class="material-symbols-outlined">checklist</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">TASKS</span>
</a>
<!-- VAULT -->
<a class="flex flex-col items-center gap-1 p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-transform duration-100 ease-in-out active:scale-95 min-w-[64px]" href="#">
<span class="material-symbols-outlined">inventory_2</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">VAULT</span>
</a>
<!-- RANK -->
<a class="flex flex-col items-center gap-1 p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-transform duration-100 ease-in-out active:scale-95 min-w-[64px]" href="#">
<span class="material-symbols-outlined">leaderboard</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">RANK</span>
</a>
<!-- PROFILE -->
<a class="flex flex-col items-center gap-1 p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-transform duration-100 ease-in-out active:scale-95 min-w-[64px]" href="#">
<span class="material-symbols-outlined">person</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">PROFILE</span>
</a>
</nav>
<style>
    /* Hide scrollbar for horizontal scrolling area but keep functionality */
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
</style>
</body></html>

<!-- Notes / Vault -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Collez - Vault</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&amp;family=Space+Grotesk:wght@400;700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#4d4632",
                        "surface-container-high": "#2e2a1e",
                        "on-tertiary-fixed-variant": "#474646",
                        "on-primary-fixed-variant": "#554500",
                        "on-surface": "#eae2cf",
                        "on-primary-fixed": "#231b00",
                        "on-surface-variant": "#d0c6ab",
                        "surface-container-lowest": "#110e05",
                        "surface-bright": "#3d392c",
                        "error": "#ffb4ab",
                        "primary-fixed-dim": "#ebc300",
                        "primary-fixed": "#ffe177",
                        "tertiary-fixed": "#e5e2e1",
                        "tertiary-container": "#dad7d6",
                        "on-primary": "#3b2f00",
                        "background": "#161309",
                        "on-tertiary-fixed": "#1c1b1b",
                        "outline": "#999077",
                        "on-secondary": "#3d0090",
                        "on-tertiary-container": "#5e5d5d",
                        "surface-variant": "#393428",
                        "surface-dim": "#161309",
                        "surface-container-highest": "#393428",
                        "secondary-container": "#6b03f1",
                        "on-secondary-fixed": "#24005b",
                        "primary": "#fff3d6",
                        "tertiary-fixed-dim": "#c8c6c5",
                        "error-container": "#93000a",
                        "inverse-primary": "#715d00",
                        "on-tertiary": "#313030",
                        "on-primary-container": "#705c00",
                        "on-secondary-container": "#d7c4ff",
                        "surface-container": "#231f14",
                        "surface-container-low": "#1f1b10",
                        "secondary": "#d1bcff",
                        "inverse-surface": "#eae2cf",
                        "secondary-fixed": "#eaddff",
                        "surface-tint": "#ebc300",
                        "on-error": "#690005",
                        "tertiary": "#f7f3f3",
                        "on-background": "#eae2cf",
                        "on-error-container": "#ffdad6",
                        "surface": "#161309",
                        "primary-container": "#ffd400",
                        "inverse-on-surface": "#343024",
                        "on-secondary-fixed-variant": "#5800c8",
                        "secondary-fixed-dim": "#d1bcff"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "unit": "8px",
                        "container-max": "1440px",
                        "gutter": "24px",
                        "margin-mobile": "20px",
                        "margin-desktop": "64px"
                    },
                    "fontFamily": {
                        "display-hero": ["Space Grotesk"],
                        "button-label": ["Space Grotesk"],
                        "body-lg": ["Plus Jakarta Sans"],
                        "body-md": ["Plus Jakarta Sans"],
                        "headline-lg": ["Space Grotesk"],
                        "headline-md": ["Space Grotesk"]
                    },
                    "fontSize": {
                        "display-hero": ["72px", { "lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "700" }],
                        "button-label": ["16px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700" }],
                        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "500" }],
                        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
                        "headline-lg": ["40px", { "lineHeight": "1.2", "fontWeight": "700" }],
                        "headline-md": ["24px", { "lineHeight": "1.2", "fontWeight": "700" }]
                    }
                }
            }
        }
    </script>
<style>
        .halftone-bg {
            background-image: radial-gradient(circle, rgba(0,0,0,0.15) 2px, transparent 2.5px);
            background-size: 10px 10px;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background font-body-md antialiased min-h-screen relative pb-32">
<!-- TopAppBar -->
<header class="bg-yellow-400 dark:bg-yellow-500 font-['Space_Grotesk'] font-black uppercase tracking-tighter docked full-width sticky top-0 z-40 border-b-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center w-full px-6 h-20 text-black dark:text-black">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-white shrink-0">
<img alt="User Avatar" class="w-full h-full object-cover" data-alt="close up portrait of a young woman with natural makeup looking confident" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjUXo6O9NAULwUCHsBl4Ob0BuYCTAjAZ-p655qi-MUsrhVf-fc6P7zflhyiI6sh6quXdcUz1dGSu3-j6ZxHH3uKXbuvrc38rE1W0yyBKVS5HPWBMFhVkoSirlzGlAWVZGLKgfPs7Ax0tmqpeIDzsEdBkEmNgWUWOZB0TrP-4dFsgtwqs0gs0h2lclmvIr5ME3FuVRTVs8ZC6WpBd1qhqOAQjEdzFSoF7T_AQfquGAbz_TgztUKdqkA0KmypLO94HS6hZOPbnU803U"/>
</div>
<span class="text-2xl font-black italic text-black uppercase">COLLEZ</span>
</div>
<div class="flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
<span class="font-button-label text-button-label text-black">2500 XP</span>
<span class="material-symbols-outlined text-error" data-icon="local_fire_department" data-weight="fill" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
</div>
</header>
<!-- Main Canvas -->
<main class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-gutter">
<!-- Header & Quick Actions -->
<div class="mb-10">
<h1 class="font-headline-lg text-headline-lg text-on-surface mb-6">VAULT</h1>
<div class="flex overflow-x-auto pb-4 gap-4 hide-scrollbar snap-x">
<button class="snap-start shrink-0 bg-primary-container text-on-primary-container border-[3px] border-surface-container-lowest rounded-full px-6 py-3 font-button-label text-button-label uppercase shadow-[4px_4px_0px_0px_#110e05] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2">
<span class="material-symbols-outlined" data-icon="description">description</span>
                    Notes
                </button>
<button class="snap-start shrink-0 bg-surface-container-high text-on-surface border-[3px] border-surface-container-lowest rounded-full px-6 py-3 font-button-label text-button-label uppercase shadow-[4px_4px_0px_0px_#110e05] hover:bg-surface-variant active:translate-y-1 active:shadow-none transition-all flex items-center gap-2">
<span class="material-symbols-outlined" data-icon="picture_as_pdf">picture_as_pdf</span>
                    PDFs
                </button>
<button class="snap-start shrink-0 bg-surface-container-high text-on-surface border-[3px] border-surface-container-lowest rounded-full px-6 py-3 font-button-label text-button-label uppercase shadow-[4px_4px_0px_0px_#110e05] hover:bg-surface-variant active:translate-y-1 active:shadow-none transition-all flex items-center gap-2">
<span class="material-symbols-outlined" data-icon="mic">mic</span>
                    Voice Notes
                </button>
<button class="snap-start shrink-0 bg-surface-container-high text-on-surface border-[3px] border-surface-container-lowest rounded-full px-6 py-3 font-button-label text-button-label uppercase shadow-[4px_4px_0px_0px_#110e05] hover:bg-surface-variant active:translate-y-1 active:shadow-none transition-all flex items-center gap-2">
<span class="material-symbols-outlined" data-icon="folder">folder</span>
                    Subjects
                </button>
</div>
</div>
<!-- Subjects Grid (Collectible Cards) -->
<section class="mb-12">
<h2 class="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-3">
<span class="material-symbols-outlined text-primary-container" data-icon="category" data-weight="fill" style="font-variation-settings: 'FILL' 1;">category</span>
                SUBJECTS
            </h2>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<!-- CS Card (Yellow/Primary) -->
<div class="relative bg-primary-container border-[3px] border-surface-container-lowest rounded-xl p-6 shadow-[6px_6px_0px_0px_#110e05] overflow-hidden group hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#110e05] transition-all cursor-pointer">
<div class="absolute inset-0 halftone-bg opacity-30"></div>
<div class="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
<div class="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
<div class="flex justify-between items-start">
<div class="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center border-2 border-surface-container-lowest shadow-[2px_2px_0px_0px_#eae2cf]">
<span class="material-symbols-outlined text-primary-container text-3xl" data-icon="terminal">terminal</span>
</div>
<span class="bg-surface-container-lowest text-primary-container font-button-label text-button-label px-3 py-1 rounded-full text-sm border-2 border-surface-container-lowest shadow-[2px_2px_0px_0px_#eae2cf]">42 ITEMS</span>
</div>
<div class="mt-8">
<h3 class="font-headline-md text-headline-md text-on-primary-container">Comp Sci</h3>
<p class="font-body-md text-body-md text-on-primary-container/80 mt-1 font-bold">Algorithms &amp; Data</p>
</div>
</div>
</div>
<!-- Physics Card (Purple/Secondary) -->
<div class="relative bg-secondary-container border-[3px] border-surface-container-lowest rounded-xl p-6 shadow-[6px_6px_0px_0px_#110e05] overflow-hidden group hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#110e05] transition-all cursor-pointer">
<div class="absolute inset-0 halftone-bg opacity-30"></div>
<div class="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
<div class="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
<div class="flex justify-between items-start">
<div class="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center border-2 border-surface-container-lowest shadow-[2px_2px_0px_0px_#eae2cf]">
<span class="material-symbols-outlined text-secondary-container text-3xl" data-icon="rocket_launch">rocket_launch</span>
</div>
<span class="bg-surface-container-lowest text-secondary-container font-button-label text-button-label px-3 py-1 rounded-full text-sm border-2 border-surface-container-lowest shadow-[2px_2px_0px_0px_#eae2cf]">18 ITEMS</span>
</div>
<div class="mt-8">
<h3 class="font-headline-md text-headline-md text-on-secondary-container">Physics</h3>
<p class="font-body-md text-body-md text-on-secondary-container/80 mt-1 font-bold">Quantum Mechanics</p>
</div>
</div>
</div>
<!-- Math Card (Tertiary mapped) -->
<div class="relative bg-tertiary-container border-[3px] border-surface-container-lowest rounded-xl p-6 shadow-[6px_6px_0px_0px_#110e05] overflow-hidden group hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#110e05] transition-all cursor-pointer">
<div class="absolute inset-0 halftone-bg opacity-20"></div>
<div class="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
<div class="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
<div class="flex justify-between items-start">
<div class="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center border-2 border-surface-container-lowest shadow-[2px_2px_0px_0px_#eae2cf]">
<span class="material-symbols-outlined text-tertiary-container text-3xl" data-icon="calculate">calculate</span>
</div>
<span class="bg-surface-container-lowest text-tertiary-container font-button-label text-button-label px-3 py-1 rounded-full text-sm border-2 border-surface-container-lowest shadow-[2px_2px_0px_0px_#eae2cf]">34 ITEMS</span>
</div>
<div class="mt-8">
<h3 class="font-headline-md text-headline-md text-on-tertiary-container">Calculus II</h3>
<p class="font-body-md text-body-md text-on-tertiary-container/80 mt-1 font-bold">Integration &amp; Series</p>
</div>
</div>
</div>
<!-- Chemistry Card (Error mapped) -->
<div class="relative bg-error-container border-[3px] border-surface-container-lowest rounded-xl p-6 shadow-[6px_6px_0px_0px_#110e05] overflow-hidden group hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#110e05] transition-all cursor-pointer">
<div class="absolute inset-0 halftone-bg opacity-30"></div>
<div class="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
<div class="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
<div class="flex justify-between items-start">
<div class="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center border-2 border-surface-container-lowest shadow-[2px_2px_0px_0px_#eae2cf]">
<span class="material-symbols-outlined text-error-container text-3xl" data-icon="science">science</span>
</div>
<span class="bg-surface-container-lowest text-error-container font-button-label text-button-label px-3 py-1 rounded-full text-sm border-2 border-surface-container-lowest shadow-[2px_2px_0px_0px_#eae2cf]">27 ITEMS</span>
</div>
<div class="mt-8">
<h3 class="font-headline-md text-headline-md text-on-error-container">Chemistry</h3>
<p class="font-body-md text-body-md text-on-error-container/80 mt-1 font-bold">Organic Reactions</p>
</div>
</div>
</div>
</div>
</section>
<!-- Recent Files -->
<section>
<h2 class="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-3">
<span class="material-symbols-outlined text-secondary" data-icon="history" data-weight="fill" style="font-variation-settings: 'FILL' 1;">history</span>
                RECENT ACTIVITY
            </h2>
<div class="flex flex-col gap-4">
<!-- List Item 1 -->
<div class="bg-surface-container border-[3px] border-surface-container-lowest rounded-xl p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_#110e05] hover:bg-surface-container-high transition-colors cursor-pointer group">
<div class="flex items-center gap-4">
<div class="w-12 h-12 bg-primary-container border-2 border-surface-container-lowest rounded-lg flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-on-primary-container" data-icon="picture_as_pdf">picture_as_pdf</span>
</div>
<div>
<h4 class="font-body-lg text-body-lg text-on-surface font-bold group-hover:text-primary transition-colors">Midterm_Study_Guide_Final.pdf</h4>
<p class="font-body-md text-body-md text-on-surface-variant text-sm">Comp Sci • Added 2 hours ago</p>
</div>
</div>
<button class="w-10 h-10 border-2 border-surface-container-lowest rounded-full flex items-center justify-center hover:bg-surface-variant active:translate-y-1 transition-all">
<span class="material-symbols-outlined text-on-surface" data-icon="more_vert">more_vert</span>
</button>
</div>
<!-- List Item 2 -->
<div class="bg-surface-container border-[3px] border-surface-container-lowest rounded-xl p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_#110e05] hover:bg-surface-container-high transition-colors cursor-pointer group">
<div class="flex items-center gap-4">
<div class="w-12 h-12 bg-secondary-container border-2 border-surface-container-lowest rounded-lg flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-on-secondary-container" data-icon="mic">mic</span>
</div>
<div>
<h4 class="font-body-lg text-body-lg text-on-surface font-bold group-hover:text-secondary transition-colors">Lecture 14 - Thermodynamics</h4>
<p class="font-body-md text-body-md text-on-surface-variant text-sm">Physics • 45:20 • Added yesterday</p>
</div>
</div>
<button class="w-10 h-10 border-2 border-surface-container-lowest rounded-full flex items-center justify-center hover:bg-surface-variant active:translate-y-1 transition-all">
<span class="material-symbols-outlined text-on-surface" data-icon="more_vert">more_vert</span>
</button>
</div>
<!-- List Item 3 -->
<div class="bg-surface-container border-[3px] border-surface-container-lowest rounded-xl p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_#110e05] hover:bg-surface-container-high transition-colors cursor-pointer group">
<div class="flex items-center gap-4">
<div class="w-12 h-12 bg-error-container border-2 border-surface-container-lowest rounded-lg flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-on-error-container" data-icon="description">description</span>
</div>
<div>
<h4 class="font-body-lg text-body-lg text-on-surface font-bold group-hover:text-error transition-colors">Lab Report Notes</h4>
<p class="font-body-md text-body-md text-on-surface-variant text-sm">Chemistry • Updated 2 days ago</p>
</div>
</div>
<button class="w-10 h-10 border-2 border-surface-container-lowest rounded-full flex items-center justify-center hover:bg-surface-variant active:translate-y-1 transition-all">
<span class="material-symbols-outlined text-on-surface" data-icon="more_vert">more_vert</span>
</button>
</div>
</div>
</section>
</main>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 py-3 bg-white dark:bg-zinc-900 border-t-4 border-black shadow-[0_-4px_0px_0px_rgba(0,0,0,1)] z-50">
<!-- HOME (Inactive) -->
<a class="flex flex-col items-center justify-center w-16 h-16 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out rounded-lg" href="#">
<span class="material-symbols-outlined text-2xl mb-1" data-icon="home">home</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">HOME</span>
</a>
<!-- TASKS (Inactive) -->
<a class="flex flex-col items-center justify-center w-16 h-16 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out rounded-lg" href="#">
<span class="material-symbols-outlined text-2xl mb-1" data-icon="checklist">checklist</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">TASKS</span>
</a>
<!-- VAULT (Active) -->
<a class="flex flex-col items-center justify-center w-16 h-16 bg-yellow-400 text-black border-2 border-black rounded-lg scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined text-2xl mb-1" data-icon="inventory_2">inventory_2</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">VAULT</span>
</a>
<!-- RANK (Inactive) -->
<a class="flex flex-col items-center justify-center w-16 h-16 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out rounded-lg" href="#">
<span class="material-symbols-outlined text-2xl mb-1" data-icon="leaderboard">leaderboard</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">RANK</span>
</a>
<!-- PROFILE (Inactive) -->
<a class="flex flex-col items-center justify-center w-16 h-16 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out rounded-lg" href="#">
<span class="material-symbols-outlined text-2xl mb-1" data-icon="person">person</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">PROFILE</span>
</a>
</nav>
</body></html>

<!-- Friends / Social -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>COLLEZ - Discover</title>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&amp;family=Space+Grotesk:wght@400;500;700;900&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "outline-variant": "#4d4632",
                        "surface-container-high": "#2e2a1e",
                        "on-tertiary-fixed-variant": "#474646",
                        "on-primary-fixed-variant": "#554500",
                        "on-surface": "#eae2cf",
                        "on-primary-fixed": "#231b00",
                        "on-surface-variant": "#d0c6ab",
                        "surface-container-lowest": "#110e05",
                        "surface-bright": "#3d392c",
                        "error": "#ffb4ab",
                        "primary-fixed-dim": "#ebc300",
                        "primary-fixed": "#ffe177",
                        "tertiary-fixed": "#e5e2e1",
                        "tertiary-container": "#dad7d6",
                        "on-primary": "#3b2f00",
                        "background": "#161309",
                        "on-tertiary-fixed": "#1c1b1b",
                        "outline": "#999077",
                        "on-secondary": "#3d0090",
                        "on-tertiary-container": "#5e5d5d",
                        "surface-variant": "#393428",
                        "surface-dim": "#161309",
                        "surface-container-highest": "#393428",
                        "secondary-container": "#6b03f1",
                        "on-secondary-fixed": "#24005b",
                        "primary": "#fff3d6",
                        "tertiary-fixed-dim": "#c8c6c5",
                        "error-container": "#93000a",
                        "inverse-primary": "#715d00",
                        "on-tertiary": "#313030",
                        "on-primary-container": "#705c00",
                        "on-secondary-container": "#d7c4ff",
                        "surface-container": "#231f14",
                        "surface-container-low": "#1f1b10",
                        "secondary": "#d1bcff",
                        "inverse-surface": "#eae2cf",
                        "secondary-fixed": "#eaddff",
                        "surface-tint": "#ebc300",
                        "on-error": "#690005",
                        "tertiary": "#f7f3f3",
                        "on-background": "#eae2cf",
                        "on-error-container": "#ffdad6",
                        "surface": "#161309",
                        "primary-container": "#ffd400",
                        "inverse-on-surface": "#343024",
                        "on-secondary-fixed-variant": "#5800c8",
                        "secondary-fixed-dim": "#d1bcff"
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    spacing: {
                        "unit": "8px",
                        "container-max": "1440px",
                        "gutter": "24px",
                        "margin-mobile": "20px",
                        "margin-desktop": "64px"
                    },
                    fontFamily: {
                        "display-hero": ["Space Grotesk", "sans-serif"],
                        "button-label": ["Space Grotesk", "sans-serif"],
                        "body-lg": ["Plus Jakarta Sans", "sans-serif"],
                        "body-md": ["Plus Jakarta Sans", "sans-serif"],
                        "headline-lg": ["Space Grotesk", "sans-serif"],
                        "headline-md": ["Space Grotesk", "sans-serif"]
                    },
                    fontSize: {
                        "display-hero": ["72px", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "700" }],
                        "button-label": ["16px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "700" }],
                        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "500" }],
                        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
                        "headline-lg": ["40px", { lineHeight: "1.2", fontWeight: "700" }],
                        "headline-md": ["24px", { lineHeight: "1.2", fontWeight: "700" }]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .icon-fill {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        /* Custom utilities for the neo-comic brutalist style */
        .brutal-border {
            border: 3px solid #110e05; /* using surface-container-lowest as near black */
        }
        .brutal-shadow-sm {
            box-shadow: 4px 4px 0px 0px #110e05;
        }
        .brutal-shadow-md {
            box-shadow: 8px 8px 0px 0px #110e05;
        }
        .brutal-interactive {
            transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        .brutal-interactive:active {
            transform: translate(4px, 4px);
            box-shadow: 0px 0px 0px 0px #110e05;
        }
        .comic-bg-pattern {
            background-image: radial-gradient(#393428 1px, transparent 1px);
            background-size: 8px 8px;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background font-body-md min-h-screen pt-20 pb-24">
<!-- TopAppBar -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-yellow-400 dark:bg-yellow-500 border-b-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
<div class="flex items-center gap-2">
<img alt="Brand Logo" class="w-10 h-10 rounded-full border-2 border-black object-cover" data-alt="Abstract vibrant comic style logo icon with bold colors" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbwFStYALIEh6koWnbrjRaFBQhcpr9Epjw0bEs-b8ly3UDFBdbhkyjb2-W3rF9pbtIiNmivdHetOx2ZGy9IxuK1mBZGSdsI0DkmI_dQhXOn7pVe6DoNd-fBTV_NgncY-LLmqtgY361VhAJ7d6I8bW5X5yi4-gvwKZjmSzlFzgSVdy9JZq1Jj1qhiIM48PBcg4YMNyP_R0_awFrLCYs_SpkStDANHJehhfqMRYvGYsUSmHvh2fEgYUTpkfySHp_oJwI7DSzNdFYhZA"/>
<span class="font-['Space_Grotesk'] font-black uppercase tracking-tighter text-2xl italic text-black">COLLEZ</span>
</div>
<button class="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full border-2 border-black hover:bg-white/40 active:translate-y-1 active:shadow-none transition-all text-black">
<span class="material-symbols-outlined icon-fill text-orange-500">local_fire_department</span>
<span class="font-button-label text-button-label text-black">2500 XP</span>
</button>
</header>
<!-- Main Content Canvas -->
<main class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 flex flex-col gap-8">
<!-- Header & Search -->
<section class="flex flex-col gap-6">
<h1 class="font-display-hero text-display-hero text-primary">CONNECT</h1>
<div class="relative w-full max-w-2xl brutal-border brutal-shadow-sm rounded-lg overflow-hidden flex bg-surface focus-within:ring-4 focus-within:ring-primary-container focus-within:shadow-[0_0_40px_rgba(255,212,0,0.3)] transition-all">
<span class="material-symbols-outlined text-outline p-4 bg-surface-container-highest">search</span>
<input class="w-full bg-surface text-on-surface font-body-lg text-body-lg border-none focus:ring-0 placeholder:text-outline p-4 outline-none" placeholder="Search students, departments..." type="text"/>
<button class="bg-primary-fixed text-on-primary-fixed font-button-label text-button-label px-6 border-l-3 border-surface-container-lowest hover:bg-primary-fixed-dim">
                    FIND
                </button>
</div>
</section>
<!-- Filters -->
<section class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
<button class="shrink-0 px-6 py-2 rounded-full brutal-border brutal-shadow-sm bg-primary text-on-primary font-button-label text-button-label brutal-interactive uppercase">All Squads</button>
<button class="shrink-0 px-6 py-2 rounded-full brutal-border brutal-shadow-sm bg-surface-container-high text-on-surface font-button-label text-button-label brutal-interactive uppercase hover:bg-surface-variant">Computer Science</button>
<button class="shrink-0 px-6 py-2 rounded-full brutal-border brutal-shadow-sm bg-surface-container-high text-on-surface font-button-label text-button-label brutal-interactive uppercase hover:bg-surface-variant">Design Arts</button>
<button class="shrink-0 px-6 py-2 rounded-full brutal-border brutal-shadow-sm bg-surface-container-high text-on-surface font-button-label text-button-label brutal-interactive uppercase hover:bg-surface-variant">Esports</button>
</section>
<!-- Student Cards Grid -->
<section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
<!-- Card 1 -->
<article class="bg-surface-container brutal-border brutal-shadow-md rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden group comic-bg-pattern">
<!-- Header: Avatar & Title -->
<div class="flex items-start justify-between">
<div class="flex gap-4 items-center">
<div class="w-16 h-16 rounded-full brutal-border overflow-hidden relative bg-secondary">
<img alt="Avatar" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" data-alt="Young woman with colorful edgy makeup and confident expression against bright background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZsX5ANnIJbOHXxz253pWXxYsdnaJmZmE-RgSQ7ARE4TpKSND40m3sRzuRYeW07ST-fzWl2ao6IG9x1Z_MT4SxOx97E3I4_QjpRHRsUZoaBJV9wdqvLPFNrvte5YpKQ8JOMpvadoGgIB9NNPBZX2IaXQmyZg8ztnctYOi413xh94_AuklbsNiEVW9bhOVEoAZESht85nZUfhFDez8FIBm0EDm3OBEgv1pFNsHy_jnx0cLt3q7xwwhYj-fNyRNF0Ofz69PJnoVK0QE"/>
</div>
<div>
<h2 class="font-headline-md text-headline-md text-on-surface">Zoe K.</h2>
<span class="inline-block bg-secondary-container text-on-secondary-container text-xs font-bold px-2 py-1 rounded brutal-border mt-1 uppercase">Frontend Ninja</span>
</div>
</div>
<div class="flex flex-col items-end">
<span class="flex items-center gap-1 text-primary-fixed font-bold">
<span class="material-symbols-outlined icon-fill text-sm">stars</span> 8.4K
                        </span>
<span class="text-xs text-outline font-bold uppercase">Lvl 42</span>
</div>
</div>
<!-- Tags -->
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1 rounded-full text-xs font-bold brutal-border bg-surface-bright text-on-surface uppercase">CSE</span>
<span class="px-3 py-1 rounded-full text-xs font-bold brutal-border bg-surface-bright text-on-surface uppercase">UI/UX</span>
</div>
<!-- Actions -->
<div class="flex gap-3 mt-auto pt-4 border-t-3 border-surface-container-lowest">
<button class="flex-1 py-3 rounded-lg brutal-border brutal-shadow-sm brutal-interactive bg-secondary text-on-secondary font-button-label text-button-label uppercase flex justify-center items-center gap-2">
<span class="material-symbols-outlined">person_add</span> Follow
                    </button>
<button class="flex-1 py-3 rounded-lg brutal-border brutal-shadow-sm brutal-interactive bg-primary text-on-primary font-button-label text-button-label uppercase flex justify-center items-center gap-2">
<span class="material-symbols-outlined">chat_bubble</span> Msg
                    </button>
</div>
</article>
<!-- Card 2 -->
<article class="bg-surface-container brutal-border brutal-shadow-md rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden group comic-bg-pattern">
<div class="flex items-start justify-between">
<div class="flex gap-4 items-center">
<div class="w-16 h-16 rounded-full brutal-border overflow-hidden relative bg-error-container">
<img alt="Avatar" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" data-alt="Young man looking directly at camera with serious expression in high contrast dramatic lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAT1WXXmA27CWTPd8qgApuXK5b4siCGYhvAvrhJY1oq2ANN0BtzNy-5Waq5iyAvU5Hr_48eKTfiO-0DKjHidZlXWRxIQfIibX2xCCsdw5r-uYw2JQ-zjseOzCTZ7k5UbhBCVsODysd-UsKCPB2dONiE4_z9nVtWopHUIAoBUxcUDwSJGjIU8aEpPIjDOg--2npcF7LSCE-efVfqHLhQFaOt9xf_eSnHpRRA5vntiGtm4AMmuGtKyY7YbdNHk7N-9-CWg8aPqWUpGF0"/>
</div>
<div>
<h2 class="font-headline-md text-headline-md text-on-surface">Marcus T.</h2>
<span class="inline-block bg-primary-container text-on-primary-container text-xs font-bold px-2 py-1 rounded brutal-border mt-1 uppercase">3D Artist</span>
</div>
</div>
<div class="flex flex-col items-end">
<span class="flex items-center gap-1 text-primary-fixed font-bold">
<span class="material-symbols-outlined icon-fill text-sm">stars</span> 6.1K
                        </span>
<span class="text-xs text-outline font-bold uppercase">Lvl 28</span>
</div>
</div>
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1 rounded-full text-xs font-bold brutal-border bg-surface-bright text-on-surface uppercase">Design</span>
<span class="px-3 py-1 rounded-full text-xs font-bold brutal-border bg-surface-bright text-on-surface uppercase">Blender</span>
</div>
<div class="flex gap-3 mt-auto pt-4 border-t-3 border-surface-container-lowest">
<button class="flex-1 py-3 rounded-lg brutal-border brutal-shadow-sm brutal-interactive bg-secondary text-on-secondary font-button-label text-button-label uppercase flex justify-center items-center gap-2">
<span class="material-symbols-outlined">person_add</span> Follow
                    </button>
<button class="flex-1 py-3 rounded-lg brutal-border brutal-shadow-sm brutal-interactive bg-primary text-on-primary font-button-label text-button-label uppercase flex justify-center items-center gap-2">
<span class="material-symbols-outlined">chat_bubble</span> Msg
                    </button>
</div>
</article>
<!-- Card 3 -->
<article class="bg-surface-container brutal-border brutal-shadow-md rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden group comic-bg-pattern">
<div class="flex items-start justify-between">
<div class="flex gap-4 items-center">
<div class="w-16 h-16 rounded-full brutal-border overflow-hidden relative bg-tertiary-container">
<img alt="Avatar" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" data-alt="Portrait of young woman smiling slightly with neon rim lighting in a dark environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7PyJPiQymaodE9Zh-KRUOjZQb41P2_sQWCKK92D1j_L-W6kEobki7s6wPXwOVwY829FeSyP4Va3rKerY4d5M9y3ej3A2pgG3-A6sGAT2g8dFnLoUHN4kzLZ4fL1XDdg14jLM6VoItINAMjE_Bv2Zq0xfiHWcupgmtB0UQmmszp3ZfU7xUcp9RgWM4APSf6hOgtm45Vm12fHdAGZ6EvUMOxaOlTlmimkvfdNc4HIi8MEyXBkUVNGna3ZHye5uS94SPT4yIBU_-oNw"/>
</div>
<div>
<h2 class="font-headline-md text-headline-md text-on-surface">Aisha R.</h2>
<span class="inline-block bg-tertiary-container text-on-tertiary-container text-xs font-bold px-2 py-1 rounded brutal-border mt-1 uppercase">Pro Gamer</span>
</div>
</div>
<div class="flex flex-col items-end">
<span class="flex items-center gap-1 text-primary-fixed font-bold">
<span class="material-symbols-outlined icon-fill text-sm">stars</span> 12.5K
                        </span>
<span class="text-xs text-outline font-bold uppercase">Lvl 55</span>
</div>
</div>
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1 rounded-full text-xs font-bold brutal-border bg-surface-bright text-on-surface uppercase">Esports</span>
<span class="px-3 py-1 rounded-full text-xs font-bold brutal-border bg-surface-bright text-on-surface uppercase">Captain</span>
</div>
<div class="flex gap-3 mt-auto pt-4 border-t-3 border-surface-container-lowest">
<button class="flex-1 py-3 rounded-lg brutal-border brutal-shadow-sm brutal-interactive bg-secondary text-on-secondary font-button-label text-button-label uppercase flex justify-center items-center gap-2">
<span class="material-symbols-outlined">person_add</span> Follow
                    </button>
<button class="flex-1 py-3 rounded-lg brutal-border brutal-shadow-sm brutal-interactive bg-primary text-on-primary font-button-label text-button-label uppercase flex justify-center items-center gap-2">
<span class="material-symbols-outlined">chat_bubble</span> Msg
                    </button>
</div>
</article>
</section>
</main>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 py-3 bg-white dark:bg-zinc-900 border-t-4 border-black shadow-[0_-4px_0px_0px_rgba(0,0,0,1)] z-50 md:hidden">
<!-- Index 0: HOME (Inactive) -->
<a class="flex flex-col items-center gap-1 p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined">home</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">HOME</span>
</a>
<!-- Index 1: TASKS (Inactive) -->
<a class="flex flex-col items-center gap-1 p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined">checklist</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">TASKS</span>
</a>
<!-- Index 2: VAULT (Inactive) -->
<a class="flex flex-col items-center gap-1 p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined">inventory_2</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">VAULT</span>
</a>
<!-- Index 3: RANK (Inactive) -->
<a class="flex flex-col items-center gap-1 p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined">leaderboard</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">RANK</span>
</a>
<!-- Index 4: PROFILE (Active - Semantic Map for Social/Friends) -->
<a class="flex flex-col items-center gap-1 p-2 bg-yellow-400 text-black border-2 border-black rounded-lg scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined icon-fill">person</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">PROFILE</span>
</a>
</nav>
</body></html>

<!-- Rankings / Leaderboard -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Collez - Rankings</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&amp;family=Space+Grotesk:wght@700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#4d4632",
                        "surface-container-high": "#2e2a1e",
                        "on-tertiary-fixed-variant": "#474646",
                        "on-primary-fixed-variant": "#554500",
                        "on-surface": "#eae2cf",
                        "on-primary-fixed": "#231b00",
                        "on-surface-variant": "#d0c6ab",
                        "surface-container-lowest": "#110e05",
                        "surface-bright": "#3d392c",
                        "error": "#ffb4ab",
                        "primary-fixed-dim": "#ebc300",
                        "primary-fixed": "#ffe177",
                        "tertiary-fixed": "#e5e2e1",
                        "tertiary-container": "#dad7d6",
                        "on-primary": "#3b2f00",
                        "background": "#161309",
                        "on-tertiary-fixed": "#1c1b1b",
                        "outline": "#999077",
                        "on-secondary": "#3d0090",
                        "on-tertiary-container": "#5e5d5d",
                        "surface-variant": "#393428",
                        "surface-dim": "#161309",
                        "surface-container-highest": "#393428",
                        "secondary-container": "#6b03f1",
                        "on-secondary-fixed": "#24005b",
                        "primary": "#fff3d6",
                        "tertiary-fixed-dim": "#c8c6c5",
                        "error-container": "#93000a",
                        "inverse-primary": "#715d00",
                        "on-tertiary": "#313030",
                        "on-primary-container": "#705c00",
                        "on-secondary-container": "#d7c4ff",
                        "surface-container": "#231f14",
                        "surface-container-low": "#1f1b10",
                        "secondary": "#d1bcff",
                        "inverse-surface": "#eae2cf",
                        "secondary-fixed": "#eaddff",
                        "surface-tint": "#ebc300",
                        "on-error": "#690005",
                        "tertiary": "#f7f3f3",
                        "on-background": "#eae2cf",
                        "on-error-container": "#ffdad6",
                        "surface": "#161309",
                        "primary-container": "#ffd400",
                        "inverse-on-surface": "#343024",
                        "on-secondary-fixed-variant": "#5800c8",
                        "secondary-fixed-dim": "#d1bcff"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "unit": "8px",
                        "container-max": "1440px",
                        "gutter": "24px",
                        "margin-mobile": "20px",
                        "margin-desktop": "64px"
                    },
                    "fontFamily": {
                        "display-hero": ["Space Grotesk"],
                        "button-label": ["Space Grotesk"],
                        "body-lg": ["Plus Jakarta Sans"],
                        "body-md": ["Plus Jakarta Sans"],
                        "headline-lg": ["Space Grotesk"],
                        "headline-md": ["Space Grotesk"]
                    },
                    "fontSize": {
                        "display-hero": ["72px", { "lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "700" }],
                        "button-label": ["16px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700" }],
                        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "500" }],
                        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
                        "headline-lg": ["40px", { "lineHeight": "1.2", "fontWeight": "700" }],
                        "headline-md": ["24px", { "lineHeight": "1.2", "fontWeight": "700" }]
                    }
                }
            }
        }
    </script>
<style>
        .halftone-bg {
            background-image: radial-gradient(circle, #2e2a1e 2px, transparent 2px);
            background-size: 10px 10px;
        }
        .striped-bg {
            background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background font-body-md min-h-screen flex flex-col pt-20 pb-24">
<!-- TopAppBar -->
<header class="fixed top-0 z-50 bg-yellow-400 dark:bg-yellow-500 text-black dark:text-black border-b-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center w-full px-6 h-20">
<div class="w-12 h-12 rounded-full border-4 border-black overflow-hidden bg-white shrink-0">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="Portrait of a young woman with vibrant pink hair and stylized comic-book makeup" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKX5cbQ3KMb_JhcYgNw4nLNdTaxrpjzS0pjKUmHsCwYHOK-5t6RZkJ5YaWWKuDHCmjOgi91nuNaNEBHSClDqcnT0Ime5h4blMco_X9fQRBwdgf_d6zrondTblYphMLh7I76Xk1rNLHVP1gkkXdtCgZa7_cqFeCm2GYLrbvWO0UlOkPFGWJ72Nyk4azzFRMl73iovZJmJx36vSAu6568-wLDXPeHigbTm2csm8YzxmqQtPrGDhvWvYoxN9EaGJ4W6eBzX9LYVUKF-s"/>
</div>
<div class="font-['Space_Grotesk'] font-black uppercase tracking-tighter text-2xl italic">COLLEZ</div>
<div class="flex items-center gap-1 bg-white px-3 py-1.5 border-4 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-white/20 active:translate-y-1 active:shadow-none transition-all cursor-pointer">
<span class="material-symbols-outlined text-orange-500 text-xl" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
<span class="font-button-label text-button-label">2500 XP</span>
</div>
</header>
<main class="flex-1 w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-6 flex flex-col gap-8">
<!-- Header & Tabs -->
<div class="flex flex-col items-center gap-6">
<h1 class="font-headline-lg text-headline-lg text-center uppercase text-primary-fixed drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" style="-webkit-text-stroke: 2px black;">Leaderboard</h1>
<div class="flex justify-center gap-3 w-full overflow-x-auto pb-4 px-2 snap-x">
<button class="snap-center shrink-0 bg-primary-container text-black border-4 border-black px-6 py-3 rounded-full font-button-label text-button-label shadow-[4px_4px_0px_0px_#111] hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_#111] transition-all">COLLEGE</button>
<button class="snap-center shrink-0 bg-surface text-on-surface border-4 border-black px-6 py-3 rounded-full font-button-label text-button-label shadow-[4px_4px_0px_0px_#6b03f1] hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_#6b03f1] transition-all">CITY</button>
<button class="snap-center shrink-0 bg-surface text-on-surface border-4 border-black px-6 py-3 rounded-full font-button-label text-button-label shadow-[4px_4px_0px_0px_#6b03f1] hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_#6b03f1] transition-all">WEEKLY</button>
</div>
</div>
<!-- Podium -->
<div class="relative flex justify-center items-end h-[300px] mt-8 mb-4">
<!-- 2nd Place -->
<div class="relative flex flex-col items-center w-28 md:w-36 z-10 -mr-4">
<div class="absolute -top-10 flex flex-col items-center">
<span class="material-symbols-outlined text-tertiary-fixed text-4xl drop-shadow-[2px_2px_0px_#111]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
<div class="w-16 h-16 rounded-full border-4 border-black overflow-hidden bg-secondary-container shadow-[4px_4px_0px_0px_#111] mt-1">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="Portrait of a young man with a serious expression, dark lighting and stylized contrast" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeRv54xm-09jdw54h2DFERHVViKpce6a5RLt4VG_87jXVFBhVG_sg1euka5M9Ypi6oA4EY560CWWtvDGd1DNx4TQRfOUh66v1J4B1Hqzn-Uinc-cgxGDGY0-2rAqxIrSeZ_kXfSPiVjZ0KAxbbMM6lL4rRmflH8DOLBn6YeXbDV58rCkjwzSyb0az6v_ZvCchLlg-wreJEJLdIkXv1C9m1X9LrP_23hmtDFY95lNvUoPIXd-CasCJ-PJSuSorTwr8A1D5QUAwURDA"/>
</div>
</div>
<div class="w-full bg-surface-container-high border-4 border-black border-b-0 h-[120px] rounded-t-xl flex flex-col justify-end items-center pb-4 halftone-bg">
<span class="font-headline-md text-headline-md text-tertiary-fixed drop-shadow-[2px_2px_0px_#111]">2</span>
<span class="font-button-label text-button-label text-on-surface mt-1">8,420</span>
</div>
</div>
<!-- 1st Place -->
<div class="relative flex flex-col items-center w-32 md:w-44 z-20">
<div class="absolute -top-14 flex flex-col items-center">
<span class="material-symbols-outlined text-primary-fixed text-5xl drop-shadow-[3px_3px_0px_#111] animate-bounce" style="font-variation-settings: 'FILL' 1;">crown</span>
<div class="w-20 h-20 rounded-full border-4 border-black overflow-hidden bg-primary-container shadow-[0_0_15px_#ffd400,4px_4px_0px_0px_#111] mt-1">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="Portrait of a smiling young woman with bright neon lighting and comic halftone background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCq169VG_jrD_oCgZfp6VhlvGvrau0zd-zRFDqmkU8mlHHLq_A30bbXv_iGDnnhJEYHQeCVWeb0c1nUKEk8uF-bq_t5lIUFLNtRmUDlXCX0E-AR4J4lYs4BAgul5d2CDRCYJJthl9r66f6j-3F2W7R_6CYPh1oApBKIrfa_R8Y-4316U9YeQQNrr2WSjiaylNimsypYDf-h2xSLAu1qbDZxzf4tsWLt28MVT1gzijXp-W1sFuqfNU77MX6pgVGjLSkIp48HFM2TpCg"/>
</div>
</div>
<div class="w-full bg-primary-container border-4 border-black border-b-0 h-[180px] rounded-t-xl flex flex-col justify-end items-center pb-4 striped-bg shadow-[0_0_20px_rgba(255,212,0,0.2)]">
<span class="font-headline-lg text-headline-lg text-black drop-shadow-[2px_2px_0px_rgba(255,255,255,0.5)]">1</span>
<span class="font-button-label text-button-label text-black mt-1">12,500</span>
</div>
</div>
<!-- 3rd Place -->
<div class="relative flex flex-col items-center w-28 md:w-36 z-10 -ml-4">
<div class="absolute -top-10 flex flex-col items-center">
<span class="material-symbols-outlined text-orange-400 text-4xl drop-shadow-[2px_2px_0px_#111]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
<div class="w-16 h-16 rounded-full border-4 border-black overflow-hidden bg-surface-variant shadow-[4px_4px_0px_0px_#111] mt-1">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="Portrait of a young man with glasses, stylized shadows and bright orange highlights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYN32uVeVCS2laIGisZ_8P8Fju_hlBq-DukKwro-ICrYvlvTxx_HrLIUdDOq-wUiAwT3RzeDCAmiLLlwyxYIZi75HHh5kwwRVNJoE4fJI3Q5CNZ8ec6AcijumsEcLEjlB1OJRcMK6aNU72WG4AZ_iP0pRAt2PknOhjRV1ccFx2idSja7j3mZJub9o-kzjXiqQc9h-aovzuxRapPFdWCSuU5utLLrZfDac3WnJJs8HoWvdKoQsG1Lhul3jP0abyoJxr0StXlOhFd8U"/>
</div>
</div>
<div class="w-full bg-surface-container-high border-4 border-black border-b-0 h-[90px] rounded-t-xl flex flex-col justify-end items-center pb-4 halftone-bg">
<span class="font-headline-md text-headline-md text-orange-400 drop-shadow-[2px_2px_0px_#111]">3</span>
<span class="font-button-label text-button-label text-on-surface mt-1">7,100</span>
</div>
</div>
<!-- Podium Base Line -->
<div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-4 bg-black rounded-full z-30"></div>
</div>
<!-- Student List -->
<div class="flex flex-col gap-4">
<!-- Standard Card 4 -->
<div class="flex items-center gap-4 bg-surface p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#6b03f1] transform transition-transform hover:-translate-y-1">
<div class="font-headline-md text-headline-md text-on-surface-variant w-8 text-center">4</div>
<div class="w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-white shrink-0">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="Close up portrait of young woman looking confident, cinematic lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDpc1DjJXSH-9VGII23MFydgSo31NY4zWHkZeISDKjN7fOPOrEP48rN7uZKcZjRmMcizN_f93lxXNXLWHHNiKIiwnadW69pE8RI_lnUSep-I4vMgARAlHI_BjjzCkK-cySiRxambx4TdQaTsuJsoZsEyl0cm89YTMWDx_zfq655AbxzP6Sjpd6soZLHJPT9cflM9XM66yKY-TGK8Hh3lpRnToUwYtu7-lhV8heTvp5Wkn-xCF5i7J8kAWHuidvEfKN20PHNXOxyRg"/>
</div>
<div class="flex-1 flex flex-col">
<span class="font-button-label text-button-label text-on-background">Alex Mercer</span>
<span class="font-body-md text-body-md text-on-surface-variant text-sm">Design Arts</span>
</div>
<div class="flex flex-col items-end gap-1">
<span class="font-button-label text-button-label text-primary-fixed">6,850 XP</span>
<div class="flex items-center gap-1 text-orange-500 bg-surface-container px-2 py-0.5 rounded-full border-2 border-black">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
<span class="font-bold text-xs">12</span>
</div>
</div>
</div>
<!-- Standard Card 5 -->
<div class="flex items-center gap-4 bg-surface p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#6b03f1] transform transition-transform hover:-translate-y-1">
<div class="font-headline-md text-headline-md text-on-surface-variant w-8 text-center">5</div>
<div class="w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-white shrink-0">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="Portrait of a young man smiling in an urban setting, high contrast" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3H1-gA9FeM0k2KW83JEAg8jq6O9WUWKBgUzlgRkjWziAPj923Qsvrm0OS0awJKCSUODu2PY8_rl8ATEHuvyJ5y0wNjfCrdnU4i80RFbId6OhquIl_xGg22rK-CLOMyfYnWPsrIdfTy0Sk_Z1-W0Co5ixOFso9gOpKn645NpFQeOZmRJZYHV9an5ymiR6gSHMmaZzKzGYOErGBSpYQ1GbuUo0azb1Ref_ycBZCNG5e9mf5GkcGm6pdP2o16_9QKVVzHJNbpAyA-kw"/>
</div>
<div class="flex-1 flex flex-col">
<span class="font-button-label text-button-label text-on-background">Jordan Lee</span>
<span class="font-body-md text-body-md text-on-surface-variant text-sm">Computer Science</span>
</div>
<div class="flex flex-col items-end gap-1">
<span class="font-button-label text-button-label text-primary-fixed">6,100 XP</span>
<div class="flex items-center gap-1 text-orange-500 bg-surface-container px-2 py-0.5 rounded-full border-2 border-black">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
<span class="font-bold text-xs">8</span>
</div>
</div>
</div>
<!-- Current User Card Highlighted -->
<div class="flex items-center gap-4 bg-surface-container-high p-4 rounded-xl border-4 border-primary-container shadow-[0_0_20px_rgba(255,212,0,0.3),4px_4px_0px_0px_#111] transform scale-[1.02] relative z-10">
<div class="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-primary-container rounded-r-full border-y-4 border-r-4 border-black"></div>
<div class="font-headline-md text-headline-md text-primary-container w-8 text-center ml-2">42</div>
<div class="w-14 h-14 rounded-full border-4 border-primary-container overflow-hidden bg-white shrink-0 shadow-[0_0_10px_rgba(255,212,0,0.5)]">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="Portrait of a young woman with vibrant pink hair and stylized comic-book makeup" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUlFVhQm0pZ_A3lbkEhTHtxI6_ClpHf1-Ib4mwH4ySv-VQgbTM3RC3Q4IGLB5A0tzOQViSkFmWGOwb5SaI0JLbCXl0HP6RYARD_NjvnslLyoxPlcs9ivv1M_aKo5ihv5vvWXHs3idwUeQJwE-ZlUL818EVSNWSD97f3zHy0ZuBH-cJ2kIArfGY5MkcMYiyqNBDpm63hG4xqGG2TYJaDQTbdae1sXRy81XPO4ifeN3mJnsLUPULD6fWw70d3VvKk9uVv2mKRO7YR0Q"/>
</div>
<div class="flex-1 flex flex-col">
<span class="font-button-label text-button-label text-on-background">You</span>
<span class="font-body-md text-body-md text-on-surface-variant text-sm">Interactive Media</span>
</div>
<div class="flex flex-col items-end gap-1">
<span class="font-button-label text-button-label text-primary-container">2,500 XP</span>
<div class="flex items-center gap-1 text-primary-container bg-surface px-2 py-0.5 rounded-full border-2 border-primary-container shadow-[0_0_8px_rgba(255,212,0,0.4)]">
<span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
<span class="font-bold text-xs">3</span>
</div>
</div>
</div>
<!-- Standard Card 43 -->
<div class="flex items-center gap-4 bg-surface p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#6b03f1] opacity-70">
<div class="font-headline-md text-headline-md text-on-surface-variant w-8 text-center">43</div>
<div class="w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-white shrink-0">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="Portrait of a smiling young woman with dark hair, natural lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9gdBfTY7l45SmnU9nJ5fA_E4j17wA6NDb-tLNNqygU2RTGuv3u5uiim89M6bqMGCQ_lnzHnWxUznNIDZqdpFbZbYZ5gCXkDjCxSSVL9FBBYmRlndKRYa6e1kPM5leHnZKlVgsRkVo3z0MIN0VHqjfeIF52Y42q9gr9F6jvALXVYtvjYGxSumlogl1E8YP1rrqGs0Lu_WeTjOX_rMX3cUqZ0HwSiV2bAeN2rrRFAS-VGQpJzTPd584-LymtrY7xZJ5YvulxdcvuHM"/>
</div>
<div class="flex-1 flex flex-col">
<span class="font-button-label text-button-label text-on-background">Sam Taylor</span>
<span class="font-body-md text-body-md text-on-surface-variant text-sm">Business</span>
</div>
<div class="flex flex-col items-end gap-1">
<span class="font-button-label text-button-label text-primary-fixed">2,480 XP</span>
</div>
</div>
</div>
</main>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 py-3 bg-white dark:bg-zinc-900 border-t-4 border-black z-50 shadow-[0_-4px_0px_0px_rgba(0,0,0,1)]">
<div class="flex flex-col items-center p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out cursor-pointer rounded-lg">
<span class="material-symbols-outlined text-2xl">home</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase mt-1 tracking-wider">HOME</span>
</div>
<div class="flex flex-col items-center p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out cursor-pointer rounded-lg">
<span class="material-symbols-outlined text-2xl">checklist</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase mt-1 tracking-wider">TASKS</span>
</div>
<div class="flex flex-col items-center p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out cursor-pointer rounded-lg">
<span class="material-symbols-outlined text-2xl">inventory_2</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase mt-1 tracking-wider">VAULT</span>
</div>
<div class="flex flex-col items-center p-2 bg-yellow-400 text-black border-2 border-black rounded-lg scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
<span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">leaderboard</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase mt-1 tracking-wider">RANK</span>
</div>
<div class="flex flex-col items-center p-2 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out cursor-pointer rounded-lg">
<span class="material-symbols-outlined text-2xl">person</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase mt-1 tracking-wider">PROFILE</span>
</div>
</nav>
</body></html>

<!-- Attendance Screen -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Attendance - COLLEZ</title>
<!-- Google Fonts & Material Symbols -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&amp;family=Space+Grotesk:wght@400;700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Configuration -->
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "outline-variant": "#4d4632",
                    "surface-container-high": "#2e2a1e",
                    "on-tertiary-fixed-variant": "#474646",
                    "on-primary-fixed-variant": "#554500",
                    "on-surface": "#eae2cf",
                    "on-primary-fixed": "#231b00",
                    "on-surface-variant": "#d0c6ab",
                    "surface-container-lowest": "#110e05",
                    "surface-bright": "#3d392c",
                    "error": "#ffb4ab",
                    "primary-fixed-dim": "#ebc300",
                    "primary-fixed": "#ffe177",
                    "tertiary-fixed": "#e5e2e1",
                    "tertiary-container": "#dad7d6",
                    "on-primary": "#3b2f00",
                    "background": "#161309",
                    "on-tertiary-fixed": "#1c1b1b",
                    "outline": "#999077",
                    "on-secondary": "#3d0090",
                    "on-tertiary-container": "#5e5d5d",
                    "surface-variant": "#393428",
                    "surface-dim": "#161309",
                    "surface-container-highest": "#393428",
                    "secondary-container": "#6b03f1",
                    "on-secondary-fixed": "#24005b",
                    "primary": "#fff3d6",
                    "tertiary-fixed-dim": "#c8c6c5",
                    "error-container": "#93000a",
                    "inverse-primary": "#715d00",
                    "on-tertiary": "#313030",
                    "on-primary-container": "#705c00",
                    "on-secondary-container": "#d7c4ff",
                    "surface-container": "#231f14",
                    "surface-container-low": "#1f1b10",
                    "secondary": "#d1bcff",
                    "inverse-surface": "#eae2cf",
                    "secondary-fixed": "#eaddff",
                    "surface-tint": "#ebc300",
                    "on-error": "#690005",
                    "tertiary": "#f7f3f3",
                    "on-background": "#eae2cf",
                    "on-error-container": "#ffdad6",
                    "surface": "#161309",
                    "primary-container": "#ffd400",
                    "inverse-on-surface": "#343024",
                    "on-secondary-fixed-variant": "#5800c8",
                    "secondary-fixed-dim": "#d1bcff"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "unit": "8px",
                    "container-max": "1440px",
                    "gutter": "24px",
                    "margin-mobile": "20px",
                    "margin-desktop": "64px"
            },
            "fontFamily": {
                    "display-hero": ["Space Grotesk"],
                    "button-label": ["Space Grotesk"],
                    "body-lg": ["Plus Jakarta Sans"],
                    "body-md": ["Plus Jakarta Sans"],
                    "headline-lg": ["Space Grotesk"],
                    "headline-md": ["Space Grotesk"]
            },
            "fontSize": {
                    "display-hero": ["72px", { "lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "700" }],
                    "button-label": ["16px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700" }],
                    "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "500" }],
                    "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
                    "headline-lg": ["40px", { "lineHeight": "1.2", "fontWeight": "700" }],
                    "headline-md": ["24px", { "lineHeight": "1.2", "fontWeight": "700" }]
            }
          }
        }
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .icon-fill {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        
        /* Halftone pattern for Neo-Comic aesthetic */
        .bg-halftone {
            background-image: radial-gradient(circle, var(--tw-colors-surface-container-lowest) 2px, transparent 2.5px);
            background-size: 10px 10px;
            background-position: 0 0;
        }
        
        /* Brutalist Shadows */
        .brutal-shadow {
            box-shadow: 6px 6px 0px 0px var(--tw-colors-surface-container-lowest);
        }
        .brutal-shadow-error {
            box-shadow: 6px 6px 0px 0px var(--tw-colors-error-container);
        }
        .brutal-shadow-primary {
            box-shadow: 6px 6px 0px 0px var(--tw-colors-primary-container);
        }
        
        /* Inner gloss for buttons/cards */
        .inner-gloss {
            box-shadow: inset 2px 2px 0px rgba(255, 255, 255, 0.15);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background min-h-screen pb-24 font-body-md selection:bg-primary-container selection:text-on-primary-container">
<!-- TopAppBar (Shared Component) -->
<header class="docked full-width top-0 border-b-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-400 dark:bg-yellow-500 z-40 sticky">
<div class="flex justify-between items-center w-full px-6 h-20">
<!-- Leading: Avatar -->
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-white">
<img alt="User Avatar" class="w-full h-full object-cover" data-alt="close-up portrait of a young male student with short hair, wearing a casual hoodie, bright studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVKJ6QbmntzRY-Q1scfEo2Z4Cp7SQcx6uE2iIkwhrJuIjHa7ebn8EtnGioxr-YywaxhQ89yg0s2D5KpozHgCD5ZYe2qFnZhRvPtqUJTMVVgIKKugw_gq_6CX-TVx9j85DFzUkZJFblvRyU4f5dVXVWOJ6HQ-gw6YvFjMB7iPiS1AvP4jDKpAn1AVhsFxNuWtGvvBViFugjeJ_sdZMFsXm0gOuQgWz0VhHH3ONyCybVTfh-icEaHmq0XyhpO7ARCMouwJ82q4v5G4I"/>
</div>
<!-- Headline -->
<span class="font-['Space_Grotesk'] font-black uppercase tracking-tighter text-2xl italic text-black">COLLEZ</span>
</div>
<!-- Trailing: Action -->
<button class="flex items-center gap-2 bg-white border-2 border-black rounded-full px-4 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-white/20 active:translate-y-1 active:shadow-none transition-all">
<span class="text-black font-['Space_Grotesk'] font-black uppercase tracking-tighter">2500 XP</span>
<span class="material-symbols-outlined icon-fill text-orange-500 text-xl" data-icon="local_fire_department">local_fire_department</span>
</button>
</div>
</header>
<!-- Main Canvas -->
<main class="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-8 flex flex-col gap-gutter">
<!-- Header -->
<div class="flex flex-col gap-2 mb-4">
<h1 class="font-headline-lg text-headline-lg text-primary uppercase tracking-tight" style="-webkit-text-stroke: 1px var(--tw-colors-surface-container-lowest); text-shadow: 4px 4px 0px var(--tw-colors-secondary-container);">ATTENDANCE</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant">Track your classes. Don't fail.</p>
</div>
<!-- Dramatic Warning Card (Low Attendance) -->
<section class="bg-error border-4 border-surface-container-lowest brutal-shadow-error rounded-xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 relative overflow-hidden inner-gloss">
<div class="absolute inset-0 bg-halftone opacity-10 pointer-events-none"></div>
<div class="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/20 z-10">
<span class="material-symbols-outlined text-error text-4xl" data-icon="warning">warning</span>
</div>
<div class="flex-1 z-10 text-center sm:text-left">
<h2 class="font-headline-md text-headline-md text-on-error uppercase mb-1">DANGER ZONE</h2>
<p class="font-body-lg text-body-lg text-on-error/90 mb-4">Your <strong>Physics</strong> attendance has dropped below 75%. You are at risk of being debarred.</p>
<div class="inline-flex bg-surface-container-lowest text-error px-4 py-2 border-2 border-surface-container-lowest font-button-label text-button-label uppercase tracking-widest shadow-[2px_2px_0px_0px_#fff]">
                    ATTEND NEXT 4 CLASSES
                </div>
</div>
</section>
<!-- Overall Status / Safe Stat -->
<section class="bg-primary-container border-4 border-surface-container-lowest brutal-shadow rounded-xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 inner-gloss">
<div class="flex flex-col gap-2 text-center md:text-left w-full md:w-2/3">
<h3 class="font-headline-lg text-headline-lg text-on-primary-container uppercase leading-none">OVERALL<br/>STATUS</h3>
<p class="font-body-lg text-body-lg text-on-primary-container/80 mt-2">You need to attend <strong>12 more classes</strong> across all subjects to secure a safe 80% aggregate for the semester.</p>
</div>
<div class="w-full md:w-1/3 flex justify-center">
<div class="relative w-40 h-40">
<!-- Background Circle -->
<svg class="w-full h-full transform -rotate-90" viewbox="0 0 100 100">
<circle cx="50" cy="50" fill="none" opacity="0.2" r="40" stroke="var(--tw-colors-surface-container-lowest)" stroke-width="12"></circle>
<!-- Progress Circle (82%) -->
<circle class="transition-all duration-1000 ease-out" cx="50" cy="50" fill="none" r="40" stroke="var(--tw-colors-surface-container-lowest)" stroke-dasharray="251.2" stroke-dashoffset="45.2" stroke-width="12"></circle>
</svg>
<!-- Inner Content -->
<div class="absolute inset-0 flex flex-col items-center justify-center">
<span class="font-headline-lg text-[48px] font-black text-on-primary-container leading-none">82<span class="text-2xl">%</span></span>
</div>
</div>
</div>
</section>
<!-- Subjects Grid -->
<h2 class="font-headline-md text-headline-md text-surface-variant bg-primary inline-block px-4 py-2 border-4 border-surface-container-lowest brutal-shadow mt-4 uppercase self-start rotate-[-2deg]">SUBJECTS</h2>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
<!-- Subject Card: Good -->
<div class="bg-surface-variant border-4 border-surface-container-lowest rounded-xl p-5 brutal-shadow flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform">
<div class="flex justify-between items-start mb-6">
<div>
<h4 class="font-headline-md text-headline-md text-on-surface uppercase truncate">MATHEMATICS</h4>
<p class="font-body-md text-body-md text-on-surface-variant mt-1">Dr. Smith • Mon, Wed, Fri</p>
</div>
<div class="w-12 h-12 rounded-full border-2 border-surface-container-lowest bg-secondary-container flex items-center justify-center">
<span class="material-symbols-outlined text-on-secondary-container" data-icon="functions">functions</span>
</div>
</div>
<div class="flex items-center justify-between mt-auto">
<div class="flex items-center gap-3">
<div class="w-16 h-16 relative">
<svg class="w-full h-full transform -rotate-90" viewbox="0 0 100 100">
<circle cx="50" cy="50" fill="none" r="38" stroke="var(--tw-colors-surface-container-lowest)" stroke-width="8"></circle>
<circle cx="50" cy="50" fill="none" r="38" stroke="var(--tw-colors-primary)" stroke-dasharray="238.7" stroke-dashoffset="23.8" stroke-width="8"></circle>
</svg>
<div class="absolute inset-0 flex items-center justify-center">
<span class="font-button-label text-button-label text-on-surface">90%</span>
</div>
</div>
<div class="flex flex-col">
<span class="font-body-md text-body-md text-on-surface font-bold">Safe</span>
<span class="font-body-md text-[12px] text-on-surface-variant uppercase">36/40 Classes</span>
</div>
</div>
</div>
</div>
<!-- Subject Card: Danger -->
<div class="bg-surface-variant border-4 border-surface-container-lowest rounded-xl p-5 brutal-shadow flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform">
<!-- Red highlight border on top -->
<div class="absolute top-0 left-0 w-full h-2 bg-error"></div>
<div class="flex justify-between items-start mb-6 mt-2">
<div>
<h4 class="font-headline-md text-headline-md text-on-surface uppercase truncate">PHYSICS</h4>
<p class="font-body-md text-body-md text-on-surface-variant mt-1">Dr. Banner • Tue, Thu</p>
</div>
<div class="w-12 h-12 rounded-full border-2 border-surface-container-lowest bg-error-container flex items-center justify-center shadow-[2px_2px_0px_0px_#110e05]">
<span class="material-symbols-outlined text-on-error-container" data-icon="science">science</span>
</div>
</div>
<div class="flex items-center justify-between mt-auto">
<div class="flex items-center gap-3">
<div class="w-16 h-16 relative">
<svg class="w-full h-full transform -rotate-90" viewbox="0 0 100 100">
<circle cx="50" cy="50" fill="none" r="38" stroke="var(--tw-colors-surface-container-lowest)" stroke-width="8"></circle>
<circle cx="50" cy="50" fill="none" r="38" stroke="var(--tw-colors-error)" stroke-dasharray="238.7" stroke-dashoffset="78.7" stroke-width="8"></circle>
</svg>
<div class="absolute inset-0 flex items-center justify-center">
<span class="font-button-label text-button-label text-error">67%</span>
</div>
</div>
<div class="flex flex-col">
<span class="font-body-md text-body-md text-error font-bold">Critical</span>
<span class="font-body-md text-[12px] text-on-surface-variant uppercase">20/30 Classes</span>
</div>
</div>
</div>
</div>
<!-- Subject Card: Warning -->
<div class="bg-surface-variant border-4 border-surface-container-lowest rounded-xl p-5 brutal-shadow flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform">
<div class="absolute top-0 left-0 w-full h-2 bg-primary-container"></div>
<div class="flex justify-between items-start mb-6 mt-2">
<div>
<h4 class="font-headline-md text-headline-md text-on-surface uppercase truncate">CHEMISTRY</h4>
<p class="font-body-md text-body-md text-on-surface-variant mt-1">Prof. White • Mon, Wed</p>
</div>
<div class="w-12 h-12 rounded-full border-2 border-surface-container-lowest bg-primary-container flex items-center justify-center">
<span class="material-symbols-outlined text-on-primary-container" data-icon="experiment">experiment</span>
</div>
</div>
<div class="flex items-center justify-between mt-auto">
<div class="flex items-center gap-3">
<div class="w-16 h-16 relative">
<svg class="w-full h-full transform -rotate-90" viewbox="0 0 100 100">
<circle cx="50" cy="50" fill="none" r="38" stroke="var(--tw-colors-surface-container-lowest)" stroke-width="8"></circle>
<circle cx="50" cy="50" fill="none" r="38" stroke="var(--tw-colors-primary-container)" stroke-dasharray="238.7" stroke-dashoffset="57.2" stroke-width="8"></circle>
</svg>
<div class="absolute inset-0 flex items-center justify-center">
<span class="font-button-label text-button-label text-primary-container">76%</span>
</div>
</div>
<div class="flex flex-col">
<span class="font-body-md text-body-md text-primary-container font-bold">Warning</span>
<span class="font-body-md text-[12px] text-on-surface-variant uppercase">19/25 Classes</span>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- BottomNavBar (Shared Component) -->
<nav class="fixed bottom-0 w-full border-t-4 border-black z-50 shadow-[0_-4px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-zinc-900 md:hidden">
<div class="flex justify-around items-center px-2 py-3 w-full">
<!-- HOME (Active) -->
<button class="flex flex-col items-center justify-center w-16 h-14 bg-yellow-400 text-black border-2 border-black rounded-lg scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out">
<span class="material-symbols-outlined icon-fill mb-1" data-icon="home">home</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">HOME</span>
</button>
<!-- TASKS -->
<button class="flex flex-col items-center justify-center w-16 h-14 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out">
<span class="material-symbols-outlined mb-1" data-icon="checklist">checklist</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">TASKS</span>
</button>
<!-- VAULT -->
<button class="flex flex-col items-center justify-center w-16 h-14 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out">
<span class="material-symbols-outlined mb-1" data-icon="inventory_2">inventory_2</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">VAULT</span>
</button>
<!-- RANK -->
<button class="flex flex-col items-center justify-center w-16 h-14 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out">
<span class="material-symbols-outlined mb-1" data-icon="leaderboard">leaderboard</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">RANK</span>
</button>
<!-- PROFILE -->
<button class="flex flex-col items-center justify-center w-16 h-14 text-zinc-500 grayscale hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-95 transition-transform duration-100 ease-in-out">
<span class="material-symbols-outlined mb-1" data-icon="person">person</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">PROFILE</span>
</button>
</div>
</nav>
</body></html>

<!-- Timetable Screen -->
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Timetable - Collez</title>
<!-- Google Fonts & Material Symbols -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&amp;family=Space+Grotesk:wght@700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Config from Design System -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "outline-variant": "#4d4632",
                        "surface-container-high": "#2e2a1e",
                        "on-tertiary-fixed-variant": "#474646",
                        "on-primary-fixed-variant": "#554500",
                        "on-surface": "#eae2cf",
                        "on-primary-fixed": "#231b00",
                        "on-surface-variant": "#d0c6ab",
                        "surface-container-lowest": "#110e05",
                        "surface-bright": "#3d392c",
                        "error": "#ffb4ab",
                        "primary-fixed-dim": "#ebc300",
                        "primary-fixed": "#ffe177",
                        "tertiary-fixed": "#e5e2e1",
                        "tertiary-container": "#dad7d6",
                        "on-primary": "#3b2f00",
                        "background": "#161309",
                        "on-tertiary-fixed": "#1c1b1b",
                        "outline": "#999077",
                        "on-secondary": "#3d0090",
                        "on-tertiary-container": "#5e5d5d",
                        "surface-variant": "#393428",
                        "surface-dim": "#161309",
                        "surface-container-highest": "#393428",
                        "secondary-container": "#6b03f1",
                        "on-secondary-fixed": "#24005b",
                        "primary": "#fff3d6",
                        "tertiary-fixed-dim": "#c8c6c5",
                        "error-container": "#93000a",
                        "inverse-primary": "#715d00",
                        "on-tertiary": "#313030",
                        "on-primary-container": "#705c00",
                        "on-secondary-container": "#d7c4ff",
                        "surface-container": "#231f14",
                        "surface-container-low": "#1f1b10",
                        "secondary": "#d1bcff",
                        "inverse-surface": "#eae2cf",
                        "secondary-fixed": "#eaddff",
                        "surface-tint": "#ebc300",
                        "on-error": "#690005",
                        "tertiary": "#f7f3f3",
                        "on-background": "#eae2cf",
                        "on-error-container": "#ffdad6",
                        "surface": "#161309",
                        "primary-container": "#ffd400",
                        "inverse-on-surface": "#343024",
                        "on-secondary-fixed-variant": "#5800c8",
                        "secondary-fixed-dim": "#d1bcff"
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    spacing: {
                        "unit": "8px",
                        "container-max": "1440px",
                        "gutter": "24px",
                        "margin-mobile": "20px",
                        "margin-desktop": "64px"
                    },
                    fontFamily: {
                        "display-hero": ["Space Grotesk"],
                        "button-label": ["Space Grotesk"],
                        "body-lg": ["Plus Jakarta Sans"],
                        "body-md": ["Plus Jakarta Sans"],
                        "headline-lg": ["Space Grotesk"],
                        "headline-md": ["Space Grotesk"]
                    },
                    fontSize: {
                        "display-hero": ["72px", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "700" }],
                        "button-label": ["16px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "700" }],
                        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "500" }],
                        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
                        "headline-lg": ["40px", { lineHeight: "1.2", fontWeight: "700" }],
                        "headline-md": ["24px", { lineHeight: "1.2", fontWeight: "700" }]
                    }
                }
            }
        }
    </script>
<style>
        /* Neo-Comic Halftone Pattern */
        .bg-halftone {
            background-color: theme('colors.background');
            background-image: radial-gradient(theme('colors.surface-variant') 2px, transparent 2px);
            background-size: 16px 16px;
        }
        
        /* Bouncy Button Animation Utility */
        .btn-bounce:active {
            transform: translateY(4px);
            box-shadow: 0px 0px 0px 0px #111 !important;
        }

        /* Hide scrollbar for horizontal lists */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-halftone text-on-background min-h-screen pb-24 font-body-md selection:bg-primary-container selection:text-on-primary-container">
<!-- TopAppBar -->
<header class="flex justify-between items-center w-full px-6 h-20 top-0 border-b-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-400 dark:bg-yellow-500 text-black dark:text-black sticky z-40">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full border-[3px] border-black overflow-hidden bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
<img alt="Avatar" class="w-full h-full object-cover" data-alt="close up portrait of a young confident student with vibrant lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFX5dF9ZKx1VKCBwwuFdQ_ThAyULCYeJZdWySLu5mNP4khBsmO8720PmubBkzMzFBqLQ72uRHtvY8Jjmc0XX2CwTinqeo1vHiDB7NMctPslR_4kkBhjj1IQy9Si_FSJFzBnEGYpxPNKutpeO5FiX_NKgk4ifKjl2PO1VRbQw9JzL8NyRvv-1JFek8E5yRoJOaWBXz0LLe0xRkuyITOpTKkfg4JpRNbRp9qj6zYgbJVB7wS5OPFhEIQbIKxn6hd1v4UvCKGo3KFQGU"/>
</div>
<h1 class="font-['Space_Grotesk'] font-black uppercase tracking-tighter text-2xl italic">COLLEZ</h1>
</div>
<div class="flex items-center gap-2 bg-white border-[3px] border-black rounded-full px-4 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-white/90 transition-colors">
<span class="material-symbols-outlined text-[#ff4500]" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
<span class="font-button-label text-button-label text-black">2500 XP</span>
</div>
</header>
<!-- Main Content -->
<main class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-8 pb-12">
<!-- Header Section -->
<div class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
<div>
<h2 class="font-display-hero text-display-hero text-on-background drop-shadow-[4px_4px_0_#111]">TIMETABLE</h2>
<p class="font-body-lg text-body-lg text-on-surface-variant mt-2">Week 12 • Fall Semester</p>
</div>
<!-- Quick Action -->
<button class="btn-bounce flex items-center gap-2 bg-secondary-container text-on-secondary-container border-[3px] border-[#111] px-6 py-3 rounded-xl shadow-[4px_4px_0_0_#111] font-button-label text-button-label uppercase transition-all">
<span class="material-symbols-outlined">add</span>
                Add Event
            </button>
</div>
<!-- Day Selector (Game-like Chips) -->
<div class="flex gap-4 overflow-x-auto no-scrollbar pb-4 mb-6">
<button class="shrink-0 px-6 py-2 rounded-full border-[3px] border-[#111] bg-surface-container-highest text-on-surface font-button-label text-button-label uppercase shadow-[3px_3px_0_0_#111] hover:bg-surface-bright transition-colors">Mon</button>
<button class="shrink-0 px-6 py-2 rounded-full border-[3px] border-[#111] bg-surface-container-highest text-on-surface font-button-label text-button-label uppercase shadow-[3px_3px_0_0_#111] hover:bg-surface-bright transition-colors">Tue</button>
<button class="shrink-0 px-6 py-2 rounded-full border-[3px] border-[#111] bg-primary-container text-on-primary-container font-button-label text-button-label uppercase shadow-[3px_3px_0_0_#111] relative overflow-hidden">
<div class="absolute inset-0 bg-white/20 w-full h-full skew-x-12 translate-x-[-150%]"></div>
                Wed
            </button>
<button class="shrink-0 px-6 py-2 rounded-full border-[3px] border-[#111] bg-surface-container-highest text-on-surface font-button-label text-button-label uppercase shadow-[3px_3px_0_0_#111] hover:bg-surface-bright transition-colors">Thu</button>
<button class="shrink-0 px-6 py-2 rounded-full border-[3px] border-[#111] bg-surface-container-highest text-on-surface font-button-label text-button-label uppercase shadow-[3px_3px_0_0_#111] hover:bg-surface-bright transition-colors">Fri</button>
</div>
<!-- Timetable Grid/List -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<!-- Past Class Card -->
<article class="flex flex-col bg-surface-container-highest border-[3px] border-[#111] rounded-2xl p-6 shadow-[6px_6px_0_0_#111] relative overflow-hidden group hover:-translate-y-1 transition-transform">
<div class="absolute top-0 right-0 w-16 h-16 bg-surface-variant rounded-bl-[100%] opacity-50 z-0"></div>
<div class="flex justify-between items-start mb-4 relative z-10">
<div class="flex items-center gap-2 bg-surface-container-lowest px-3 py-1 rounded-md border-2 border-[#111]">
<span class="material-symbols-outlined text-outline text-sm">schedule</span>
<span class="font-button-label text-sm text-on-surface-variant">08:00 - 09:30</span>
</div>
<span class="bg-surface-variant text-on-surface-variant text-xs font-bold px-2 py-1 border-2 border-[#111] rounded uppercase">Completed</span>
</div>
<h3 class="font-headline-md text-headline-md text-on-surface mb-2 relative z-10">Data Structures</h3>
<div class="flex items-center gap-2 text-on-surface-variant font-body-md mb-6 relative z-10">
<span class="material-symbols-outlined text-lg">location_on</span>
<span>Lab 402</span>
</div>
<div class="mt-auto flex items-center gap-3 relative z-10 pt-4 border-t-2 border-[#111]/30">
<div class="w-8 h-8 rounded-full bg-secondary-container border-2 border-[#111] flex items-center justify-center text-on-secondary-container font-bold text-sm">JS</div>
<span class="font-body-md text-on-surface">Prof. Smith</span>
</div>
</article>
<!-- Next Class Card (Glowing Effect) -->
<article class="flex flex-col bg-surface-container-high border-[3px] border-primary-container rounded-2xl p-6 shadow-[0_0_20px_rgba(255,212,0,0.4),_6px_6px_0_0_#111] relative overflow-hidden transform scale-105 z-10">
<div class="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-transparent pointer-events-none"></div>
<div class="flex justify-between items-start mb-4 relative z-10">
<div class="flex items-center gap-2 bg-primary-container text-on-primary-container px-3 py-1 rounded-md border-2 border-[#111] shadow-[2px_2px_0_0_#111]">
<span class="material-symbols-outlined text-sm">schedule</span>
<span class="font-button-label text-sm">10:00 - 11:30</span>
</div>
<span class="bg-secondary-container text-on-secondary-container text-xs font-bold px-2 py-1 border-2 border-[#111] rounded shadow-[2px_2px_0_0_#111] uppercase animate-pulse">Up Next</span>
</div>
<h3 class="font-headline-md text-headline-md text-primary mb-2 relative z-10">Interactive Media Design</h3>
<div class="flex items-center gap-2 text-on-surface-variant font-body-md mb-6 relative z-10">
<span class="material-symbols-outlined text-lg text-primary-container">location_on</span>
<span>Studio B</span>
</div>
<div class="mt-auto flex items-center gap-3 relative z-10 pt-4 border-t-2 border-primary-container/30">
<div class="w-8 h-8 rounded-full bg-primary-container border-2 border-[#111] flex items-center justify-center text-on-primary-container font-bold text-sm">AL</div>
<span class="font-body-md text-on-surface">Prof. Lee</span>
</div>
</article>
<!-- Today's Class (Hero Yellow Highlight) -->
<article class="flex flex-col bg-primary-container border-[3px] border-[#111] rounded-2xl p-6 shadow-[6px_6px_0_0_#111] relative overflow-hidden group hover:-translate-y-1 transition-transform">
<!-- Inner glossy highlight -->
<div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-50 pointer-events-none"></div>
<div class="flex justify-between items-start mb-4 relative z-10">
<div class="flex items-center gap-2 bg-white text-black px-3 py-1 rounded-md border-2 border-[#111] shadow-[2px_2px_0_0_#111]">
<span class="material-symbols-outlined text-sm">schedule</span>
<span class="font-button-label text-sm">13:00 - 15:00</span>
</div>
<span class="text-black text-xs font-black tracking-widest px-2 py-1 border-2 border-black rounded shadow-[2px_2px_0_0_#111] uppercase bg-white">Important</span>
</div>
<h3 class="font-headline-md text-headline-md text-black mb-2 relative z-10">Cybersecurity Fundamentals</h3>
<div class="flex items-center gap-2 text-black/80 font-body-md font-bold mb-6 relative z-10">
<span class="material-symbols-outlined text-lg">location_on</span>
<span>Main Auditorium</span>
</div>
<div class="mt-auto flex items-center gap-3 relative z-10 pt-4 border-t-2 border-black/20">
<div class="w-8 h-8 rounded-full bg-black border-2 border-[#111] flex items-center justify-center text-primary-container font-bold text-sm">JD</div>
<span class="font-body-md font-bold text-black">Dr. Doe</span>
</div>
</article>
<!-- Future Class Card -->
<article class="flex flex-col bg-surface-container-highest border-[3px] border-[#111] rounded-2xl p-6 shadow-[6px_6px_0_0_#111] relative overflow-hidden group hover:-translate-y-1 transition-transform">
<div class="flex justify-between items-start mb-4 relative z-10">
<div class="flex items-center gap-2 bg-surface-container-lowest px-3 py-1 rounded-md border-2 border-[#111]">
<span class="material-symbols-outlined text-outline text-sm">schedule</span>
<span class="font-button-label text-sm text-on-surface-variant">15:30 - 17:00</span>
</div>
</div>
<h3 class="font-headline-md text-headline-md text-on-surface mb-2 relative z-10">Game Engine Architecture</h3>
<div class="flex items-center gap-2 text-on-surface-variant font-body-md mb-6 relative z-10">
<span class="material-symbols-outlined text-lg">location_on</span>
<span>Lab 101</span>
</div>
<div class="mt-auto flex items-center gap-3 relative z-10 pt-4 border-t-2 border-[#111]/30">
<div class="w-8 h-8 rounded-full bg-[#111] border-2 border-outline-variant flex items-center justify-center text-on-surface font-bold text-sm">VK</div>
<span class="font-body-md text-on-surface">Prof. Kael</span>
</div>
</article>
</div>
</main>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 py-3 bg-white dark:bg-zinc-900 border-t-4 border-black shadow-[0_-4px_0px_0px_rgba(0,0,0,1)] z-50 md:hidden">
<!-- HOME (Active) -->
<a class="flex flex-col items-center gap-1 bg-yellow-400 text-black border-2 border-black rounded-lg scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-2 active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">home</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">HOME</span>
</a>
<!-- TASKS (Inactive) -->
<a class="flex flex-col items-center gap-1 text-zinc-500 grayscale p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined">checklist</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">TASKS</span>
</a>
<!-- VAULT (Inactive) -->
<a class="flex flex-col items-center gap-1 text-zinc-500 grayscale p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined">inventory_2</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">VAULT</span>
</a>
<!-- RANK (Inactive) -->
<a class="flex flex-col items-center gap-1 text-zinc-500 grayscale p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined">leaderboard</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">RANK</span>
</a>
<!-- PROFILE (Inactive) -->
<a class="flex flex-col items-center gap-1 text-zinc-500 grayscale p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg active:scale-95 transition-transform duration-100 ease-in-out" href="#">
<span class="material-symbols-outlined">person</span>
<span class="font-['Space_Grotesk'] font-bold text-[10px] uppercase">PROFILE</span>
</a>
</nav>
</body></html>
