# Tasks for AntiGravity — Hub × Beast Sovereign Stack

Priority-ordered checklist. Work top-to-bottom.

---

## 🔴 P0 — Unblock Backbone

- [ ] **T1 — Verify Ollama on The Beast**
  ```bash
  curl http://192.168.0.202:11434/api/tags
  ```
  Expected: JSON with `models` array containing `sovereign-qwen`.
  If not running: `ollama serve` (in a persistent tmux/screen session).

- [ ] **T2 — Verify sovereign-qwen model**
  ```bash
  ollama list   # on The Beast
  ```
  If missing:
  ```bash
  ollama create sovereign-qwen -f ./Modelfile
  ```
  (Modelfile should be in `~/.FnBrian79/` or the original model dir.)

- [ ] **T3 — Sanity-test sovereign-qwen**
  ```bash
  curl -X POST http://localhost:11434/api/generate \
    -d '{"model":"sovereign-qwen","prompt":"What is your purpose?","stream":false}'
  ```
  Expected: JSON with `sovereign` personality response in `response` field.

---

## 🟡 P1 — Deploy Beast MCP Server

- [ ] **T4 — Create venv + install deps**
  ```bash
  python3 -m venv ~/.venv/beast-mcp
  source ~/.venv/beast-mcp/bin/activate
  pip install -r ~/AI-Quantizer-Hub/backend/requirements.txt
  ```

- [ ] **T5 — Test MCP server manually**
  ```bash
  python ~/AI-Quantizer-Hub/backend/beast_mcp_server.py
  ```
  Should print: `🔱 Beast Sovereign MCP Server — starting (stdio transport)`
  (Ctrl+C to stop — this is fine, stdio waits for a client.)

- [ ] **T6 — Register MCP server in Claude Code (on ROG15)**
  Edit `~/.claude.json` on ROG15 (or run `claude mcp add`):
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
  Then restart Claude Code and run: `/mcp` to confirm `beast` appears as connected.

- [ ] **T7 — Test MCP tools from Claude Code**
  In a Claude Code session: "Use the beast MCP server to check Ollama status"
  Expected: tool call `ollama_status` → returns list of models.

---

## 🟢 P2 — Systemd (Persistent Service)

- [ ] **T8 — Install systemd unit on The Beast**
  ```bash
  sudo cp ~/AI-Quantizer-Hub/backend/beast_gateway.service \
    /etc/systemd/system/beast-mcp.service
  # Edit WorkingDirectory and ExecStart paths if needed
  sudo systemctl daemon-reload
  sudo systemctl enable beast-mcp.service
  sudo systemctl start beast-mcp.service
  sudo systemctl status beast-mcp.service
  ```
  Note: stdio-transport MCP servers don't actually run as daemons in the
  traditional sense — the service file is for ensuring the venv and deps
  are always present. Claude Code spawns the process on demand via SSH.

---

## 🔵 P3 — Hub Integration Smoke Test

- [ ] **T9 — Hub backbone connection test**
  Open Hub at `http://localhost:5173` on ROG15.
  Settings → Backbone IP: `192.168.0.202` → Port: `11434` → hit **Test Connection**.
  Expected: green ✓ with model list populated.

- [ ] **T10 — End-to-end prompt run**
  Select a pod in the Hub → enter a prompt → Run.
  Backbone pod (sovereign-qwen) should respond within 30s.

---

## 📋 Future / Stretch

- [ ] **T11 — GPU telemetry in Hub UI**
  Expose `gpu_status` tool data in the Hub's BackboneStatus component.
  Wire: MCP call on a 30s poll → update `backbone.memoryUsage`.

- [ ] **T12 — Bridge handshake protocol (Task 5)**
  Define a `/api/handshake` endpoint so Hub can auto-detect The Beast
  on the LAN without manual IP entry.

- [ ] **T13 — Merge sovereign-qwen Modelfile into repo**
  Add the Modelfile to `backend/` so any machine can recreate the model.

- [ ] **T14 — Merge `feat/settings-encrypted-storage` PR**
  That PR has encrypted API key storage ready. Review + merge before
  this branch to keep history clean.

---

## Context / Lore

- **The Beast** = RTX 5070 workstation on LAN (192.168.0.202), runs Ollama
- **ROG15** = ASUS ROG laptop (this machine), runs Claude Code + Hub dev server
- **sovereign-qwen** = custom Ollama model with FnBrian79 sovereign personality
- **AntiGravity** = the broader project umbrella; Maestro AI Vertex codebase
- **Hub** = React frontend orchestrating multi-LLM reasoning pods

---

*Last updated: 2026-02-26 by Claude (Sonnet) × FnBrian79*
