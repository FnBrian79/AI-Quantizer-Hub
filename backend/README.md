# Beast Sovereign Backend Stack

Python MCP server that bridges **Claude Code on any spoke machine** (ROG15, etc.)
to **Ollama on The Beast** (192.168.0.202) via the Model Context Protocol.

---

## What This Is

The Hub frontend (React/Vite) connects directly to Ollama's REST API.
The MCP server adds a second access path — **tool-level control** — so
Claude Code sessions can:

- Query which models are loaded
- Generate text / run multi-turn chats via sovereign-qwen
- Pull new models to The Beast
- Read GPU telemetry (VRAM, utilisation, temperature, power)

---

## Quick Start (on The Beast)

```bash
# 1. Create a venv
python3 -m venv ~/.venv/beast-mcp
source ~/.venv/beast-mcp/bin/activate

# 2. Install deps
pip install -r requirements.txt

# 3. Run manually (stdio — Claude Code will spawn this)
python beast_mcp_server.py
```

### Register with Claude Code (on any spoke)

Add to `~/.claude.json` (or the project-level `.mcp.json`):

```json
{
  "mcpServers": {
    "beast": {
      "command": "ssh",
      "args": [
        "brian@192.168.0.202",
        "source ~/.venv/beast-mcp/bin/activate && python ~/AI-Quantizer-Hub/backend/beast_mcp_server.py"
      ]
    }
  }
}
```

> **Note:** The MCP transport is stdio over SSH. No extra ports need to be open.

---

## Run as a Systemd Service (persistent)

```bash
sudo cp beast_gateway.service /etc/systemd/system/beast-mcp.service
sudo systemctl daemon-reload
sudo systemctl enable beast-mcp.service
sudo systemctl start beast-mcp.service
```

---

## Available Tools

| Tool | Description |
|---|---|
| `ollama_status` | Lists running models, confirms Ollama is alive |
| `ollama_generate` | Text generation (defaults to `sovereign-qwen:latest`) |
| `ollama_chat` | Multi-turn chat with message history |
| `ollama_pull` | Pull a new model from Ollama registry |
| `gpu_status` | nvidia-smi snapshot (VRAM, temp, utilisation) |

---

## Files

| File | Purpose |
|---|---|
| `beast_mcp_server.py` | MCP server — entry point |
| `requirements.txt` | Python deps (`mcp`, `httpx`) |
| `beast_gateway.service` | Systemd unit file for The Beast |
| `README.md` | This file |
