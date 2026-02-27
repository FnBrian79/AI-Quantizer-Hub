# CLAUDE.md — AI Quantizer Hub

This file provides AI assistants with the context needed to understand, navigate, and contribute to this codebase effectively.

---

## Project Overview

**AI Quantizer Hub** is a React + TypeScript single-page dashboard for orchestrating parallel multi-agent AI brainstorming sessions. It is designed around a "sovereign local-first" philosophy: local Ollama models serve as the backbone, optional Google Gemini integration provides cross-agent synthesis, and Pieces OS supplies semantic context snippets.

**Core concept:** Multiple AI agent pairs (called "Pods") hold simultaneous conversations. The hub visualises their state, synthesises insights across pods, and evolves shared prompt contracts over time.

---

## Repository Layout

```
AI-Quantizer-Hub/
├── App.tsx              # Root component — Dashboard with all global state
├── index.tsx            # React entry point (mounts App)
├── index.html           # HTML shell; loads Tailwind CDN, fonts, import map
├── constants.tsx        # Static seed data (pods, prompt contract, snippets, icons, colours)
├── types.ts             # All shared TypeScript types and enums
├── metadata.json        # Project metadata (name, description)
├── package.json         # NPM config — dependencies + build scripts
├── tsconfig.json        # TypeScript compiler options
├── vite.config.ts       # Vite config (dev server, path alias, env vars)
├── .gitignore
└── components/
    ├── BackboneStatus.tsx    # Ollama backbone status panel
    ├── ControlPanel.tsx      # System control buttons + neural-injection input
    ├── PiecesOSContext.tsx   # Pieces OS semantic snippet viewer
    ├── PodGrid.tsx           # Pod grid + individual PodCard
    └── PromptEvolution.tsx   # Prompt contract editor + evolution visualisation
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 (functional components + hooks only) |
| Language | TypeScript 5.8 |
| Build Tool | Vite 6.2 |
| Styling | Tailwind CSS (loaded via CDN in `index.html`) |
| Routing | React Router DOM 7 (`HashRouter`) |
| Icons | Lucide React |
| AI APIs | Google Gemini (`@google/genai`) · Ollama (local REST) |
| Module loading | ESM import map in `index.html` (no bundled vendor chunks for these) |

---

## Key Architectural Concepts

### 1. Conversation Pods (`ConversationPod`)
A pod is a paired conversation between two AI agents. Each pod tracks:
- `agents`: two `AgentType` values
- `status`: `IDLE | RUNNING | SYNCING | ERROR`
- `currentTurn` / `maxTurns`: turn counter
- `lastMessage`: most recent utterance
- `signalStrength`: 0–100, drives UI colour-coding

Pods auto-update every **4 seconds** via a `useEffect` interval in `App.tsx`.

### 2. Global State (Dashboard in `App.tsx`)
All state lives in the `Dashboard` component (lifted state pattern). Child components receive data and callbacks as props — there is no external state manager (no Redux, Zustand, Context API for app state).

### 3. Prompt Contracts (`PromptContract`)
A versioned M2M prompt definition with constraints, examples, and an evolution score. Linked to a GitHub repository for syncing. Managed in `PromptEvolution.tsx` but state lives in `Dashboard`.

### 4. Backbone (`BackboneState`)
Represents the local Ollama instance at `192.168.0.241`. The UI renders its address, model, RAM/VRAM usage, active threads, and synthesised insights. No live polling is currently implemented — values are initialised from `constants.tsx`.

### 5. Gemini Synthesis
`runGlobalSynthesis()` in `App.tsx` calls the Google GenAI SDK to synthesise a prompt built from all pod `lastMessage` values. Requires `GEMINI_API_KEY` in the environment (see **Environment Variables** below).

---

## Development Workflow

### Setup

```bash
npm install
npm run dev       # Dev server at http://localhost:3000
```

### Build

```bash
npm run build     # Outputs to dist/
npm run preview   # Serve the production build locally
```

### Environment Variables

Create a `.env` file at the project root (never commit it — `.gitignore` covers this):

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

`vite.config.ts` injects `GEMINI_API_KEY` into `process.env` at build/dev time via `define`. All other runtime config (Ollama host, SSH address) is currently hard-coded in `App.tsx` and `constants.tsx`.

### No Test Suite
There is currently **no testing framework configured**. When adding tests, Vitest (the Vite-native choice) is the recommended option.

---

## Code Conventions

### Naming
| Entity | Convention | Example |
|---|---|---|
| Components | PascalCase | `PodCard`, `BackboneStatus` |
| Component prop interfaces | `<Name>Props` | `PodGridProps`, `PodCardProps` |
| Enums | PascalCase members | `AgentType.GEMINI`, `PodStatus.RUNNING` |
| Constants | `UPPER_SNAKE_CASE` | `INITIAL_PODS`, `AGENT_ICONS` |
| Handler functions | `handle<Action>` | `handleCreatePod`, `handleSync` |
| Utility/internal functions | `camelCase` | `addLog`, `runGlobalSynthesis` |

### Component Pattern
- **Functional components only** — no class components.
- Props are typed with a `<Name>Props` TypeScript interface defined immediately above the component.
- Use `useCallback` for callbacks passed to child components to avoid unnecessary re-renders.
- Use `useMemo` for derived values computed from expensive state transforms.

### Styling
- **Tailwind CSS utility classes exclusively** — no CSS modules, no styled-components, no inline `style` objects (except for truly dynamic values that Tailwind cannot express).
- Custom CSS lives in `<style>` blocks inside `index.html` (scrollbar styles, snake-border gradients, AR-mode classes).
- Responsive breakpoints follow Tailwind defaults: `md:` (768 px), `2xl:` (1536 px).

### Imports
- Absolute imports use the `@/` alias which resolves to the project root (configured in both `tsconfig.json` and `vite.config.ts`).
- React Router and some third-party libs load from the ESM import map in `index.html` rather than being bundled by Vite — do not attempt to import them differently.

### State Management
- All shared state is lifted to `Dashboard` in `App.tsx`.
- Callbacks are passed down as props (no Context API for app state).
- Do not introduce a global state library without discussion — the current scale does not warrant it.

---

## Type Reference (`types.ts`)

```typescript
enum AgentType   { GEMINI, GROK, CLAUDE, CHATGPT, COPILOT, LOCAL_LLM, PIECES_OS }
enum PodStatus   { IDLE, RUNNING, SYNCING, ERROR }

interface ContextSnippet  { id, content, source, timestamp, relevance }
interface Message         { id, sender, text, timestamp }
interface ConversationPod { id, name, agents, status, currentTurn, maxTurns,
                            lastMessage, partnerThoughts, signalStrength, url }
interface PromptContract  { id, version, basePrompt, constraints, examples,
                            evolutionScore, lastUpdated, githubRepo }
interface BackboneState   { address, status, model, memoryUsage,
                            activeThreads, synthesizedInsights }
```

All new shared types belong in `types.ts`. Component-local types (e.g. internal union types) may be defined in the component file.

---

## Data Flow

```
constants.tsx  ──► Dashboard (App.tsx) initial state
                       │
           ┌───────────┼──────────────────────────────┐
           ▼           ▼                              ▼
      BackboneStatus  PodGrid ──► PodCard        ControlPanel
      PromptEvolution PiecesOSContext
```

- Parent → child: data via props
- Child → parent: callbacks via props (`onSync`, `onRemove`, `onUpdate`, etc.)
- Side effects (auto-update interval, Gemini API call): `useEffect` / `useCallback` in `Dashboard`

---

## Mock Data & Simulation

The app ships with fully mock initial data in `constants.tsx`:
- `INITIAL_PODS` — 10 pre-seeded conversation pods
- `INITIAL_PROMPT_CONTRACT` — example M2M contract
- `MOCK_SNIPPETS` — example Pieces OS context snippets

Pod conversations **auto-simulate** progress every 4 seconds. There is no real WebSocket or backend polling. When adding real backend integration, target `App.tsx`'s `useEffect` intervals and replace the mock mutation logic.

---

## External Integrations

| Integration | Status | Notes |
|---|---|---|
| Google Gemini API | Partially implemented | `runGlobalSynthesis()` in `App.tsx`; requires `GEMINI_API_KEY` |
| Ollama (local LLM) | UI only | Backbone state rendered, no live REST calls |
| Pieces OS | Mock data | `MOCK_SNIPPETS` rendered in `PiecesOSContext.tsx` |
| GitHub (prompt sync) | UI only | Input field in `PromptEvolution.tsx`, no actual git calls |

---

## Git Conventions

- Branch naming: `claude/<slug>` for AI-assisted work (see active branch).
- Commit messages: imperative mood, concise subject line, e.g. `feat: add pod signal strength decay`.
- Never commit `.env` files or secrets.
- The `dist/` build output is git-ignored.

---

## Known Gaps & Future Work

- No test suite — Vitest is recommended when tests are added.
- No persistence — all state resets on page refresh; SQLite integration is mentioned in README but not implemented.
- Backbone polling — `BackboneState` is static; a polling loop against the Ollama REST API (`/api/tags`, `/api/ps`) would make it live.
- Real Pieces OS SDK — currently uses mock snippets; the official Pieces OS Client SDK could replace `MOCK_SNIPPETS`.
- No error boundaries — React error boundaries should wrap the major panel components.
- CI/CD — a previous GKE deployment workflow was removed; no active pipeline exists.
