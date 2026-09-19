# PRD: WhatsApp Chat Analyzer v2

## 1. Introduction / Overview

Most WhatsApp chat analyzers on the web suffer from two massive flaws: they force you to upload private, deeply personal chat files to an unknown server, or they spit out ugly, academic matplotlib charts from 2015 that nobody wants to read.

WhatsApp Chat Analyzer v2 fixes both problems. 

First, it runs entirely in the browser. Zero bytes of chat text ever leave the user's laptop or phone. All parsing, stats, and badges crunch locally in memory. 

Second, it treats chat data like culture, not a spreadsheet. It turns export files into two distinct experiences:
1. **WhatsApp Wrapped**: A slick, story-driven recap built for sharing on Instagram, TikTok, and WhatsApp Status.
2. **The Deep Dive Dashboard**: Granular analytics that uncover actual behavioral patterns—who ghosts who, response latency, double-text bursts, and personality badges.

---

## 2. Goals

- **Zero-knowledge privacy**: Run 100% client-side. The network tab must show zero outbound payload requests containing user messages.
- **Fast, non-blocking ingestion**: Parse 50,000+ messages in under 2 seconds without freezing the browser UI.
- **Viral export engine**: Generate crisp, high-res 9:16 vertical cards ready to drop directly onto Instagram Stories with one click.
- **Behavioral metrics**: Measure real conversational dynamics—latency, conversation starters, and ghosting frequency—rather than just counting words.
- **Frictionless preview**: Provide a realistic one-click demo chat so users can test every feature instantly without hunting down their own `.txt` export file.

---

## 3. User Stories

### US-001: Project Foundation & Layout
**Description:** As a user, I want a clean, fast-loading dark-mode interface so the analyzer looks modern and easy on the eyes.

**Acceptance Criteria:**
- [ ] Scaffold React + Vite with clean, responsive styling and zero console warnings.
- [ ] Establish a dark-mode theme with high-contrast accent colors for up to 10 distinct participants.
- [ ] Build header with app branding and a clear "100% Private / Local Only" indicator.
- [ ] Typecheck passes cleanly.
- [ ] Verify in browser using dev-browser skill.

---

### US-002: Drag-and-Drop Ingestion & Demo Mode
**Description:** As a user, I want to drop my exported chat file onto the screen and start analyzing immediately, or click a demo button if I don't have a file ready.

**Acceptance Criteria:**
- [ ] Drop zone accepts `.txt` files and unextracted WhatsApp `.zip` archives.
- [ ] Prominent "Try Demo Chat" button loads a bundled mock conversation instantly.
- [ ] Step-by-step visual accordion shows how to export chats on iOS and Android.
- [ ] Clear error alert if the user uploads an unsupported file format or an empty text file.
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

---

### US-003: Multi-Platform Chat Parser via Web Worker
**Description:** As a user, I want my chat export parsed accurately regardless of phone brand, date format, or multi-line messages, without my browser lagging.

**Acceptance Criteria:**
- [ ] Move parsing logic into a Web Worker so the main thread never stutters.
- [ ] Parse iOS bracket formats: `[DD/MM/YY, HH:MM:SS AM] Name: message` and `[M/D/YY, H:MM:SS PM] Name: message`.
- [ ] Parse Android dash formats: `DD/MM/YYYY, HH:MM - Name: message` and `M/D/YY, H:MM am - Name: message`.
- [ ] Correctly append multi-line messages (paragraphs, code snippets, lists) to the active sender.
- [ ] Filter out WhatsApp system lines (encryption notices, added/removed notices, group icon changes).
- [ ] Recognize media omission markers (`<Media omitted>`, `image omitted`) as media counters instead of text.
- [ ] Show a lightweight spinner during file read for chats exceeding 20 MB.
- [ ] Typecheck passes.

---

### US-004: Core Stats & Participant Cards
**Description:** As a user, I want a quick summary of big-picture numbers and a breakdown of who talks the most.

**Acceptance Criteria:**
- [ ] Display summary cards: Total Messages, Total Words, Media Shared, Links Shared, and Active Date Range.
- [ ] Display participant leaderboard showing message count, word count, and talk-time percentage.
- [ ] Auto-detect if the chat is a 1-on-1 direct conversation or a group chat, adjusting card labels accordingly.
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

---

### US-005: Conversational Dynamics & Response Latency
**Description:** As a user, I want to see who takes forever to reply, who starts the talks, and who sends walls of text.

**Acceptance Criteria:**
- [ ] **Median Response Latency**: Calculate typical reply time per participant, excluding gaps longer than 6 hours (sleep/work).
- [ ] **Ghosting Index**: Count how often a participant leaves someone waiting over 4 hours during active day hours.
- [ ] **Conversation Starters**: Count how many times each person broke a 4+ hour silence to revive the chat.
- [ ] **Double-Text Bursts**: Track streaks where one person sends 3 or more consecutive messages before anyone else replies.
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

---

### US-006: Personality Archetypes & Badges
**Description:** As a user, I want each chatter to receive a funny, data-backed badge based on their specific habits.

**Acceptance Criteria:**
- [ ] Compute and award badges based on verified chat data:
  - 🦉 **The Night Owl**: Highest message volume between 12:00 AM and 5:00 AM.
  - 📜 **The Novelist**: Highest average word count per message.
  - ⚡ **The Quick Draw**: Lowest median response time (< 60 seconds).
  - 👍 **The One-Worder**: Highest ratio of single-word answers ("k", "ok", "cool", "yeah").
  - 🎭 **The Emoji Addict**: Highest emoji-to-word ratio.
  - 🌅 **The Early Bird**: Most messages between 5:00 AM and 8:00 AM.
  - 🚀 **The Spark**: Highest share of conversation openings.
- [ ] Render badge chips directly on each participant's card with hover/tap explanations.
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

---

### US-007: Visual Activity & Habit Charts
**Description:** As a user, I want responsive charts to see when the group chats most and what emojis we spam.

**Acceptance Criteria:**
- [ ] **Timeline**: Smooth monthly/weekly line chart of message volume from start to finish.
- [ ] **24-Hour Clock**: Bar chart or radial plot showing activity by hour of the day.
- [ ] **Weekly Rhythm**: Day-of-week breakdown (Monday through Sunday).
- [ ] **Emoji Leaderboard**: Top 10 emojis used overall and per person.
- [ ] **Vocabulary Frequency**: Top words list with common stop-words ("the", "and", "is") filtered out.
- [ ] Clean tooltips on hover with exact counts.
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

---

### US-008: "WhatsApp Wrapped" Story Presentation
**Description:** As a user, I want a swipeable story experience that turns our chat history into a shareable recap.

**Acceptance Criteria:**
- [ ] Launch full-screen interactive story modal via a prominent "View Your Wrapped" button.
- [ ] Build 6 distinct slides:
  - Slide 1: The Overview (Total messages, days talked, total words).
  - Slide 2: The Chatterbox (Top speaker and message share).
  - Slide 3: Peak Chaos (The single day with the most messages sent).
  - Slide 4: Late-Night Talks (3 AM message counts and night owl stats).
  - Slide 5: Response Time Leaderboard (Fastest repliers vs. serial ghosters).
  - Slide 6: The Awards Ceremony (Personality badges and final summary recap).
- [ ] Include top progress bars, tap right to advance, tap left to go back, and tap-and-hold to pause.
- [ ] Confetti celebration on the final slide.
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

---

### US-009: 1-Click Story Card Image Export
**Description:** As a user, I want to download a high-res vertical card of any Wrapped slide so I can post it straight to my Instagram Story or WhatsApp Status.

**Acceptance Criteria:**
- [ ] "Save Story Card" button on every Wrapped slide.
- [ ] Render a pixel-perfect 1080x1920 PNG using `html-to-image` client-side.
- [ ] Anonymizer toggle: allow users to blur or alias real names/phone numbers before downloading.
- [ ] Trigger instant browser download with a clean filename (e.g., `whatsapp-wrapped-2024.png`).
- [ ] Typecheck passes.
- [ ] Verify in browser using dev-browser skill.

---

## 4. Functional Requirements

- **FR-1**: Process all files strictly in memory via `FileReader` and Web Workers. Never initiate a POST request containing chat data.
- **FR-2**: Parse iOS brackets (`[MM/DD/YY, hh:mm:ss a]`) and Android dashes (`MM/DD/YYYY, hh:mm -`).
- **FR-3**: Support multi-line messages by appending unmatched lines to the preceding valid message payload.
- **FR-4**: Ignore WhatsApp system messages when calculating message counts, word counts, and user stats.
- **FR-5**: Calculate response times only across consecutive messages between two different people, discarding gaps larger than 6 hours.
- **FR-6**: Flag a conversation initiation whenever a message follows 4 or more hours of silence.
- **FR-7**: Parse emojis accurately using Unicode standard regex so multi-byte emojis and skin tones don't distort counts.
- **FR-8**: Filter out standard English stop-words from the vocabulary frequency table.
- **FR-9**: Enable keyboard shortcuts for Wrapped navigation: `RightArrow` (next), `LeftArrow` (previous), `Escape` (close).
- **FR-10**: Export downloadable 9:16 PNG files formatted at 1080x1920 resolution.
- **FR-11**: Provide a single-click "Anonymize Names" switch that swaps real names for handles like "Friend 1", "Friend 2".
- **FR-12**: Keep the entire dashboard fully responsive across desktop, tablet, and mobile screens down to 360px width.

---

## 5. Non-Goals

- No server-side database, user accounts, or authentication.
- No direct connection or QR-code login to WhatsApp Web.
- No audio playback or image rendering for media files inside `.zip` exports (count events only).
- No paywalls or subscriptions.
- No heavy server-hosted LLMs that require uploading raw chat logs.

---

## 6. Design & UX Direction

- **Style**: Dark slate background (`#0b0f19`), subtle glassmorphism cards, and emerald/cyan/violet gradients.
- **Contrast**: Clean typography with distinct, calibrated colors for each participant.
- **Pacing**: Punchy micro-animations on metric counters and snappy slide transitions for Wrapped.
- **Simplicity**: No dense walls of text. Clean cards with breathing room and clear visual hierarchy.

---

## 7. Technical Stack & Architecture

- **Core**: React 18+, Vite, TypeScript.
- **Styles**: TailwindCSS with custom utility classes or modern CSS variables.
- **Icons**: Lucide React.
- **Charts**: Recharts or Chart.js for smooth SVG/Canvas rendering.
- **Effects**: Canvas-Confetti for story milestones.
- **Image Generation**: `html-to-image` for in-browser DOM-to-PNG rendering.
- **Archive Extraction**: `fflate` for fast, lightweight in-browser `.zip` extraction.
- **Concurrency**: Dedicated Web Worker for regex parsing and data aggregation.

---

## 8. Success Metrics

- **Parse Speed**: Under 2.0 seconds to parse and crunch 50,000 messages on a modern browser.
- **Network Privacy**: Zero network calls transmitting chat text.
- **Export Latency**: Under 800ms to render and initiate download of a 1080x1920 PNG card.
- **Demo Access**: Demo mode loads and renders all cards in under 200ms with zero file upload needed.

---

## 9. Open Questions & Future Enhancements

- **Non-English Chats**: Should we bundle date patterns for common regional variations (e.g., German dot notation `DD.MM.YY`, Hindi, Spanish)?
- **Local AI (V2)**: Can we plug in Transformers.js with a quantized model to run zero-shot sentiment and roasts 100% on the user's GPU?
