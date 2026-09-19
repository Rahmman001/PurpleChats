# WhatsApp Chat Analyzer v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 100% client-side WhatsApp Chat Analyzer featuring zero-knowledge privacy, response latency & ghosting metrics, personality badges, an interactive Spotify-Wrapped story mode with 9:16 image export, and an instant demo mode.

**Architecture:** A modern single-page application built on React 18, Vite, TypeScript, and Tailwind CSS. Chat parsing and analytics calculations are completely offloaded to a dedicated Web Worker to guarantee zero UI stuttering on 50,000+ message logs. DOM-to-image canvas rendering allows instant 1080x1920 story card downloads.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Lucide / Phosphor Icons, Recharts, Canvas-Confetti, html-to-image, fflate, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-19-whatsapp-chat-analyzer-design.md`

## Global Constraints

- 100% client-side execution; zero outbound network calls carrying chat text.
- Dark theme locked (`#080c14` base, emerald accent `#10b981`).
- Anti-slop layout rules: no generic purple gradient blobs, no 3-card identical rows, asymmetric bento layout.
- Hero must fit in desktop initial viewport (`min-h-[100dvh]` with `pt-16` cap).
- All stories with UI changes must be verified in the browser.

---

## File Structure

```
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── chat.ts
│   ├── utils/
│   │   ├── parser.ts
│   │   ├── analytics.ts
│   │   ├── badges.ts
│   │   └── demoData.ts
│   ├── workers/
│   │   └── parseWorker.ts
│   └── components/
│       ├── Navbar.tsx
│       ├── Hero.tsx
│       ├── DropZone.tsx
│       ├── MetricCard.tsx
│       ├── BentoGrid.tsx
│       ├── TimelineChart.tsx
│       ├── HourlyHeatmap.tsx
│       ├── DynamicsLeaderboard.tsx
│       ├── EmojiLeaderboard.tsx
│       ├── ArchetypeCard.tsx
│       ├── ExportGuideModal.tsx
│       └── WrappedStoryModal.tsx
└── tests/
    ├── parser.test.ts
    ├── analytics.test.ts
    └── badges.test.ts
```

---

### Task 1: Project Initialization & Build Pipeline

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/index.css`, `src/App.tsx`
- Test: Build and dev server verification

**Interfaces:**
- Produces: Working React + Vite + Tailwind build environment with dark mode tokens and fonts.

- [ ] **Step 1: Create package.json with dependencies**
Dependencies: `react`, `react-dom`, `recharts`, `lucide-react`, `html-to-image`, `canvas-confetti`, `fflate`. DevDependencies: `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest`.
- [ ] **Step 2: Create Vite, TypeScript, and Tailwind configurations**
- [ ] **Step 3: Create index.html with dark mode metadata and font loading**
- [ ] **Step 4: Create src/index.css with dark slate tokens and glassmorphism utilities**
- [ ] **Step 5: Run `npm install` and verify build with `npm run build`**

---

### Task 2: Core Data Types & Mock Demo Data

**Files:**
- Create: `src/types/chat.ts`
- Create: `src/utils/demoData.ts`
- Test: `tests/demoData.test.ts`

**Interfaces:**
- Produces: `ChatMessage`, `ParsedChatResult`, `ParticipantSummary`, `BadgeProfile`, `DEMO_CHAT_TEXT`

- [ ] **Step 1: Write test verifying demo chat text structure**
Verify `DEMO_CHAT_TEXT` contains multiline messages, iOS & Android timestamps, media markers, and at least 3 chatters.
- [ ] **Step 2: Define strict TypeScript interfaces in `src/types/chat.ts`**
- [ ] **Step 3: Implement `src/utils/demoData.ts` with a rich, realistic conversation log**
- [ ] **Step 4: Run test to verify it passes**

---

### Task 3: WhatsApp Chat Regex Parsing Engine & Unit Tests

**Files:**
- Create: `src/utils/parser.ts`
- Test: `tests/parser.test.ts`

**Interfaces:**
- Consumes: Raw text string
- Produces: `parseWhatsAppChat(rawText: string): ChatMessage[]`

- [ ] **Step 1: Write failing unit test for iOS and Android parsing formats**
Cover:
1. `[12/04/23, 10:14:02 AM] Alex: Hey guys`
2. `12/04/2023, 10:14 - Jordan: Meeting starts in 5`
3. Multi-line message continuation (second line belongs to Jordan)
4. System messages (`Messages and calls are end-to-end encrypted`) filtered out
5. Media omissions (`<Media omitted>`) flagged as `isMedia: true`
- [ ] **Step 2: Run test to verify failure** (`npx vitest run tests/parser.test.ts`)
- [ ] **Step 3: Implement `src/utils/parser.ts` with robust regex tokenizer**
- [ ] **Step 4: Re-run test to verify it passes**

---

### Task 4: Conversational Dynamics & Analytics Engine

**Files:**
- Create: `src/utils/analytics.ts`
- Test: `tests/analytics.test.ts`

**Interfaces:**
- Consumes: `ChatMessage[]`
- Produces: `computeChatAnalytics(messages: ChatMessage[]): ChatAnalytics`

- [ ] **Step 1: Write unit tests for analytics algorithms**
Test:
1. Message and word counts per participant.
2. Response latency calculation (ignoring gaps > 6 hours).
3. Conversation initiator count (messages following silence > 4 hours).
4. Double-text streaks (3+ messages in a row without reply).
5. 24-hour distribution and day-of-week breakdown.
6. Emoji extraction with Unicode compound emoji handling.
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `src/utils/analytics.ts`**
- [ ] **Step 4: Re-run tests to confirm all pass**

---

### Task 5: Personality Archetypes & Badges Engine

**Files:**
- Create: `src/utils/badges.ts`
- Test: `tests/badges.test.ts`

**Interfaces:**
- Consumes: `ParticipantSummary`, `ChatAnalytics`
- Produces: `assignBadges(analytics: ChatAnalytics): Record<string, BadgeProfile[]>`

- [ ] **Step 1: Write unit tests verifying badge criteria**
Test that:
- Participant with most messages between 12 AM - 5 AM receives 🦉 The Night Owl.
- Participant with lowest median reply time receives ⚡ The Quick Draw.
- Participant with highest average words per message receives 📜 The Novelist.
- Participant with highest ratio of "k", "ok", "yes" receives 👍 The One-Worder.
- Participant with highest emoji ratio receives 🎭 The Emoji Addict.
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement `src/utils/badges.ts` with transparent thresholds and humorous descriptions**
- [ ] **Step 4: Re-run tests to confirm all pass**

---

### Task 6: Web Worker Pipeline & Archive Extraction

**Files:**
- Create: `src/workers/parseWorker.ts`
- Create: `src/utils/fileHandler.ts`
- Test: `tests/fileHandler.test.ts`

**Interfaces:**
- Produces: Off-thread file processing handler supporting `.txt` and `.zip` (via `fflate`)

- [ ] **Step 1: Write tests for zip file extraction with mock buffers**
- [ ] **Step 2: Implement Web Worker in `src/workers/parseWorker.ts` combining parser, analytics, and badges**
- [ ] **Step 3: Implement `src/utils/fileHandler.ts` with `FileReader` and worker dispatch**
- [ ] **Step 4: Run tests and verify integration**

---

### Task 7: Hero Section, DropZone & Export Guide

**Files:**
- Create: `src/components/Navbar.tsx`
- Create: `src/components/Hero.tsx`
- Create: `src/components/DropZone.tsx`
- Create: `src/components/ExportGuideModal.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `handleFileUpload(file: File)` and `handleLoadDemo()`
- Produces: Zero-scroll landing viewport with drag-and-drop bay and privacy guarantee

- [ ] **Step 1: Implement `Navbar.tsx` with privacy indicator beacon**
- [ ] **Step 2: Implement `DropZone.tsx` with drag-over animations and file selection**
- [ ] **Step 3: Implement `ExportGuideModal.tsx` with iOS & Android screenshot walkthroughs**
- [ ] **Step 4: Implement `Hero.tsx` with 55/45 desktop split, direct copy, and Demo button**
- [ ] **Step 5: Verify in browser that hero fits initial viewport on 1440x900 and 1920x1080**

---

### Task 8: Deep-Dive Analytics Bento Grid Components

**Files:**
- Create: `src/components/MetricCard.tsx`
- Create: `src/components/TimelineChart.tsx`
- Create: `src/components/HourlyHeatmap.tsx`
- Create: `src/components/DynamicsLeaderboard.tsx`
- Create: `src/components/EmojiLeaderboard.tsx`
- Create: `src/components/ArchetypeCard.tsx`
- Create: `src/components/BentoGrid.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `ChatAnalytics` and `BadgeProfile`
- Produces: Responsive, interactive dark-slate analytics dashboard with Recharts visualizations

- [ ] **Step 1: Build `MetricCard.tsx` with animated counters and trend indicators**
- [ ] **Step 2: Build `TimelineChart.tsx` with Recharts Area/Line chart**
- [ ] **Step 3: Build `HourlyHeatmap.tsx` (24-hour activity clock)**
- [ ] **Step 4: Build `DynamicsLeaderboard.tsx` (response times & ghosting counts)**
- [ ] **Step 5: Build `EmojiLeaderboard.tsx` and `ArchetypeCard.tsx`**
- [ ] **Step 6: Assemble into `BentoGrid.tsx` and integrate with `App.tsx`**
- [ ] **Step 7: Verify in browser with demo data**

---

### Task 9: "WhatsApp Wrapped" Story Player & 9:16 Image Export

**Files:**
- Create: `src/components/WrappedStoryModal.tsx`
- Create: `src/components/StorySlide.tsx`
- Create: `src/utils/exportImage.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `ChatAnalytics`, `BadgeProfile`
- Produces: 6-slide full-screen interactive story player with 1080x1920 PNG card download

- [ ] **Step 1: Build `WrappedStoryModal.tsx` container with segmented timer progress bars and keyboard controls (`Left`, `Right`, `Escape`)**
- [ ] **Step 2: Implement the 6 story slides (Mileage, Megaphone, Peak Day, 3 AM Confessions, Speed & Ghosting, Trophies)**
- [ ] **Step 3: Integrate `canvas-confetti` trigger on final slide**
- [ ] **Step 4: Implement `src/utils/exportImage.ts` using `html-to-image` for 1080x1920 PNG export with optional name anonymizer**
- [ ] **Step 5: Verify story navigation and image export in browser**

---

### Task 10: End-to-End Polish, Performance Audit & Verification

**Files:**
- Modify: `src/App.tsx`, `src/index.css`
- Run: Full test suite and production build

- [ ] **Step 1: Run all unit tests (`npm run test`) and verify 100% pass**
- [ ] **Step 2: Verify production build (`npm run build`) runs with zero TypeScript or bundle errors**
- [ ] **Step 3: Perform network inspection to verify 0 outbound requests with chat data**
- [ ] **Step 4: Test responsiveness on mobile viewports (375px, 414px) and desktop (1440px)**
