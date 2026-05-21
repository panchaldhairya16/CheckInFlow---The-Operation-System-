<div align="center">

<br />

```
 ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗██╗███╗   ██╗███████╗██╗      ██████╗ ██╗    ██╗
██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝██║████╗  ██║██╔════╝██║     ██╔═══██╗██║    ██║
██║     ███████║█████╗  ██║     █████╔╝ ██║██╔██╗ ██║█████╗  ██║     ██║   ██║██║ █╗ ██║
██║     ██╔══██║██╔══╝  ██║     ██╔═██╗ ██║██║╚██╗██║██╔══╝  ██║     ██║   ██║██║███╗██║
╚██████╗██║  ██║███████╗╚██████╗██║  ██╗██║██║ ╚████║██║     ███████╗╚██████╔╝╚███╔███╔╝
 ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝
```

### **Smart Attendance & Networking Platform**
*Transforming physical event registration into intelligent, connected experiences.*

<br />

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini_API-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](./LICENSE)

<br />

> **CheckInFlow** replaces clipboards, spreadsheets, and chaos with a seamless digital check-in desk — layered with AI-powered attendee analytics, real-time QR scanning, and a smart networking engine. Built for organizers who refuse to compromise on the attendee experience.

<br />

---

</div>

<br />

## ✨ Core Features

<br />

### `01` — Real-Time Check-In Desk

> Instant QR processing with reactive registration states that update live across the entire organizer dashboard.

- **⚡ Sub-second scan response** — QR codes decoded and matched against guest rosters in real time
- **🔄 Live state transitions** — Attendees visually shift from *Pending → Checked In → Seated* with animated feedback
- **📋 Inline guest lookup** — Manual name/email fallback search for guests without QR codes
- **🖨️ Badge-ready output** — Check-in confirmation formatted for on-site badge printing workflows

---

### `02` — Custom Event Management Dashboard

> Fluid, modular workspace for creating, customizing, and reviewing upcoming summits — all within a single organized desk.

- **🗂️ Multi-event workspaces** — Manage parallel conferences, workshops, and meetups in isolated sessions
- **🎟️ QR code generation** — Per-guest unique QR tokens auto-generated on invite dispatch
- **📊 Attendance snapshots** — Live occupancy counters, arrival trend graphs, and no-show detection
- **✏️ Guest roster editing** — Add, edit, or revoke guests mid-event without restarting flows

---

### `03` — Adaptive Light & Dark Themes

> Visually optimized design token system that adapts to every environment — from dimly lit networking lounges to sunlit conference halls.

- **🌙 Dark Mode** — Deep neutral backgrounds with luminous accent surfaces; reduced eye strain during evening events
- **☀️ Light Mode** — High-contrast crisp whites with structured shadows for maximum outdoor readability
- **🎨 Token-driven** — Every color, radius, and spacing value driven by a single semantic CSS variable layer — zero hardcoded values

---

### `04` — Gemini NLP Event Assistant

> A server-side conversational AI proxy enabling organizers to query attendee data, generate cohort groupings, and receive live networking recommendations — without ever exposing API credentials to the browser.

- **💬 Natural language queries** — Ask *"How many speakers haven't checked in?"* or *"Group attendees by company into networking pods"*
- **🔐 Zero client-side key exposure** — All Gemini calls are routed through the Express proxy; the browser never sees your API key
- **📈 Live cohort analytics** — Dynamic attendee segmentation by role, company, arrival time, or session interest
- **🤝 Networking recommendations** — AI-suggested introduction pairings based on attendee profiles

---

### `05` — Sandbox & Workspace Sign-In

> Secure workspace desks with sandbox onboarding for testing event flows before going live.

- **🧪 Sandbox mode** — Simulate full check-in sessions with synthetic attendee data before launch day
- **🔑 Workspace authentication** — Isolated organizer accounts with session-scoped access
- **🛡️ Role-aware access** — Differentiated permissions for lead organizers, desk volunteers, and read-only reviewers

<br />

---

## 🏗️ Architecture

<br />

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT  (Browser)                        │
│                                                                 │
│   React 18 + TypeScript + Tailwind CSS + Vite                   │
│   ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐    │
│   │  Check-In    │  │   Event Mgmt  │  │  NLP Assistant   │    │
│   │    Desk      │  │   Dashboard   │  │      Chat UI     │    │
│   └──────┬───────┘  └───────┬───────┘  └────────┬─────────┘    │
│          │                  │                   │               │
└──────────┼──────────────────┼───────────────────┼───────────────┘
           │   REST / JSON    │                   │  /api/chat
           ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER  (Express / Node.js)                  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              Secure API Gateway (Proxy)                 │   │
│   │   · Validates + sanitizes all incoming requests         │   │
│   │   · Injects GEMINI_API_KEY server-side (never exposed)  │   │
│   │   · Streams AI responses back to client via SSE         │   │
│   └───────────────────────────┬─────────────────────────────┘   │
│                               │                                 │
│   ┌───────────────┐           ▼           ┌──────────────────┐  │
│   │  JSON File DB │    Google Gemini      │  QR Token Store  │  │
│   │  (Attendees,  │◄── API (Gemini 1.5)  │  (Per-guest UUID │  │
│   │   Events)     │                       │   mapping)       │  │
│   └───────────────┘                       └──────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

<br />

### Security Boundary — Why the Proxy Matters

The `GEMINI_API_KEY` **never leaves the server**. Every AI request from the React client hits `/api/chat` on the Express backend, which authenticates the session, constructs the prompt with live attendee context, and forwards it to the Gemini API server-side. The client receives only the streamed text response — no credentials, no raw API structure.

| Layer | Technology | Responsibility |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript | UI rendering, QR scanning, theme management |
| **Styling** | Tailwind CSS, custom token layer | Adaptive design system (Light/Dark) |
| **Motion** | Framer Motion | Entry animations, state transitions, micro-interactions |
| **Backend** | Node.js, Express 4 | REST API, AI proxy gateway, session management |
| **AI** | Google Gemini 1.5 | NLP assistant, cohort analytics, networking recommendations |
| **Persistence** | Local JSON filesystem | Atomic stream-writes for attendee and event records |

<br />

---

## 🚀 Local Setup

<br />

### Prerequisites

Before cloning, confirm your environment meets these requirements:

| Requirement | Version |
|---|---|
| Node.js | `v18.0.0` or higher |
| npm | `v9.0.0` or higher |
| Google Gemini API Key | [Get one here →](https://aistudio.google.com/app/apikey) |

<br />

<details>
<summary><strong>📦 Step 1 — Clone the Repository</strong></summary>

<br />

```bash
# Clone the project
git clone https://github.com/your-username/checkinflow.git

# Move into the workspace
cd checkinflow
```

</details>

<br />

<details>
<summary><strong>📥 Step 2 — Install Dependencies</strong></summary>

<br />

```bash
# Install all client and server dependencies
npm install
```

This installs both the frontend (React/Vite) and backend (Express) dependency trees from the root `package.json` workspace configuration.

</details>

<br />

<details>
<summary><strong>🔐 Step 3 — Configure Environment Variables</strong></summary>

<br />

A `.env.example` file is included at the root. **Copy it and populate your credentials:**

```bash
cp .env.example .env
```

Open `.env` and add your Gemini API key:

```env
# ============================================================
#  CheckInFlow — Environment Configuration
# ============================================================

# Google Gemini API Key (server-side only — never exposed to client)
GEMINI_API_KEY=your_gemini_api_key_here

# Server port (optional, defaults to 3001)
PORT=3001

# Node environment
NODE_ENV=development
```

> ⚠️ **Critical:** The `.env` file is `.gitignore`d by default. **Never commit your API key.** The Express server reads `GEMINI_API_KEY` at startup and injects it into all outbound Gemini requests — it is never forwarded to the React client.

</details>

<br />

<details>
<summary><strong>▶️ Step 4 — Start the Development Server</strong></summary>

<br />

```bash
npm run dev
```

This command concurrently starts:
- **Vite Dev Server** → [`http://localhost:5173`](http://localhost:5173) (React frontend with HMR)
- **Express API Server** → [`http://localhost:3001`](http://localhost:3001) (AI proxy + REST endpoints)

```
  ✓  CheckInFlow client   → http://localhost:5173
  ✓  CheckInFlow server   → http://localhost:3001
  ✓  Gemini proxy active  → /api/chat
```

</details>

<br />

<details>
<summary><strong>🏭 Step 5 — Build for Production</strong></summary>

<br />

**Compile the CJS bundle:**

```bash
npm run build
```

This produces:
- `/dist` — Optimized Vite client bundle (minified, tree-shaken)
- `/dist-server` — Compiled Express server in CommonJS format

**Start the production server:**

```bash
npm run start
```

The Express server serves the static React build from `/dist` and exposes the API on the configured `PORT`.

```
  ✓  Production build serving → http://localhost:3001
```

</details>

<br />

---

## 🧑‍💻 Codebase Overview

<br />

```
checkinflow/
│
├── 📁 src/                          # React frontend source
│   ├── 📁 components/
│   │   ├── 📁 desk/                 # Check-In Desk UI modules
│   │   ├── 📁 dashboard/            # Event management panels
│   │   ├── 📁 assistant/            # NLP chat interface
│   │   └── 📁 ui/                   # Shared design system components
│   │
│   ├── 📁 hooks/                    # Custom React hooks (useQRScanner, useTheme, etc.)
│   ├── 📁 context/                  # Global state providers (EventContext, ThemeContext)
│   ├── 📁 lib/                      # Utility functions and API client
│   ├── 📁 types/                    # TypeScript interface definitions
│   └── 📄 main.tsx                  # Vite entry point
│
├── 📁 server/                       # Express backend source
│   ├── 📄 index.ts                  # Server entry, middleware config
│   ├── 📁 routes/
│   │   ├── 📄 chat.ts               # /api/chat — Gemini proxy endpoint
│   │   ├── 📄 events.ts             # /api/events — CRUD operations
│   │   └── 📄 attendees.ts          # /api/attendees — Check-in management
│   ├── 📁 db/                       # JSON filesystem persistence layer
│   └── 📁 lib/                      # Gemini client, QR token generator
│
├── 📄 .env.example                  # Environment variable template
├── 📄 vite.config.ts                # Vite + proxy config
├── 📄 tailwind.config.ts            # Design token configuration
└── 📄 package.json                  # Workspace scripts and dependencies
```

<br />

---

## 🎨 Design Philosophy

<br />

CheckInFlow was built to **feel** like premium SaaS — not a hackathon prototype. Every surface, transition, and typographic decision was made deliberately.

<br />

**Anti-cookie-cutter principles applied throughout:**

- **`Micro-interaction density`** — Every interactive element has a purposeful hover, focus, and active state. Buttons don't just change color — they breathe. Cards don't just appear — they enter.

- **`Responsive font metrics`** — Type scales use `clamp()` fluid sizing so headlines read correctly on a 13" laptop at a speaker desk and a 27" monitor in an organizer booth. No layout breaks, no awkward wraps.

- **`High-contrast token architecture`** — The design token layer separates *semantic intent* from *visual output*. Changing the brand accent repaints the entire application without hunting for hardcoded hex values.

- **`Motion as communication`** — Framer Motion animations aren't decorative. A check-in confirmation uses a spring easing to communicate *success*. An error state uses a tight shake to communicate *attention required*. Motion carries meaning.

- **`Component isolation`** — Every UI module is independently testable, composable, and themeable. The Check-In Desk renders identically whether embedded in the full dashboard or mounted as a standalone kiosk display.

<br />

---

## 📄 License

<br />

This project is licensed under the **MIT License** — see the [`LICENSE`](./LICENSE) file for details.

<br />

---

<div align="center">

<br />

**Built with precision for organizers who care about the details.**

<br />

*CheckInFlow — Where every attendee arrival is a moment worth getting right.*

<br />

[![GitHub Stars](https://img.shields.io/github/stars/your-username/checkinflow?style=for-the-badge&logo=github&color=FFD700)](https://github.com/your-username/checkinflow)
[![GitHub Issues](https://img.shields.io/github/issues/your-username/checkinflow?style=for-the-badge&logo=github&color=EF4444)](https://github.com/your-username/checkinflow/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-22C55E?style=for-the-badge&logo=github)](https://github.com/your-username/checkinflow/pulls)

</div>
