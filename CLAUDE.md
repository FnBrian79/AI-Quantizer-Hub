# CLAUDE.md

## Project Overview

AI Quantizer Hub is a dashboard for orchestrating parallel AI brainstorming sessions across GKE and local backbone nodes. It features self-evolving prompt contracts, M2M (Machine-to-Machine) orchestration, and Pieces OS context management.

## Tech Stack

- **Language**: TypeScript 5.8
- **Framework**: React 19 with Vite 6
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **Styling**: Tailwind CSS (loaded via CDN in `index.html`)
- **AI**: Google GenAI SDK (`@google/genai`)

## Getting Started

### Prerequisites

- Node.js

### Environment Setup

Create a `.env.local` file in the project root with your Gemini API key:

```
GEMINI_API_KEY=your_key_here
```

The Vite config exposes this as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY`.

### Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run preview      # Preview production build
```

## Project Structure

```
├── components/              # React UI components
│   ├── BackboneStatus.tsx   # Local LLM backbone metrics display
│   ├── ControlPanel.tsx     # System control buttons (resync, stress test, etc.)
│   ├── PiecesOSContext.tsx   # Pieces OS context/memory management UI
│   ├── PodGrid.tsx          # Grid of conversation pods with sync/remove
│   └── PromptEvolution.tsx  # Prompt contract evolution controls + GitHub integration
├── App.tsx                  # Main dashboard component — all state lives here
├── types.ts                 # Shared TypeScript type definitions
├── constants.tsx            # Mock data and configuration constants
├── index.tsx                # React DOM entry point
├── index.html               # HTML template (loads Tailwind via CDN)
├── vite.config.ts           # Vite config (port 3000, @ alias, env vars)
├── tsconfig.json            # TypeScript config (ES2022, bundler resolution)
├── package.json             # Dependencies and scripts
├── metadata.json            # Project metadata
└── .github/workflows/
    └── google.yml           # GKE deployment pipeline (GitHub Actions)
```

## Architecture

### Key Concepts

- **Conversation Pods**: Virtual spaces where pairs of AI agents (Gemini, Claude, ChatGPT, Grok, Copilot, LocalLLM, PiecesOS) conduct multi-turn dialogues. Each pod tracks status, turn count, signal strength, and messages.
- **Backbone Node**: Local LLM (Llama 3.1 70B) that synthesizes insights from parallel pod conversations.
- **Prompt Contract**: Version-controlled prompt specifications with evolution scoring, constraints, and GitHub repo integration.
- **PiecesOS Context**: Semantic code snippet retrieval (LTM) with relevance scoring for continuous context sync.

### State Management

All application state lives in `App.tsx` via React `useState` hooks — no external state library. Key state includes `pods[]`, `backbone`, `contract`, `snippets[]`, `logs[]`, and various UI toggles.

### Path Aliases

`@/*` maps to the project root (configured in both `vite.config.ts` and `tsconfig.json`).

## Deployment

The GitHub Actions workflow (`.github/workflows/google.yml`) builds a Docker container, pushes it to Google Artifact Registry, and deploys to a GKE cluster using Kustomize. The workflow is a template — GCP project/cluster values must be configured before use.

## Code Conventions

- Components are in `components/` as `.tsx` files
- Types are centralized in `types.ts`
- Mock/seed data lives in `constants.tsx`
- Tailwind utility classes for all styling (no CSS files)
- Dark theme with cyan/blue accent colors throughout the UI
