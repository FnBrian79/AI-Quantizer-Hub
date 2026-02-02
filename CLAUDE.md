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

## Infrastructure — "The GKE Dojo"

### Hardware: "The Beast" (New Metal)

- **GPU**: NVIDIA GeForce RTX 5070 (12,227 MiB VRAM)
- **NVIDIA Driver**: 591.86 (SMI 590.57)
- **CUDA**: 13.1
- **OS Layer**: Windows + WSL 2 (Docker Desktop integration)
- GPU access confirmed inside WSL and Docker containers via `nvidia-smi`

### Runtime Environment

- **Docker**: v29.1.3 — confirmed operational in WSL
- **Docker Compose**: v5.0.1 — available as both `docker compose` (plugin) and `docker-compose` (standalone)
- **Docker Desktop** running on Windows, integrated with WSL 2
- Containers run inside WSL with GPU passthrough for accelerated AI workloads

### GKE (Google Kubernetes Engine)

- **Project**: MYthOS (Google Cloud)
- Deployment via GitHub Actions (`.github/workflows/google.yml`) — builds a Docker container, pushes to Google Artifact Registry, deploys to GKE using Kustomize
- Workflow is a template — GCP project/cluster values must be configured before use
- Requires: service accounts, API keys, OAuth config, Workload Identity Federation

### Deployed Services

- **Sovereign Chronicler**: FastAPI service with async Google Drive sync, deployed to GKE. Configured with `Deployment`, `Service`, and `PVC` manifests in `deployment.yaml`.

### Key Infrastructure Concepts

- **GKE Dojo**: The full agentic AI ecosystem running across GKE + local RTX backbone
- **Sovereign Sanctuary**: The secure operational environment for agent orchestration
- **Gristle Processing**: GPU-intensive AI workloads running on The Beast
- **Self-Evolving Contracts**: Prompt lineage tracked in `lineage.jsonl` within the Sanctum

## Security — ISOKrypt Architecture (FORGE_PRIORITY_ZERO — Complete)

ISOKrypt is the security architecture for the Sovereign Sanctuary. Conceptualization is complete; protocols are defined.

### `.sanctum/` Directory (pending commit to repo)

```
.sanctum/
├── vault/                          # Secure artifact storage
├── protocols/
│   ├── cryo_chamber.md             # State-freezing / isolation protocol for compromised components
│   └── lien_enforcement.md         # Agentic Security Gateway — access control and resource governance
└── lineage.jsonl                   # Genesis-stamped secure lineage log
```

### Key Protocols

- **Cryo-Chamber**: Isolation and containment — freezes state of compromised components for forensic analysis and recovery
- **Lien-Enforcement**: Access control and resource governance for the Agentic Security Gateway
- Designed for self-healing and security resilience across the distributed agent ecosystem

## Automation — "The Gauntlet"

Playwright is being set up for automation and testing within the GKE Dojo. This covers:

- End-to-end testing of the dashboard UI
- Automated interaction frameworks for agent orchestration validation

## Current Priorities

1. ~~**Docker/WSL integration**~~ — RESOLVED: Docker v29.1.3 operational in WSL
2. ~~**Hardware validation**~~ — RESOLVED: RTX 5070 confirmed, CUDA 13.1, driver 591.86
3. ~~**ISOKrypt conceptualization**~~ — RESOLVED: architecture defined, protocols in `.sanctum/` (pending commit)
4. **Playwright setup** — configure "The Gauntlet" automation framework
5. **Google Cloud credentials** — finalize IAM, service accounts, and OAuth for Project MYthOS

## Known Blockers

- ~~`docker` CLI not consistently available inside WSL~~ — RESOLVED (v29.1.3 confirmed)
- Remote desktop connectivity to The Beast is unreliable — limits remote troubleshooting
- ~~`docker-compose` not found in terminal~~ — RESOLVED (v5.0.1 available as plugin and standalone)

## Code Conventions

- Components are in `components/` as `.tsx` files
- Types are centralized in `types.ts`
- Mock/seed data lives in `constants.tsx`
- Tailwind utility classes for all styling (no CSS files)
- Dark theme with cyan/blue accent colors throughout the UI
