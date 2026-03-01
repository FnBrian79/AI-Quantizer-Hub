# Handoff — AI Quantizer Hub × Beast Sovereign Stack

**Date:** 2026-02-26
**From:** Claude (Sonnet) + FnBrian79
**To:** AntiGravity team / next Claude session / any spoke picking up this work

---

## Project State

| Layer | Status | Location |
|---|---|---|
| Hub frontend (React/Vite) | ✅ Running on port 5173 | `C:\Users\brian\.FnBrian79\AI-Quantizer-Hub` |
| Encrypted API key storage | ✅ Merged to `feat/settings-encrypted-storage` | `secureStorage.ts` |
| Beast MCP Server | 🟡 Code written, not yet deployed | `backend/beast_mcp_server.py` |
| Ollama + sovereign-qwen | ⚠ Needs health check on The Beast | `192.168.0.202:11434` |

---

## The Beast

| Property | Value |
|---|---|
| IP (LAN) | 192.168.0.202 |
| GPU | NVIDIA RTX 5070 |
| Ollama port | 11434 |
| Primary model | `sovereign-qwen:latest` |
| MCP server venv | `~/.venv/beast-mcp` (create if missing) |

---

## What Still Needs Doing

See `TASKS_FOR_ANTIGRAVITY.md` for the full task list.

**Critical path:**
1. Verify Ollama is running on The Beast (`curl http://192.168.0.202:11434/api/tags`)
2. Deploy the MCP server on The Beast (`backend/beast_mcp_server.py`)
3. Register the MCP server in Claude Code on ROG15
4. Run the Hub, test backbone connection (Settings → Test Connection)
5. Open the `feat/backend-sovereign-stack` PR → merge after tests pass

---

## Architecture Diagram

```
ROG15 (spoke)                   The Beast (backbone)
┌──────────────────┐            ┌────────────────────────────┐
│  Claude Code     │──MCP/SSH──▶│  beast_mcp_server.py       │
│  (this session)  │            │  ↕                         │
├──────────────────┤            │  Ollama :11434              │
│  Hub (Vite:5173) │──HTTP/LAN─▶│  └─ sovereign-qwen         │
│  React frontend  │            │  └─ [other models]         │
└──────────────────┘            ├────────────────────────────┤
                                │  GPU: RTX 5070             │
                                │  RAM: 64 GB                │
                                └────────────────────────────┘
```

---

## Key Files

```
AI-Quantizer-Hub/
├── App.tsx               — Hub frontend, backbone settings modal
├── secureStorage.ts      — AES-GCM encrypted localStorage (v2)
├── backend/
│   ├── beast_mcp_server.py    ← NEW — MCP server for The Beast
│   ├── beast_gateway.service  ← NEW — systemd unit
│   ├── requirements.txt       ← NEW — pip deps
│   └── README.md              ← NEW — setup guide
├── HANDOFF.md                 ← this file
└── TASKS_FOR_ANTIGRAVITY.md   ← task checklist
```

---

## Branch / PR

- Feature branch: `feat/backend-sovereign-stack` (branched from `main`)
- Target: `main`
- PR title: `feat: Beast sovereign MCP server + backend stack`

Merge after:
- [ ] MCP server confirmed running on The Beast
- [ ] `ollama_status` tool returns model list
- [ ] Hub backbone test shows green
