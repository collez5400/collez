# COLLEZ — PLAN CHECKER 📋

> **The single source of truth for development progress.**
> Reference: [implementation_plan.md](./implementation_plan.md)

---

## 🔒 RULES (Read This First — Every Chat)

> [!CAUTION]
> **These rules are MANDATORY for every development session. Read before writing a single line of code.**

### Rule 1: Always Reference This File
- At the start of every new chat, this `plan_checker.md` is the **first file to read**.
- It tells you **what has been done** and **what to do next**.
- Never skip ahead to a later phase without completing the current one.

### Rule 2: Phase-by-Phase Development
- Work **only on the current active phase** (marked `🔵 IN PROGRESS`).
- Do NOT start the next phase until the current phase is marked `✅ COMPLETE`.
- Within a phase, work step-by-step in the listed order.

### Rule 3: Update After Every Session
- After each development session, update this file:
  - Mark completed steps as `[x]`.
  - Mark in-progress steps as `[/]`.
  - Update the **Session Log** at the bottom.
  - Move the `🔵 IN PROGRESS` marker to the correct phase/step.

### Rule 4: Report at End of Session
- At the end of every chat, provide:
  1. ✅ **What was implemented** (list features/files created or modified)
  2. 🔜 **What's next** (the next step in this plan)
  3. ⚠️ **Blockers or issues** (anything that needs user input)

### Rule 5: Follow the Implementation Plan
- All technical decisions, schema designs, file structures, and UI specs come from `implementation_plan.md`.
- Do NOT deviate from the plan unless the user explicitly approves.

### Rule 6: Quality Over Speed
- Every step must be **complete and tested** before marking it done.
- No placeholder code, no TODO comments left behind, no half-finished screens.

### Rule 7: File Structure Compliance
- Follow the exact **React Native + Expo** project structure defined in the updated implementation plan.
- Every new file goes in the correct directory as specified.

### Rule 8: Tech Stack (LOCKED)
- **Framework**: React Native + Expo (SDK 52+)
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: Expo Router (file-based)
- **Local DB**: expo-sqlite
- **Backend**: Supabase
- **Auth**: Google Sign-In via `@react-native-google-signin/google-signin` → Supabase
- **Styling**: React Native StyleSheet + custom design tokens
- **Admin Dashboard**: Next.js + Supabase + Tailwind CSS (separate web project)

### Rule 9: Commit and Push Upon Completion
- Before replying that the implementation of a phase or part of the plan is completed, you MUST crosscheck it.
- Ensure all files are modified correctly and there are no errors.
- Once verified error-free, you must commit and push all the changes to the repository before marking the phase as `✅ COMPLETE`.

---

## 📊 Progress Overview

| Phase | Name | Status | Progress |
|---|---|---|---|
| 0 | Project Bootstrap | `✅ COMPLETE` | 5/5 |
| 1A | Design System & Shared Components | `✅ COMPLETE` | 8/8 |
| 1B | Authentication & Onboarding | `✅ COMPLETE` | 10/10 |
| 1C | Navigation Shell | `✅ COMPLETE` | 4/4 |
| 1D | Local Features — Timetable | `✅ COMPLETE` | 6/6 |
| 1E | Local Features — Tasks | `✅ COMPLETE` | 6/6 |
| 1F | Local Features — Notes | `🔵 IN PROGRESS` | 0/6 |
| 1G | Local Features — PDF Vault | `⬜ NOT STARTED` | 0/6 |
| 1H | Vault Hub Integration | `⬜ NOT STARTED` | 0/3 |
| 1I | Cloud Features — Streak System | `⬜ NOT STARTED` | 0/5 |
| 1J | Cloud Features — XP & Rank System | `⬜ NOT STARTED` | 0/6 |
| 1K | Cloud Features — Leaderboard | `⬜ NOT STARTED` | 0/5 |
| 1L | Cloud Features — Daily Quote | `⬜ NOT STARTED` | 0/3 |
| 1M | Cloud Features — Profile System | `⬜ NOT STARTED` | 0/5 |
| 1N | Home Dashboard (Full) | `⬜ NOT STARTED` | 0/7 |
| 1O | Cache & Offline System | `⬜ NOT STARTED` | 0/4 |
| 1P | Admin Dashboard (Basic) | `⬜ NOT STARTED` | 0/7 |
| 1Q | Polish, Testing & Launch Prep | `⬜ NOT STARTED` | 0/10 |
| 2A | Friend System | `⬜ NOT STARTED` | 0/6 |
| 2B | Event & Trivia Engine | `⬜ NOT STARTED` | 0/7 |
| 2C | Coordinator System | `⬜ NOT STARTED` | 0/5 |
| 2D | Push Notifications | `⬜ NOT STARTED` | 0/4 |
| 2E | Phase 2 Polish | `⬜ NOT STARTED` | 0/5 |
| 3A | Treasure Hunt Engine | `⬜ NOT STARTED` | 0/5 |
| 3B | Puzzle Rush | `⬜ NOT STARTED` | 0/4 |
| 3C | College Battle System | `⬜ NOT STARTED` | 0/4 |
| 3D | Advanced Features | `⬜ NOT STARTED` | 0/5 |
| 4A | Premium & Monetization | `⬜ NOT STARTED` | 0/6 |
| 4B | Platform Expansion | `⬜ NOT STARTED` | 0/4 |

---

## PHASE 0: Project Bootstrap 🏗️
**Status**: `✅ COMPLETE`
**Estimated Time**: 1 day
**Goal**: Set up a clean Expo project with all dependencies, folder structure, and Supabase project.

### Steps

- [x] **0.1** — Create Expo project
  ```bash
  npx create-expo-app@latest collez-app --template blank-typescript
  ```
  - Target: Android first, iOS later (Phase 4)
  - Min Android SDK: API 26 (Android 8.0)
  - Entry point: `app/` directory (Expo Router file-based routing)

- [x] **0.2** — Set up folder structure
  ```
  collez-app/
  ├── app/                        # Expo Router screens (file-based)
  │   ├── _layout.tsx             # Root layout + nav shell
  │   ├── index.tsx               # Splash/redirect
  │   ├── (auth)/
  │   │   ├── login.tsx
  │   │   └── onboarding/
  │   │       ├── step1.tsx
  │   │       ├── step2.tsx
  │   │       └── step3.tsx
  │   └── (tabs)/
  │       ├── _layout.tsx         # Bottom tab navigator
  │       ├── home.tsx
  │       ├── rankings.tsx
  │       ├── friends.tsx
  │       ├── vault/
  │       │   ├── _layout.tsx     # Top tab navigator
  │       │   ├── timetable.tsx
  │       │   ├── tasks.tsx
  │       │   └── pdfs.tsx
  │       └── profile.tsx
  ├── src/
  │   ├── config/
  │   │   ├── theme.ts            # Design tokens
  │   │   ├── constants.ts        # XP, rank thresholds, etc.
  │   │   └── supabase.ts         # Supabase client
  │   ├── store/                  # Zustand stores
  │   │   ├── authStore.ts
  │   │   ├── userStore.ts
  │   │   ├── streakStore.ts
  │   │   ├── xpStore.ts
  │   │   ├── timetableStore.ts
  │   │   ├── taskStore.ts
  │   │   ├── noteStore.ts
  │   │   ├── vaultStore.ts
  │   │   └── leaderboardStore.ts
  │   ├── services/
  │   │   ├── supabaseService.ts
  │   │   ├── authService.ts
  │   │   ├── streakService.ts
  │   │   ├── xpService.ts
  │   │   └── sqliteService.ts
  │   ├── models/
  │   │   ├── user.ts
  │   │   ├── college.ts
  │   │   ├── streak.ts
  │   │   ├── xp.ts
  │   │   ├── event.ts
  │   │   ├── timetable.ts
  │   │   ├── task.ts
  │   │   ├── note.ts
  │   │   ├── pdf.ts
  │   │   └── friend.ts
  │   ├── utils/
  │   │   ├── dateUtils.ts
  │   │   ├── rankCalculator.ts
  │   │   └── xpCalculator.ts
  │   ├── components/
  │   │   ├── shared/
  │   │   │   ├── GlassCard.tsx
  │   │   │   ├── GradientButton.tsx
  │   │   │   ├── ShimmerLoader.tsx
  │   │   │   ├── BadgeIcon.tsx
  │   │   │   └── BottomNavBar.tsx
  │   │   ├── home/
  │   │   ├── timetable/
  │   │   ├── tasks/
  │   │   ├── notes/
  │   │   ├── vault/
  │   │   ├── leaderboard/
  │   │   └── profile/
  │   └── hooks/
  │       ├── useAuth.ts
  │       ├── useStreak.ts
  │       └── useOffline.ts
  └── assets/
      ├── fonts/
      └── images/
  ```

- [x] **0.3** — Install all Phase 1 dependencies
  ```bash
  npx expo install expo-router expo-sqlite expo-file-system expo-document-picker
  npx expo install expo-secure-store expo-image-picker expo-font expo-splash-screen
  npx expo install @supabase/supabase-js @react-native-google-signin/google-signin
  npx expo install react-native-reanimated react-native-gesture-handler
  npm install zustand @shopify/flash-list react-native-shimmer-placeholder
  npm install react-native-linear-gradient react-native-svg
  npm install dayjs @react-native-async-storage/async-storage
  ```

- [x] **0.4** — Create Supabase project
  - Set up PostgreSQL database at supabase.com
  - Run all SQL CREATE TABLE scripts from implementation plan Section 6
  - Set up Row Level Security (RLS) policies
  - Create materialized views for leaderboards
  - Set up Supabase Storage bucket for profile photos
  - Add Supabase URL + anon key to `.env`

- [x] **0.5** — Configure Firebase project
  - Firebase Analytics (via `@react-native-firebase/analytics`)
  - Firebase Crashlytics (via `@react-native-firebase/crashlytics`)
  - Add `google-services.json` to Android
  - Configure `app.json` with Firebase plugin

---

## PHASE 1A: Design System & Shared Components 🎨
**Status**: `✅ COMPLETE`
**Estimated Time**: 2 days
**Goal**: Build the complete design system so every screen has consistent, premium visuals.
**Reference**: Implementation Plan Section 14 (UI/UX Design System)

### Steps

- [x] **1A.1** — Create `src/config/theme.ts`
  - All color tokens from the design system table
  - Background: `#0B1326`, Surface containers, Primary: `#B4C5FF`, etc.
  - All typography styles (Space Grotesk headlines, Manrope body)
  - Border radius values (16, 32, 48)
  - Shadow styles & gradient definitions
  - Export as `Colors`, `Typography`, `Spacing`, `Shadows` objects

- [x] **1A.2** — Create `src/config/constants.ts`
  - XP values per action (daily login: 2, trivia correct: 5, etc.)
  - Rank tier thresholds (Fresher: 0, Grinder: 100, Scholar: 500, etc.)
  - Streak milestone days (7, 30, 60, 100, 180, 365)
  - Daily XP cap (100)
  - API cache durations (5min, 15min, 24hr)
  - App-wide string constants

- [x] **1A.3** — Create `src/components/shared/GlassCard.tsx`
  - Glassmorphism card using `expo-blur` (`BlurView`)
  - Semi-transparent surface with border
  - Configurable: intensity, border radius, padding, children

- [x] **1A.4** — Create `src/components/shared/GradientButton.tsx`
  - Primary gradient button using `react-native-linear-gradient`
  - Colors: `#B4C5FF` → `#D0BCFF`
  - Full-width option, icon support, loading state (ActivityIndicator)
  - Press animation using `react-native-reanimated`

- [x] **1A.5** — Create `src/components/shared/ShimmerLoader.tsx`
  - Skeleton loading widget using `react-native-shimmer-placeholder`
  - Shimmer with surface colors matching theme
  - Configurable shapes (text line, circle, rectangle, card)

- [x] **1A.6** — Create `src/components/shared/BadgeIcon.tsx`
  - Rank badge renderer (Fresher → National Icon) with color + icon
  - Streak milestone badges (7-day flame → 365-day crown)
  - Coordinator badge variant
  - Configurable size prop

- [x] **1A.7** — Load custom fonts in root `_layout.tsx`
  - Load Space Grotesk (headlines) + Manrope (body) via `expo-font`
  - Hide splash until fonts loaded with `expo-splash-screen`
  - Apply fonts via StyleSheet across all components

- [x] **1A.8** — Create reusable utility hooks
  - `src/hooks/useTheme.ts` — theme shortcuts
  - `src/hooks/useOffline.ts` — connectivity detection via `@react-native-community/netinfo`
  - `src/hooks/useToast.ts` — snackbar/toast helper

---

## PHASE 1B: Authentication & Onboarding 🔐
**Status**: `✅ COMPLETE`
**Estimated Time**: 3 days
**Goal**: Complete auth flow from splash to dashboard.
**Reference**: Screens 1-6 in Section 14, Journey 1 in Section 4

### Steps

- [x] **1B.1** — Create `src/config/supabase.ts`
  - Supabase client initialization with AsyncStorage adapter
  - Export typed Supabase client
  - Error handling wrapper

- [x] **1B.2** — Create `src/services/authService.ts`
  - Google Sign-In flow → Supabase `signInWithIdToken`
  - Session management (check, restore, sign out)
  - Token storage via `expo-secure-store`

- [x] **1B.3** — Create `src/models/user.ts` + `src/models/college.ts`
  - TypeScript interfaces matching `users` and `colleges` table schema
  - Helper functions: `getRankTier(xp)`, `getCollegeScore()`

- [x] **1B.4** — Create `src/store/authStore.ts` (Zustand)
  - State: `user`, `session`, `status` ('idle' | 'loading' | 'authenticated' | 'onboarding' | 'unauthenticated')
  - Actions: `signIn()`, `signOut()`, `restoreSession()`, `completeOnboarding()`

- [x] **1B.5** — Create `app/index.tsx` — Splash Screen
  - Deep navy background (`#0B1326`)
  - COLLEZ logo centered with glow effect (via shadow + blur)
  - Gradient text "COLLEZ" using `react-native-linear-gradient` + masked text
  - Subtitle: "The Kinetic Scholar"
  - Animated loading bar at bottom
  - Auto-redirect: `authenticated` → `/home`, else → `/login`

- [x] **1B.6** — Create `app/(auth)/login.tsx` — Login Screen
  - Animated ambient background blobs (Animated API)
  - Glassmorphic card (BlurView)
  - "Welcome to COLLEZ" headline (Space Grotesk bold)
  - Google Sign-In button (pill-shaped, Google SVG icon via `react-native-svg`)
  - Legal footer (Terms + Privacy links)

- [x] **1B.7** — Create `app/(auth)/onboarding/step1.tsx` — Profile Setup
  - Progress bar (1/3) using Reanimated width animation
  - Avatar upload circle (dashed border, camera icon) via `expo-image-picker`
  - Full Name TextInput with person icon
  - Username TextInput with @ prefix and validation
  - "Continue" GradientButton

- [x] **1B.8** — Create `app/(auth)/onboarding/step2.tsx` — College Selection
  - Progress bar (2/3)
  - "Find Your Campus" headline
  - Search TextInput with search icon
  - FlatList of college cards (name, city, student count) from Supabase
  - "Request New College" → opens bottom sheet form
  - College request form: name, city, state Picker dropdown
  - "Pending" state screen

- [x] **1B.9** — Create `app/(auth)/onboarding/step3.tsx` — Complete
  - Progress bar (3/3)
  - Confetti animation using `react-native-reanimated`
  - "You're all set!" headline
  - Summary card (Name, Username, College)
  - "Enter COLLEZ" GradientButton → navigate to `/(tabs)/home`
  - Auto-create streak Day 1 + award +2 XP

- [x] **1B.10** — Wire auth redirect in `app/_layout.tsx`
  - Root layout checks `authStore.status` on mount
  - Redirect logic: unauthenticated → `/(auth)/login`, onboarding → step1, authenticated → `/(tabs)/home`
  - Protect tab routes from unauthenticated access

---

## PHASE 1C: Navigation Shell 🧭
**Status**: `✅ COMPLETE`
**Estimated Time**: 1 day
**Goal**: Set up Expo Router file-based navigation with custom bottom tab bar.
**Reference**: Section 15 (Navigation System)

### Steps

- [x] **1C.1** — Create `app/(tabs)/_layout.tsx` — Bottom Tab Navigator
  - Custom `tabBar` component using the shared BottomNavBar component
  - 5 tabs: Home, Rankings, Friends, Vault, Profile
  - Active tab icon filled vs outline (Material Icons via `@expo/vector-icons`)
  - Active indicator with gradient underline

- [x] **1C.2** — Create `app/(tabs)/vault/_layout.tsx` — Vault Top Tab Navigator
  - Top tab bar with 3 tabs: Timetable | Tasks & Notes | PDFs
  - Active tab indicator animation using Reanimated

- [x] **1C.3** — Implement smooth screen transitions
  - Slide transitions between auth → main screens
  - Fade transitions between tabs
  - Bottom sheet modals for add/edit actions

- [x] **1C.4** — Set up root `app/_layout.tsx` initialization
  - Load fonts (expo-font)
  - Initialize Supabase session
  - Initialize SQLite DB (all tables)
  - Hide splash screen once ready

---

## PHASE 1D: Local Features — Timetable 📅
**Status**: `✅ COMPLETE`
**Estimated Time**: 3 days
**Goal**: Complete timetable system with full CRUD operations.
**Reference**: Section 3.2, Screen 8-9, SQLite Schema 7.1

### Steps

- [x] **1D.1** — Create `src/services/sqliteService.ts`
  - Initialize expo-sqlite database
  - Create all local tables from implementation plan Section 7
  - Migration system (version-based)
  - Generic typed query helpers

- [x] **1D.2** — Create `src/models/timetable.ts`
  - `TimetableEntry` TypeScript interface matching SQLite schema
  - `DayOfWeek` enum (0=Mon … 5=Sat)
  - `ColorLabel` enum (6 preset colors with hex values)

- [x] **1D.3** — Create `src/store/timetableStore.ts` (Zustand)
  - State: `entries` (keyed by day), `selectedDay`
  - Actions: `addEntry`, `updateEntry`, `deleteEntry`, `reorderEntries`, `duplicateDay`, `resetSemester`
  - Persist to expo-sqlite on every mutation

- [x] **1D.4** — Create `app/(tabs)/vault/timetable.tsx` — Timetable Screen
  - Day selector: horizontal ScrollView with pill buttons (Mon-Sat)
  - Active day highlighted with primary color + border
  - Vertical timeline layout using FlatList
  - Time labels left, colored dots + cards right
  - Break indicators with dashed lines
  - FAB: "+" to open Add Subject bottom sheet
  - Empty state when no classes for the day

- [x] **1D.5** — Create `src/components/timetable/AddSubjectSheet.tsx`
  - Bottom sheet modal (react-native-reanimated bottom sheet)
  - Subject Name TextInput
  - Start/End Time pickers side by side
  - Color selector: 6 colored circles with check mark overlay
  - "Save Subject" GradientButton
  - Pre-filled in edit mode

- [x] **1D.6** — Implement advanced timetable features
  - Drag & drop reorder using `react-native-draggable-flatlist`
  - Duplicate day: copy all entries from selected day to another
  - Semester reset: clear all with confirmation Alert
  - Swipe-to-delete on entry cards

---

## PHASE 1E: Local Features — Tasks 📋
**Status**: `✅ COMPLETE`
**Estimated Time**: 3 days
**Goal**: Complete task management system.
**Reference**: Section 3.3 (Tasks), Screen 10, SQLite Schema 7.2-7.3

### Steps

- [x] **1E.1** — Create `src/models/task.ts`
  - `Task` TypeScript interface matching SQLite schema
  - `TaskCategory` enum ('study' | 'personal' | 'college')
  - `TaskFolder` interface

- [x] **1E.2** — Create `src/store/taskStore.ts` (Zustand)
  - State: `tasks`, `folders`, `activeFilter`, `searchQuery`
  - Actions: `addTask`, `updateTask`, `deleteTask`, `toggleComplete`, `togglePin`, `archiveTask`
  - Actions: `addFolder`, `renameFolder`, `deleteFolder`, `moveTask`
  - Persist to expo-sqlite

- [x] **1E.3** — Create `app/(tabs)/vault/tasks.tsx` — Tasks Screen
  - Header: "Your Tasks" + animated progress circle (Reanimated)
  - Category filter pills (ScrollView, All/Study/Personal/College)
  - Task cards using `@shopify/flash-list` for performance
  - Urgent tasks: red left border, warning icon
  - Completed: faded, strikethrough text, filled checkmark
  - FAB: "+" to open Add Task sheet

- [x] **1E.4** — Create `src/components/tasks/AddTaskSheet.tsx`
  - Title TextInput
  - Description TextInput (optional, multiline)
  - Category selector (color-coded chip row)
  - Due date DateTimePicker
  - Folder selector dropdown
  - "Save Task" GradientButton

- [x] **1E.5** — Implement task folders
  - Folder management bottom sheet
  - Create, rename, delete folders
  - Move tasks between folders
  - Folder view with task counts

- [x] **1E.6** — Task polish features
  - Checkbox completion animation (Reanimated strikethrough)
  - Pin to top (sorted first in list)
  - Archive tab in tasks screen
  - Search bar with live filtering
  - Empty states for all filter states

---

## PHASE 1F: Local Features — Notes 📝
**Status**: `🔵 IN PROGRESS`
**Estimated Time**: 3 days
**Goal**: Complete note-taking system.
**Reference**: Section 3.3 (Notes), Screens 11-12, SQLite Schema 7.4-7.5

### Steps

- [ ] **1F.1** — Create `src/models/note.ts`
  - `Note` TypeScript interface matching SQLite schema
  - `NoteFolder` interface

- [ ] **1F.2** — Create `src/store/noteStore.ts` (Zustand)
  - State: `notes`, `folders`, `activeTab`, `searchQuery`
  - Actions: `addNote`, `updateNote`, `deleteNote`, `togglePin`, `archiveNote`
  - Actions: `addFolder`, `renameFolder`, `deleteFolder`
  - Persist to expo-sqlite

- [ ] **1F.3** — Create `app/(tabs)/vault/tasks.tsx` notes section + list screen
  - Header: "My Notes" + search TextInput
  - Navigation pills: All | Pinned | Subjects (horizontal ScrollView)
  - Pinned section: GlassCard with subject tag, title, body preview
  - Recent Notes section: lighter cards
  - FAB: "+" to navigate to note editor

- [ ] **1F.4** — Create `src/components/notes/NoteEditor.tsx` — Note Editor Screen
  - Back button + Save button in header
  - Title TextInput (large, bold, Space Grotesk)
  - Subject tag selector (chip row)
  - Body TextInput (multiline, basic markdown — bold/italic via toolbar)
  - Pin toggle in header toolbar

- [ ] **1F.5** — Implement note folders
  - Create, rename, delete note folders
  - Folder filter in notes screen

- [ ] **1F.6** — Note polish features
  - Full-text search (filter notes by title + body)
  - Sort options: by date, subject, pinned
  - Archive / soft delete
  - Empty states for each section/filter

---

## PHASE 1G: Local Features — PDF Vault 📄
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 3 days
**Goal**: Complete PDF management system.
**Reference**: Section 3.4, Screen 13, SQLite Schema 7.6-7.7

### Steps

- [ ] **1G.1** — Create `src/models/pdf.ts`
  - `PdfFile` TypeScript interface matching SQLite schema
  - `PdfFolder` interface (with `parentFolderId` for nesting)

- [ ] **1G.2** — Create `src/store/vaultStore.ts` (Zustand)
  - State: `files`, `folders`, `recentFiles`, `currentFolderId`, `searchQuery`
  - Actions: `addFile`, `renameFile`, `moveFile`, `deleteFile`, `trackAccess`
  - Actions: `addFolder`, `renameFolder`, `deleteFolder`
  - Storage size calculation using `expo-file-system`
  - Persist metadata to expo-sqlite

- [ ] **1G.3** — Create `app/(tabs)/vault/pdfs.tsx` — PDF Vault Screen
  - Header: "Vault" (gradient text via LinearGradient mask) + search bar
  - Storage usage progress bar (expo-file-system `getFreeDiskStorageAsync`)
  - Upload gradient card button
  - Folders grid (2-column FlatList)
  - "New Folder" card (dashed border + add icon)
  - Recent Documents FlatList
  - FAB: Upload PDF

- [ ] **1G.4** — Implement file operations
  - File picker via `expo-document-picker` (PDF filter)
  - Copy file to app documents directory via `expo-file-system`
  - Open PDF via `expo-sharing` or `Linking.openURL`
  - Rename with Alert prompt
  - Delete with confirmation Alert

- [ ] **1G.5** — Implement folder navigation
  - Nested folder view (breadcrumb header)
  - Folder types: Semester, Subject, PYQ, Books, Notes, Important, Custom
  - Move files between folders via action sheet

- [ ] **1G.6** — Vault polish
  - Filename search (live filter)
  - Storage display in MB/GB
  - Empty states (no files, no folders)
  - Sort by date, name, size

---

## PHASE 1H: Vault Hub Integration 🗂️
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 1 day
**Goal**: Unify Timetable, Tasks+Notes, and PDFs under the "Vault" tab.
**Reference**: Section 15 (Vault Hub Sub-Navigation)

### Steps

- [ ] **1H.1** — Create `app/(tabs)/vault/_layout.tsx` — Top Tab Navigator
  - Three tabs: Timetable | Tasks & Notes | PDFs
  - Animated active tab indicator with gradient underline
  - Material top tabs style using Reanimated

- [ ] **1H.2** — Wire existing screens into tabs
  - Timetable in first tab
  - Combined Tasks + Notes toggle view in second tab
  - PDF Vault in third tab
  - State preserved when switching tabs

- [ ] **1H.3** — Integration test
  - Bottom nav "Vault" → Top tabs → Screens → Modals
  - Back navigation stack correct
  - No state loss on tab switch

---

## PHASE 1I: Cloud Features — Streak System 🔥
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 2 days
**Goal**: Daily streak tracking with milestone badges.
**Reference**: Section 3.5, Section 8 (Sync Strategy for Streak)

### Steps

- [ ] **1I.1** — Create `src/services/streakService.ts`
  - Check if streak logged today (AsyncStorage flag `streak_logged_[date]`)
  - POST to Supabase `streak_logs` table
  - Increment `streak_count` in `users` table
  - Detect milestone badges (7, 30, 60, 100, 180, 365 days)
  - Insert into `badges` table on milestone
  - Handle midnight IST rollover (use `dayjs` + `Asia/Kolkata` timezone)

- [ ] **1I.2** — Create `src/models/streak.ts`
  - `StreakData` interface (count, lastActiveDate, longestStreak)
  - `StreakMilestone` type with day + badge name + icon mapping

- [ ] **1I.3** — Create `src/store/streakStore.ts` (Zustand)
  - State: `streakCount`, `isLoggedToday`, `longestStreak`, `badges`
  - Actions: `logStreakAction(actionType)`, `fetchStreakData()`

- [ ] **1I.4** — Hook streak into qualifying actions
  - App foreground (AppState: active for >5s) → logStreakAction('app_open')
  - Timetable screen mount → logStreakAction('timetable_view')
  - Task marked complete → logStreakAction('task_complete')
  - Leaderboard screen mount → logStreakAction('leaderboard_view')
  - Quote card viewed → logStreakAction('quote_read')

- [ ] **1I.5** — Streak UI components
  - Streak stat pill on dashboard (🔥 + count, Reanimated count-up)
  - Milestone badge celebration modal (Reanimated scale + fade)
  - Streak display on profile screen

---

## PHASE 1J: Cloud Features — XP & Rank System ⚡
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 3 days
**Goal**: Server-side XP system with rank tiers.
**Reference**: Section 11 (XP + Rank Math), Section 8 (Sync Strategy for XP)

### Steps

- [ ] **1J.1** — Create Supabase Edge Functions (Deno/TypeScript)
  - `award-xp`: validate source, check daily cap, insert xp_transaction, update user.xp + daily_xp_earned + college.total_xp
  - `reset-daily-xp` (pg_cron): reset `daily_xp_earned` at midnight IST
  - `refresh-leaderboard` (pg_cron): refresh materialized views every 15 min

- [ ] **1J.2** — Create `src/services/xpService.ts`
  - Call `award-xp` Edge Function (never direct Supabase insert)
  - Handle daily cap response from server
  - Update local store after server confirms XP

- [ ] **1J.3** — Create `src/models/xp.ts`
  - `XpTransaction` interface
  - `XpSource` union type ('daily_login' | 'trivia' | 'treasure_hunt' | 'event' | 'weekly_streak' | 'bonus')

- [ ] **1J.4** — Create `src/utils/rankCalculator.ts`
  - `getRankTier(xp: number): RankTier` — all 9 tiers
  - `getRankMeta(tier: RankTier)` — name, color, icon, threshold
  - `xpToNextRank(xp: number): number` — XP remaining

- [ ] **1J.5** — Create `src/utils/xpCalculator.ts`
  - College score: `SUM(studentXP) / Math.sqrt(studentCount)`
  - Daily cap enforcement: `Math.min(earned, 100 - dailyEarned)`

- [ ] **1J.6** — XP/Rank UI components
  - XP stat pill on dashboard (⚡ + Reanimated count-up)
  - Rank badge (BadgeIcon component + tier label)
  - XP progress bar to next rank (Reanimated width animation)
  - "+2 XP" toast notification on daily login

---

## PHASE 1K: Cloud Features — Leaderboard 🏆
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 3 days
**Goal**: College, National, and Weekly leaderboards.
**Reference**: Screen 14, Section 6.13 (Materialized Views)

### Steps

- [ ] **1K.1** — Create `src/store/leaderboardStore.ts` (Zustand)
  - State: `collegeBoard`, `nationalBoard`, `weeklyBoard`, `userCollegeRank`
  - Actions: `fetchCollegeBoard`, `fetchNationalBoard`, `fetchWeeklyBoard`
  - Pagination: 20 items per page (cursor-based)
  - Cache: 15 min via AsyncStorage timestamp check

- [ ] **1K.2** — Create `app/(tabs)/rankings.tsx` — Leaderboard Screen
  - Tab system: College | National | Weekly (top tab bar)
  - User's own rank card highlighed and sticky at top
  - FlashList for rank rows (rank #, avatar, name, college, XP, streak badge)
  - Current user row: different background color
  - Pull to refresh

- [ ] **1K.3** — Leaderboard components
  - `RankRow.tsx` — reusable rank list item
  - `UserRankCard.tsx` — sticky user rank summary card
  - Rank number styling: 🥇🥈🥉 for top 3, plain number for rest

- [ ] **1K.4** — Create `src/components/home/LeaderboardMini.tsx`
  - Compact rank card for dashboard
  - Shows user's college rank #
  - Circular rank progress visualization
  - Tap → navigate to full rankings tab

- [ ] **1K.5** — Test leaderboard with seed data
  - Seed 10+ test users in Supabase
  - Verify materialized view refreshes correctly
  - Test pagination, pull-to-refresh, caching

---

## PHASE 1L: Cloud Features — Daily Quote 💬
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 1 day
**Goal**: Admin-uploaded daily quote displayed on dashboard.
**Reference**: Section 6.8 (quotes table), Section 8 (API calls)

### Steps

- [ ] **1L.1** — Create quote service
  - Fetch today's quote from Supabase `quotes` table (`WHERE scheduled_date = TODAY`)
  - 24-hour cache key in AsyncStorage
  - Fallback quote if none scheduled

- [ ] **1L.2** — Create `src/components/home/QuoteCard.tsx`
  - Large quote text with decorative quotation icon
  - Author attribution line
  - GlassCard style
  - `onLayout` / `onViewableItemsChanged` to trigger streak action ('quote_read')

- [ ] **1L.3** — Seed initial quotes in Supabase
  - Upload 30 days of motivational quotes via SQL INSERT or admin CSV
  - Confirm `scheduled_date` is set daily

---

## PHASE 1M: Cloud Features — Profile System 👤
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 2 days
**Goal**: User profile view and edit with all stats displayed.
**Reference**: Section 3.8, Screens 16-17

### Steps

- [ ] **1M.1** — Create `src/store/userStore.ts` (Zustand)
  - State: `profile` (full user data), `badges`
  - Actions: `fetchProfile()`, `updateProfile(data)`, `uploadAvatar(uri)`
  - Username change gate: check `updated_at` > 30 days

- [ ] **1M.2** — Create `app/(tabs)/profile.tsx` — Own Profile Screen
  - Large avatar with edit overlay (ImageBackground + TouchableOpacity)
  - Name, username, college name
  - Stats row: Rank badge, XP count, Streak count (3-column)
  - Badges grid (earned badges via BadgeIcon, FlatList 4-col)
  - Coordinator badge special section (if applicable)
  - Edit Profile, Settings, Logout buttons

- [ ] **1M.3** — Create Edit Profile bottom sheet / screen
  - Avatar: `expo-image-picker` → upload to Supabase Storage → update `avatar_url`
  - Name TextInput
  - Username TextInput (show restriction notice if <30 days)
  - "Save" GradientButton → updateProfile()

- [ ] **1M.4** — Create Settings Screen
  - Edit Name, Edit Username
  - Change College (info: requires admin)
  - About COLLEZ, Terms of Service, Privacy Policy links
  - Delete Account (with confirmation)
  - App version display (`expo-constants`)

- [ ] **1M.5** — Create Other User Profile Screen `app/profile/[id].tsx`
  - Same layout, data fetched by user ID
  - "Add Friend" / "Friends" / "Pending" button (inactive until Phase 2)
  - No settings/logout
  - "Report User" in 3-dot overflow menu

---

## PHASE 1N: Home Dashboard (Full) 🏠
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 4 days
**Goal**: Assemble the complete dashboard with all cards and data sources.
**Reference**: Section 3.1, Screen 7

### Steps

- [ ] **1N.1** — Create `src/components/home/GreetingHeader.tsx`
  - Time-aware greeting ("Good Morning, [Name]!") using `dayjs`
  - Profile avatar (left), COLLEZ branding (center), ⚡ icon button (right)
  - Avatar navigates to own profile

- [ ] **1N.2** — Create `src/components/home/StatPills.tsx`
  - Horizontal ScrollView of stat pills: 🔥 Streak | ⚡ XP | 🏅 Rank
  - Reanimated count-up numbers
  - Each pill navigates to relevant tab

- [ ] **1N.3** — Create `src/components/home/EventBanner.tsx`
  - Full-width rounded ImageBackground card
  - "LIVE" badge (blinking Reanimated animation)
  - Event title + CTA "Join Now" button
  - Hidden with `display: 'none'` if no active event

- [ ] **1N.4** — Create `src/components/home/TimetableCard.tsx`
  - Next 2 upcoming classes from timetableStore
  - Subject name, time range, color-coded left border
  - "No classes today" empty state
  - Navigate to timetable tab on tap

- [ ] **1N.5** — Create `src/components/home/TasksCard.tsx`
  - Active tasks count + LinearGradient progress bar
  - First 2 uncompleted tasks preview
  - Tap → navigate to tasks tab

- [ ] **1N.6** — Create `src/components/home/QuickActions.tsx`
  - 2×2 grid of action buttons (GlassCard style)
  - Add Task | Quick Note | Upload PDF | Customize
  - Each triggers navigation or bottom sheet

- [ ] **1N.7** — Create `app/(tabs)/home.tsx` — Home Screen
  - ScrollView assembling all components
  - Bento-style grid layout using absolute sizing
  - Loading strategy: local store instant, cloud fetch async, show ShimmerLoader for cloud cards
  - Pull to refresh triggers all cloud fetches

---

## PHASE 1O: Cache & Offline System 💾
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 2 days
**Goal**: Ensure app works offline and loads instantly.
**Reference**: Section 7.8 (app_cache), Section 8 (API/Sync Strategy)

### Steps

- [ ] **1O.1** — Implement SQLite `app_cache` table
  - Cache user profile, XP, streak, quote, event data
  - `key TEXT, value TEXT (JSON), expires_at TEXT`
  - Load on app start for instant render before cloud fetch

- [ ] **1O.2** — Conditional fetching in all stores
  - Check `last_fetched_at` in AsyncStorage before API calls
  - Skip if within cache duration (5min, 15min, 24hr per data type)
  - Force refresh on pull-to-refresh

- [ ] **1O.3** — Offline detection
  - `useOffline` hook using `@react-native-community/netinfo`
  - Banner shown when offline ("You're offline — showing cached data")
  - All API calls wrapped with try/catch → fallback to cache

- [ ] **1O.4** — Test offline scenarios
  - Open in airplane mode → local data shown instantly
  - Cloud cards show last-known cached values
  - No crashes, no blank screens on API failures

---

## PHASE 1P: Admin Dashboard (Basic) 🖥️
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 4 days
**Goal**: Web admin dashboard for managing users, colleges, and quotes.
**Reference**: Section 10

### Steps

- [ ] **1P.1** — Create Next.js project (separate `collez-admin/` directory)
  ```bash
  npx create-next-app@latest collez-admin --typescript --tailwind --app
  ```
  - Deploy on Vercel (free tier)
  - Supabase client (service role key — server-side only)
  - Protected: founder email only via Supabase Auth

- [ ] **1P.2** — Create Overview page (`/dashboard`)
  - Stats cards: total users, new today/week, DAU, total XP, active events
  - Pending actions list: college approvals, coordinator applications, reports

- [ ] **1P.3** — Create Users Management (`/dashboard/users`)
  - Search by name, username, email, college
  - User detail modal: XP history, streak, badges
  - Actions: ban/unban, soft delete (graduate), edit profile, reset XP, feature

- [ ] **1P.4** — Create Colleges Management (`/dashboard/colleges`)
  - List pending colleges with approve / reject actions
  - Merge duplicate colleges (move all users, delete duplicate)
  - Rename, disable
  - Stats: student count, total XP

- [ ] **1P.5** — Create Quotes Management (`/dashboard/quotes`)
  - Add single quote: text, author, scheduled_date DatePicker
  - Bulk CSV upload for scheduling multiple days
  - View calendar of scheduled quotes

- [ ] **1P.6** — Create Bonus XP page (`/dashboard/bonus`)
  - User search → select user(s)
  - Amount + reason fields
  - Submit → calls Supabase service-role to insert XP transaction

- [ ] **1P.7** — Test admin dashboard
  - All CRUD operations work end-to-end
  - RLS + service role correctly bypasses restrictions
  - Auth gate works (only founder email can access)

---

## PHASE 1Q: Polish, Testing & Launch Prep 🚀
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 5 days
**Goal**: Bug fixes, performance optimization, Play Store submission via EAS.
**Reference**: Sections 17, 22, 24 (Weeks 7-8)

### Steps

- [ ] **1Q.1** — Empty states for all screens
  - First-time guided prompts (animated arrows/illustrations)
  - "No data" illustrations and messages
  - Zero-result search states

- [ ] **1Q.2** — Error handling everywhere
  - Network error views with "Retry" button
  - API error handling → fallback to cache
  - Global error boundary component

- [ ] **1Q.3** — Performance optimization
  - FlashList for all long lists (replace ScrollView + map)
  - `React.memo` on expensive components
  - Reanimated `useSharedValue` for all animations (no JS thread)
  - Image caching via `expo-image`

- [ ] **1Q.4** — APK size audit
  - Enable Expo `assetBundlingMode: "optimized"`
  - Remove unused packages
  - Font subsetting (Latin only for Space Grotesk + Manrope)
  - Target: < 25MB APK (React Native is larger than Flutter)

- [ ] **1Q.5** — Device testing
  - Test on low-end Android (2GB RAM, Android 8)
  - Test on mid-range, high-end
  - Test on 3G / slow network

- [ ] **1Q.6** — Edge cases
  - IST timezone handling via `dayjs.tz()`
  - Streak midnight rollover
  - Username 30-day change restriction
  - App moving to background / foreground (AppState)

- [ ] **1Q.7** — Accessibility basics
  - `accessibilityLabel` on all interactive elements
  - Font scale support (`allowFontScaling`)
  - Contrast ratios for text on dark background

- [ ] **1Q.8** — Legal pages
  - Privacy Policy screen in Settings
  - Terms of Service screen in Settings
  - Web versions hosted (simple HTML on Vercel)

- [ ] **1Q.9** — EAS Build setup + Play Store listing
  - `eas.json` config for production build
  - `app.json` with correct package name, version, icons
  - Play Store: screenshots, description, feature graphic, content rating

- [ ] **1Q.10** — Final testing + release
  - Full regression test all user journeys
  - EAS Build → Internal Testing → 10 beta users → fix critical bugs → Production 🚀

---

## PHASE 2A: Friend System 👥
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 4 days
**Goal**: Send/accept friend requests, view friend profiles.
**Reference**: Section 3.6, Screen 15, Schema 6.5-6.6

### Steps

- [ ] **2A.1** — Friend models + store
  - `FriendRequest` + `Friendship` TypeScript interfaces
  - `src/store/friendStore.ts`: send, accept, reject, remove, list
  - Supabase RLS: users can only read/write their own friend data

- [ ] **2A.2** — Create `app/(tabs)/friends.tsx` — Friends Screen
  - Search bar (username lookup)
  - Pending section: request cards with Accept/Reject buttons
  - Friends list: avatar, name, college, streak badge, "Compare" button
  - Empty state: "No friends yet — invite classmates!"

- [ ] **2A.3** — Integrate friend button on user profiles
  - Fetch friendship status in `app/profile/[id].tsx`
  - Button states: Add Friend | Request Sent | Friends | Accept Request

- [ ] **2A.4** — User search results screen `app/search.tsx`
  - Search Supabase users by username prefix
  - Display results with avatar, name, college, rank badge

- [ ] **2A.5** — Friend profile view enhancements
  - Show shared streak comparison (basic placeholder)
  - Mutual friend count

- [ ] **2A.6** — Test friend system
  - Two test accounts: send/accept/reject/remove flow
  - Duplicate request prevention
  - RLS security tests

---

## PHASE 2B: Event & Trivia Engine 🎮
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 5 days
**Goal**: Live trivia events with scoring and XP rewards.
**Reference**: Section 12 (Event Engine), Screens 18-19

### Steps

- [ ] **2B.1** — Event models + store
  - `Event`, `EventParticipation` TypeScript interfaces
  - `src/store/eventStore.ts`: fetch live/upcoming/past events, join, submit

- [ ] **2B.2** — Create Event List Screen `app/events/index.tsx`
  - Active events (large banner ImageBackground cards)
  - Upcoming events (smaller cards with countdown timers via `dayjs`)
  - Past events (collapsed, shows earned badges)

- [ ] **2B.3** — Create Trivia Screen `app/events/trivia/[id].tsx`
  - Question number progress indicator (3/10)
  - Animated circle countdown timer (15s, Reanimated)
  - Question text, 4 answer option cards
  - Tap to select → lock answer → brief feedback (✅/❌)
  - Submit answer to Supabase incrementally

- [ ] **2B.4** — Trivia results screen
  - Score card (8/10), XP earned, badge if passed
  - XP awarded via `award-xp` Edge Function
  - Badge inserted in `badges` table
  - "Share Score" button

- [ ] **2B.5** — Admin: Event Creator page in admin dashboard
  - Create trivia: title, questions JSON builder, timing, XP, badge name
  - Set event status: upcoming → live → ended

- [ ] **2B.6** — Update EventBanner on home
  - Poll for active event on dashboard load
  - Show live event with correct CTA

- [ ] **2B.7** — End-to-end test
  - Create event in admin → appears on dashboard → join → complete → XP + badge received

---

## PHASE 2C: Coordinator System 🎖️
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 3 days
**Goal**: Coordinator application flow + admin review.
**Reference**: Section 13 (Coordinator Workflow), Schema 6.7

### Steps

- [ ] **2C.1** — Coordinator application screen `app/coordinator/apply.tsx`
  - Eligibility gate: check streak ≥ 30, XP ≥ 100, account age ≥ 30 days
  - Form: name, WhatsApp, email, reason, college ID photo, selfie
  - Submit → `coordinator_applications` table INSERT
  - "Under Review" status screen

- [ ] **2C.2** — Application status component in profile
  - Pending / Approved / Rejected badge
  - "Apply" button visible for eligible users

- [ ] **2C.3** — Admin: Coordinator Review page
  - List pending applications with photos, details
  - Approve → set `users.is_coordinator = true` + insert badge
  - Reject → update status + store rejection reason

- [ ] **2C.4** — Coordinator badge on profile
  - Show "Official College Coordinator" tag
  - Special badge icon in BadgeIcon component
  - Featured in leaderboard rows

- [ ] **2C.5** — Test coordinator flow end-to-end
  - Apply as eligible user → admin approves → badge appears

---

## PHASE 2D: Push Notifications 🔔
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 3 days
**Goal**: FCM push notifications for streaks and events.
**Reference**: Section 20 (Retention Loops)

### Steps

- [ ] **2D.1** — Set up Expo Push Notifications
  - `expo-notifications` configuration
  - Request permissions on first login
  - Store Expo push token in Supabase `users.push_token`

- [ ] **2D.2** — Streak reminder notifications
  - Supabase Edge Function (daily cron): find users with `last_active_date = 2 days ago` → send push
  - 7-day inactive: "You've dropped X ranks!" push
  - Use Expo Push API from server

- [ ] **2D.3** — Event notifications
  - When event status changes to 'live' → send push to all users
  - "Event ends in 2 hours" cron push

- [ ] **2D.4** — Test notification delivery
  - Android notification channels setup
  - Deep link from notification → correct app screen
  - Notification preferences toggle in Settings

---

## PHASE 2E: Phase 2 Polish ✨
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 3 days

### Steps

- [ ] **2E.1** — Streak Shield
  - 1-day freeze earned at 30-day milestone
  - Shield icon in streak display, activation tap with confirm sheet
  - Server-side validation in streak Edge Function

- [ ] **2E.2** — City/State leaderboard tabs
  - Add City + State tabs to rankings screen
  - Fetch from additional materialized views or filtered queries

- [ ] **2E.3** — Performance audit pass
  - Profile all screens with Flipper / React DevTools
  - Fix any remaining jank (JS thread blocking)
  - Optimize re-renders with Zustand selectors

- [ ] **2E.4** — Phase 2 integration testing
  - Full regression: all Phase 1 + Phase 2 flows
  - Cross-feature tests (trivia XP → leaderboard update → notification)

- [ ] **2E.5** — EAS Update (OTA) for Phase 2 deploy
  - Use `eas update` for JS-only changes
  - Full EAS Build for native changes

---

## PHASE 3A: Treasure Hunt Engine 🗺️
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 5 days
**Reference**: Section 12.3, Screen 20

### Steps

- [ ] **3A.1** — Treasure hunt data model + store
  - Clue types: puzzle | navigate | question | action
  - Progress tracking in `event_participations.progress` JSONB

- [ ] **3A.2** — Create Treasure Hunt Screen `app/events/hunt/[id].tsx`
  - 5-dot step progress indicator
  - Current clue card with puzzle or question
  - Text answer input, "Submit" button
  - Navigation prompt ("Go to Leaderboard screen")
  - Completion celebration (Reanimated confetti)

- [ ] **3A.3** — Puzzle mini-components
  - `SudokuGrid.tsx` — interactive 9×9 grid with input
  - `WordScramble.tsx` — scrambled letters drag-and-drop
  - `MathPuzzle.tsx` — equation solve input

- [ ] **3A.4** — Easter egg elements on screens
  - Hidden tappable icons on Leaderboard, Profile (trigger hunt clues)
  - "Tap rank badge 3x" action listener

- [ ] **3A.5** — Admin: Treasure Hunt Creator
  - JSON-based clue builder in admin dashboard
  - Test hunt functionality before publishing

---

## PHASE 3B: Puzzle Rush 🧩
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 4 days

### Steps

- [ ] **3B.1** — Sudoku mini-game screen
  - Full puzzle grid, number pad input
  - Timer, difficulty levels, validate on complete

- [ ] **3B.2** — Word puzzle screen
  - Word scramble, anagram, or mini-crossword
  - Letter tile UI with drag interaction

- [ ] **3B.3** — Integrate Puzzle Rush event type
  - Max 3 puzzles per day (capped)
  - +10 XP per puzzle completion via Edge Function

- [ ] **3B.4** — Admin: Puzzle Rush event creation
  - Configure puzzle sets (JSON)
  - Set daily puzzle limit

---

## PHASE 3C: College Battle System ⚔️
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 4 days
**Reference**: Section 12.4

### Steps

- [ ] **3C.1** — Battle data model + server logic
  - Battle model in `events` table (battle_type config)
  - Per-college XP tracking during battle window via Edge Function

- [ ] **3C.2** — Battle UI
  - Active battle card on home dashboard
  - Battle ranking screen (colleges vs colleges with XP bars)
  - Live participant count

- [ ] **3C.3** — Battle scoring + prize distribution
  - `total_xp_earned / student_count` formula
  - Winner XP bonus + badge via Edge Function on battle end

- [ ] **3C.4** — Admin: Battle management
  - Create battle, set dates, minimum participants, prizes
  - End battle → trigger reward distribution

---

## PHASE 3D: Advanced Features 🔧
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 5 days

### Steps

- [ ] **3D.1** — Friend XP comparison screen
  - Side-by-side stat comparison card
  - Streak count, XP total, rank tier, badges

- [ ] **3D.2** — Streak marathon events
  - Special 30-day event with bonus XP tracking
  - Progress visible on home banner

- [ ] **3D.3** — City/State coordinator system
  - Admin-only promotion in dashboard
  - City Coordinator role visible on profile + leaderboard

- [ ] **3D.4** — Advanced anti-cheat
  - Velocity checks in Edge Function (>80 XP/hr → flag, >50 XP/5min → block)
  - Weekly cron pattern detection SQL query
  - Admin review queue for flagged accounts

- [ ] **3D.5** — Admin growth tools
  - Featured students list for Instagram exports
  - Email export CSV (with consent field check)
  - Monthly leaderboard with auto-reset trigger

---

## PHASE 4A: Premium & Monetization 💰
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 5 days
**Reference**: Section 16 Phase 4

### Steps

- [ ] **4A.1** — Premium themes (React Native IAP)
  - `expo-in-app-purchases` or `react-native-iap`
  - Theme picker screen with preview
  - Unlocked themes stored in `users.premium_config` JSONB

- [ ] **4A.2** — Animated badge cosmetics
  - Lottie animations via `lottie-react-native`
  - Premium coordinator profile frames

- [ ] **4A.3** — Vault Cloud Sync (Premium)
  - Upload PDFs to Supabase Storage (premium bucket)
  - Cross-device sync via download on login

- [ ] **4A.4** — Referral system
  - Generate unique invite code (stored in users table)
  - On signup with code → bonus XP for both
  - Referral tracking in separate table

- [ ] **4A.5** — Android Home Screen Widget
  - `expo-widgets` or `react-native-android-widget`
  - Shows streak count + next class

- [ ] **4A.6** — Friend Challenge system
  - Create XP challenge (duration, target)
  - Challenge invite → accept → track progress → winner reward

---

## PHASE 4B: Platform Expansion 🌐
**Status**: `⬜ NOT STARTED`
**Estimated Time**: 4 days

### Steps

- [ ] **4B.1** — iOS port + testing
  - Apple Sign-In added (`expo-apple-authentication`) alongside Google
  - iOS-specific UI fixes (safe area, bottom nav height)
  - TestFlight beta testing

- [ ] **4B.2** — App Store submission
  - Screenshots, App Store listing copy
  - Apple reviewer notes

- [ ] **4B.3** — Admin analytics dashboard upgrade
  - DAU/WAU/MAU line charts (using Recharts)
  - Retention funnel visualization
  - College growth heatmap

- [ ] **4B.4** — Feature flags + A/B testing
  - Remote Config via Supabase (config table)
  - Toggle features per user segment from admin

---

## 📝 Session Log

> Track every development session here. Add a new entry after each chat.

| Session # | Date | Phase Worked | Steps Completed | Notes |
|---|---|---|---|---|
| 1 | 2026-04-19 | Setup | Created plan_checker.md + Updated to React Native/Expo stack | Flutter replaced with Expo + Zustand + Expo Router |
| 2 | 2026-04-20 | 1E | Completed 1E.1 to 1E.6 (Tasks model/store/screen/sheet/folders/polish) | Added archive tab, folder manager, task move, search + filters, progress circle |

---

## 🎯 Current Focus

**Active Phase**: `🔵 Phase 1F — Local Features: Notes`
**Next Step**: `1F.1 — Create src/models/note.ts`

---

## 📈 Completion Stats

- **Total Steps**: 198
- **Completed**: 0
- **In Progress**: 0
- **Remaining**: 198
- **Overall Progress**: 0%

---

> [!IMPORTANT]
> **Start every new chat by reading this file.** It is the single source of truth.
> After development, update this file before closing the chat.
> Follow the rules. Build phase by phase. Ship quality code.

---

*Last Updated: 2026-04-19 | Stack: React Native + Expo + TypeScript + Zustand + Supabase*
