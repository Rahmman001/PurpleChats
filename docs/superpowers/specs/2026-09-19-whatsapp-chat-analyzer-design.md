# Design Document: WhatsApp Chat Analyzer v2

> **Design Read**: Consumer social tool & conversational analytics engine for friends, couples, and group chats. High-energy, dark-tech aesthetic fused with a Spotify-Wrapped viral storytelling language. 100% in-browser computation with zero server telemetry.

---

## 1. Anti-Slop Core Directives (Hard Bans)

To guarantee the product feels like high-end, human-crafted software rather than generic AI template output, the following patterns are strictly banned:

| Category | Banned AI Slop Pattern | What We Do Instead |
| :--- | :--- | :--- |
| **Color & Lighting** | Purple/violet radial gradient blobs, ambient neon mesh glows floating behind random cards. | Obsidian slate surfaces (`#080c14`), solid high-contrast borders (`rgba(255,255,255,0.08)`), and a single purposeful Emerald accent (`#10b981`). |
| **Layout Rhythm** | Three identical cards in a row with a centered icon, bold headline, and two lines of filler text. | Asymmetric Bento grid with mixed cell spans (2x1 wide timeline, 1x1 stat blocks, tall vertical leaderboards). |
| **Typography** | Default uncustomized `Inter` or pretentious display serifs (`Fraunces`, `Instrument Serif`). | `Outfit` / `Geist Sans` for display and `Geist Mono` for timestamps, latency metrics, and counters. |
| **Micro-Interactions** | Infinite looping badge shimmers, spinning gradient borders, or cards that constantly bounce. | Motion strictly for user feedback (button presses, tab switches, file drop states) and Wrapped slide transitions. |
| **Product Mockups** | Hand-rolled `<div>` rectangles pretending to be fake smartphone screens or fake chat bubbles. | Real, interactive UI components rendering live parsed data or the bundled mock chat. |
| **Copy & Tone** | Corporate or pseudo-profound AI filler (*"Unlock the power of your conversations"*, *"A testament to connectivity"*, *"Delve into your chats"*). | Sharp, conversational, human copy (*"Who leaves who on read?"*, *"The 3 AM Hall of Fame"*, *"52,190 messages. Zero uploaded to any server."*). |

---

## 2. The Design Dials

| Dial | Value | Rationale |
| :--- | :--- | :--- |
| **`DESIGN_VARIANCE`** | **8** | High visual variety. Asymmetric bento grids, customized personality badge cards, and distinct layouts for each of the 6 Wrapped story slides. |
| **`MOTION_INTENSITY`** | **7** | Dynamic spring physics for the Wrapped story player, real-time counter ticking on ingestion, and celebratory confetti. Cleanly collapses to static state under `prefers-reduced-motion`. |
| **`VISUAL_DENSITY`** | **4** | Breathing room in the hero and story slides; functional data density in the deep-dive analytics tabs so metrics remain legible at a glance. |

---

## 3. Visual Foundation & Design Tokens

### 3.1 Typography System

- **Display & Section Headers (`Outfit` / `Geist Sans`)**:
  - Hero Headline: `text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]`
  - Section Titles: `text-2xl font-bold tracking-tight text-white`
  - Stat Values: `text-3xl sm:text-4xl font-extrabold tracking-tight text-white`
  - Body Text: `text-sm sm:text-base text-zinc-400 leading-relaxed max-w-[60ch]`
- **Numeric & Timestamp Mono (`Geist Mono`)**:
  - Used for timestamps, latency durations (`12m 45s`), and message counters.
  - Class: `font-mono tracking-wider text-xs uppercase text-zinc-400`

### 3.2 Palette & Contrast Architecture

- **Page Base**: `#080c14` (Deep obsidian slate)
- **Cards & Surfaces**:
  - Surface Default: `#0f172a` with 80% opacity and subtle 1px border `rgba(255, 255, 255, 0.08)`
  - Surface Elevated: `#1e293b`
  - Surface Highlight: `rgba(255, 255, 255, 0.04)`
- **Brand Signal (Emerald Green)**:
  - Primary: `#10b981`
  - Hover: `#059669`
  - Subtle Tint: `rgba(16, 185, 129, 0.12)`
- **Multi-Participant Color Assignment (WCAG AA Compliant)**:
  - Chatter 1: `#10b981` (Emerald)
  - Chatter 2: `#06b6d4` (Cyan)
  - Chatter 3: `#8b5cf6` (Electric Violet)
  - Chatter 4: `#f59e0b` (Amber)
  - Chatter 5: `#ec4899` (Pink)
  - Chatter 6: `#3b82f6` (Cobalt Blue)

---

## 4. Component Architecture & Page Layout

### 4.1 Hero & Dropzone (Zero-Scroll Viewport)

The hero fits comfortably inside the initial desktop viewport without pushing critical actions below the fold.

- **Split Composition (55 / 45)**:
  - **Left Column**:
    - Privacy pill: `100% In-Browser · 0 Bytes Sent to Servers` with a solid green status beacon.
    - Headline: *"See what your WhatsApp chats actually say about you."* (Max 2 lines).
    - Subtext: *"Response times, ghosting streaks, 3 AM habits, and your group's Spotify-style Wrapped recap."* (Under 20 words).
    - Action bar: Primary "Try Demo Chat" button + "How to export" guide toggle.
  - **Right Column (The Ingestion Bay)**:
    - High-contrast dropzone with dashed border and drag hover feedback.
    - Accepts `.txt` files or raw `.zip` archives.
    - Real-time Web Worker progress indicator when parsing large archives.

### 4.2 "WhatsApp Wrapped" Story Player

A full-screen interactive story modal optimized for 9:16 vertical export.

- **Viewport**: Centered 9:16 mobile container (`max-w-[420px] aspect-[9/16]`) with subtle backdrop darkening.
- **Progress Header**: Segmented horizontal status bars indicating progress through the 6 slides.
- **The 6 Story Slides**:
  1. **The Mileage**: Total messages, words exchanged, and active date span.
  2. **The Megaphone**: Who talked the most, with exact message percentages.
  3. **The Peak Chaos Day**: The single day with the highest message velocity in chat history.
  4. **The 3 AM Confessions**: Late-night chat statistics (midnight to 5 AM volume).
  5. **The Ghosting Index & Speed Demons**: Median response times and longest waiting periods.
  6. **The Trophy Case**: Data-backed personality badges (The Night Owl, The Novelist, The Quick Draw, The One-Worder) with final celebratory confetti.
- **Export Engine**:
  - One-click "Save Story Card" button on every slide.
  - Uses `html-to-image` client-side to render pixel-perfect 1080x1920 PNG files.
  - Optional "Censor Real Names" switch for sharing safely with strangers.

### 4.3 The Deep-Dive Analytics Bento Grid

When browsing outside the story player, the dashboard presents comprehensive behavioral metrics in an asymmetric bento grid:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ METRIC CARDS: Total Messages │ Total Words │ Media Count │ Active Days      │
├───────────────────────────────────────────┬─────────────────────────────────┤
│ TIMELINE (Col-Span 2)                     │ RESPONSE LATENCY (Col-Span 1)   │
│ Interactive monthly/weekly message volume │ Median reply time per person    │
├───────────────────────────────────────────┼─────────────────────────────────┤
│ 24-HOUR ACTIVITY CLOCK (Col-Span 1)       │ CONVERSATION INITIATORS (Col 2) │
│ Hourly breakdown of peak chat hours       │ Who breaks 4+ hour silences     │
├───────────────────────────────────────────┴─────────────────────────────────┤
│ EMOJI & VOCABULARY LEADERBOARD: Top 10 emojis & most frequent words         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Web Worker Pipeline & Privacy Execution

```
[Drop File: .txt / .zip]
           │
           ▼
[FileReader / fflate] (Main Thread: 0 network calls)
           │
           ▼ (Transfer raw buffer)
[Web Worker: parseWorker.ts]
   ├── iOS regex pattern match ([DD/MM/YY, HH:MM:SS])
   ├── Android regex pattern match (DD/MM/YYYY, HH:MM -)
   ├── Multi-line message buffer assembly
   ├── WhatsApp system line filtering
   ├── Reply latency & Ghosting calculation (<6h gap filter)
   ├── Conversation initiation counters (>4h gap trigger)
   ├── Emoji Unicode analysis & stop-word filtering
   └── Personality badge assignment algorithms
           │
           ▼ (Emit structured payload)
[Dashboard State / Story Player] (Immediate zero-latency UI render)
```

---

## 6. Pre-Flight Quality Gates

- [x] **Zero AI Slop**: Banned purple mesh backgrounds, banned generic 3-card rows, banned fake buzzword copy.
- [x] **Strict Viewport Rule**: Value proposition, dropzone, and demo buttons visible immediately on desktop.
- [x] **Clean Typography**: High-character sans and mono; no generic serif defaults.
- [x] **Real-World Privacy**: 100% in-browser, no backend server, fully offline capable.
- [x] **Accessible & Responsive**: Passes WCAG AA contrast standards and supports screen widths down to 360px.
