# PurpleChats 💬📊

> **Fast, private, 100% on-device WhatsApp chat analyzer and interactive Wrapped-style story generator.**

[![GitHub stars](https://img.shields.io/github/stars/Rahmman001/PurpleChats?style=social)](https://github.com/Rahmman001/PurpleChats)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Privacy: 100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20On--Device-success.svg)](#privacy-first)

---

## ✨ Features

- 🔒 **100% Client-Side & Private**: Your chat archives never leave your browser. Zero servers, zero databases, zero tracking.
- 🎁 **WhatsApp Wrapped Mode**: Interactive 3D story cards highlighting top talkers, peak messaging hours, chat streaks, and response times.
- 📈 **Activity Insights & Heatmaps**: Hourly distribution, day-of-week radar, and monthly message progression charts.
- 🎭 **Emoji & Vocabulary Breakdown**: Uncover your group's most iconic emojis, catchphrases, and shared vocabulary.
- ⚡ **Instant Processing**: Powered by Web Workers and streaming text parsers capable of handling 50,000+ messages in milliseconds.
- 🖼️ **Shareable Cards**: Export beautiful editorial-styled metric cards as PNGs ready for Instagram Stories, Twitter, or WhatsApp status.

---

## 🔒 Privacy First

PurpleChats is built strictly around browser-local processing:
1. When you drop a `.txt` or `.zip` WhatsApp export, all unzipping and string parsing occurs in your browser's local memory via Web Workers.
2. No chat text, contact name, timestamp, or attachment is ever sent across the network.
3. Once you close the tab, all in-memory data is purged immediately.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm / pnpm / yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Rahmman001/PurpleChats.git

# Navigate into the project folder
cd PurpleChats

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to start analyzing chats!

### Running Tests

```bash
npm run test
```

### Production Build

```bash
npm run build
```

The optimized static assets will be emitted to the `dist/` directory, ready to be hosted on any static provider (Cloudflare Pages, Vercel, Netlify, GitHub Pages).

---

## ☁️ Deployment

### Cloudflare Pages
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select `Rahmman001/PurpleChats`.
3. Set build configuration:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**.

### Vercel
1. Import `Rahmman001/PurpleChats` in [Vercel](https://vercel.com/new).
2. Framework preset will automatically detect Vite.
3. Click **Deploy**.

---

## 🛠️ Built With

- [React 18](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) - Lightning-fast frontend build tooling
- [Tailwind CSS](https://tailwindcss.com/) - Warm editorial styling
- [Lucide Icons](https://lucide.dev/) - Minimalist iconography
- [fflate](https://github.com/101arrowz/fflate) - High-speed in-browser ZIP extraction
- [html-to-image](https://github.com/bubkoo/html-to-image) - Exporting high-res visual cards

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
