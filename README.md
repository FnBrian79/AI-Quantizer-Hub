# AI Quantizer Hub

*Sovereign, local-first AI orchestration, experiment tracking, and evidence-oriented data processing.*

AI Quantizer Hub is a local-first system for orchestrating multiple AI workflows across personal hardware (“the Beast”) and optional cloud infrastructure. It emphasizes reproducibility, strong provenance, and an operator-ratified governance model.

## Why this exists

- **Local-first inference** to reduce dependency on cloud rate limits and external availability.
- **Provenance-aware workflows** so experiments, outputs, and transforms can be traced back to inputs.
- **Operator sovereignty**: delegated agents can assist, but irreversible actions remain explicitly ratified by the human operator.

## Key capabilities

- **Sovereign Bridge (SSH-based control plane):** low-friction connectivity between mobile and workstation nodes using SSH with constrained, auditable execution paths.
- **Takeout → Ledger pipeline (forensic-oriented):** transforms large Google Takeout archives into structured local stores (e.g., SQLite) with hashing and run manifests to support reproducibility and chain-of-custody style auditing.
- **Constitutional governance:** project governance and authority boundaries are documented in the Sovereign Constitution (v1.1).
- **Local secrets handling:** supports keeping credentials local and encrypted (implementation-dependent; see docs for the current mechanism).
- **Quantization + VRAM-aware execution:** tools and workflows aimed at fitting models within local GPU constraints.

## Architecture (high level)

- **Frontend:** React + TypeScript + Vite + Tailwind
- **Backbone inference:** Ollama (local)
- **Backend services:** Python (FastAPI or equivalent, depending on branch)
- **Storage:** SQLite for local ledgers and manifests; optional sync/degradation paths as documented

## Quick start (developer)

### Prerequisites
- Node.js (LTS recommended)
- Python 3.10+ (recommended)
- Ollama installed and running (for local models)

### Install
```bash
git clone https://github.com/FnBrian79/AI-Quantizer-Hub.git
cd AI-Quantizer-Hub
npm install
```

### Run (example)
> Exact commands may differ by branch. Prefer the docs in `/docs` for your current target.

```bash
npm run dev
```

If your branch includes a local gateway/backbone relay:
```bash
python3 beast_gateway.py
```

## Governance / documentation

- **Sovereign Constitution (v1.1):** `docs/sovereign/TORSION_FIELD_GENERATOR_SOVEREIGN_CONSTITUTION_v1.1.md`
- **Operator handoff / continuity:** `HANDOFF.md`
- **Active task ledger:** `TASKS_FOR_ANTIGRAVITY.md`

## Security notes (practical)

- Treat any imported archives (e.g., Takeout) as sensitive by default.
- Prefer local-only processing for PII until anonymization/redaction is complete.
- Avoid committing secrets. Use environment variables or local encrypted stores.

## Contributing

This repo is operator-led. If you want to contribute, start by reading `HANDOFF.md` and the Constitution v1.1 to understand scope, boundaries, and workflow expectations.
