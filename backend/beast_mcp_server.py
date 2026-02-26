#!/usr/bin/env python3
"""
beast_mcp_server.py — Sovereign MCP Server for The Beast
=========================================================
Exposes The Beast's Ollama instance as MCP tools so that Claude Code
(or any MCP-compatible client) on any spoke machine (ROG15, etc.) can
drive local LLM inference without leaving the sovereign mesh.

Run on The Beast:
    pip install -r requirements.txt
    python beast_mcp_server.py

Or via systemd:
    sudo systemctl start beast-mcp.service

MCP transport: stdio (default for Claude Code integration)
Ollama expected at: http://localhost:11434
"""

import json
import logging
import sys
from typing import Any

import httpx
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

# ── Config ────────────────────────────────────────────────────────────────────
OLLAMA_BASE = "http://localhost:11434"
LOG_LEVEL   = logging.INFO

logging.basicConfig(
    level=LOG_LEVEL,
    format="[%(asctime)s] 🔱 %(levelname)s %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stderr)],
)
log = logging.getLogger("beast-mcp")

# ── Server init ───────────────────────────────────────────────────────────────
server = Server("beast-sovereign-mcp")


# ── Tool definitions ──────────────────────────────────────────────────────────

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="ollama_status",
            description=(
                "Check whether Ollama is running on The Beast and return "
                "the list of locally available models."
            ),
            inputSchema={"type": "object", "properties": {}, "required": []},
        ),
        Tool(
            name="ollama_generate",
            description=(
                "Send a prompt to an Ollama model on The Beast and return "
                "the full response. Defaults to sovereign-qwen:latest."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "The prompt to send to the model.",
                    },
                    "model": {
                        "type": "string",
                        "description": "Ollama model tag (default: sovereign-qwen:latest).",
                        "default": "sovereign-qwen:latest",
                    },
                    "stream": {
                        "type": "boolean",
                        "description": "Whether to stream the response (default: false).",
                        "default": False,
                    },
                },
                "required": ["prompt"],
            },
        ),
        Tool(
            name="ollama_chat",
            description=(
                "Send a multi-turn chat message list to an Ollama model on "
                "The Beast. Each message must have 'role' and 'content'."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "messages": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "role":    {"type": "string", "enum": ["system", "user", "assistant"]},
                                "content": {"type": "string"},
                            },
                            "required": ["role", "content"],
                        },
                        "description": "Chat message history.",
                    },
                    "model": {
                        "type": "string",
                        "description": "Ollama model tag (default: sovereign-qwen:latest).",
                        "default": "sovereign-qwen:latest",
                    },
                },
                "required": ["messages"],
            },
        ),
        Tool(
            name="ollama_pull",
            description=(
                "Pull a model from the Ollama registry onto The Beast. "
                "Returns streaming progress lines. Use for onboarding new models."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "model": {
                        "type": "string",
                        "description": "Ollama model tag to pull (e.g. 'llama3.2:3b').",
                    },
                },
                "required": ["model"],
            },
        ),
        Tool(
            name="gpu_status",
            description=(
                "Return a snapshot of The Beast's GPU status via nvidia-smi. "
                "Includes VRAM usage, utilization %, temperature, and power draw."
            ),
            inputSchema={"type": "object", "properties": {}, "required": []},
        ),
    ]


# ── Tool handlers ─────────────────────────────────────────────────────────────

@server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    log.info(f"Tool called: {name} | args={json.dumps(arguments, default=str)[:200]}")

    async with httpx.AsyncClient(timeout=120.0) as client:

        # ── ollama_status ──────────────────────────────────────────────────
        if name == "ollama_status":
            try:
                r = await client.get(f"{OLLAMA_BASE}/api/tags")
                r.raise_for_status()
                data = r.json()
                models = [m["name"] for m in data.get("models", [])]
                return [TextContent(
                    type="text",
                    text=json.dumps({
                        "status": "online",
                        "ollama_url": OLLAMA_BASE,
                        "models": models,
                        "model_count": len(models),
                    }, indent=2),
                )]
            except Exception as e:
                return [TextContent(type="text", text=json.dumps({
                    "status": "offline",
                    "error": str(e),
                }))]

        # ── ollama_generate ────────────────────────────────────────────────
        elif name == "ollama_generate":
            payload = {
                "model":  arguments.get("model", "sovereign-qwen:latest"),
                "prompt": arguments["prompt"],
                "stream": arguments.get("stream", False),
            }
            try:
                r = await client.post(f"{OLLAMA_BASE}/api/generate", json=payload)
                r.raise_for_status()
                data = r.json()
                return [TextContent(type="text", text=data.get("response", ""))]
            except Exception as e:
                return [TextContent(type="text", text=f"[ERROR] {e}")]

        # ── ollama_chat ────────────────────────────────────────────────────
        elif name == "ollama_chat":
            payload = {
                "model":    arguments.get("model", "sovereign-qwen:latest"),
                "messages": arguments["messages"],
                "stream":   False,
            }
            try:
                r = await client.post(f"{OLLAMA_BASE}/api/chat", json=payload)
                r.raise_for_status()
                data = r.json()
                content = data.get("message", {}).get("content", "")
                return [TextContent(type="text", text=content)]
            except Exception as e:
                return [TextContent(type="text", text=f"[ERROR] {e}")]

        # ── ollama_pull ────────────────────────────────────────────────────
        elif name == "ollama_pull":
            model = arguments["model"]
            lines: list[str] = []
            try:
                async with client.stream(
                    "POST",
                    f"{OLLAMA_BASE}/api/pull",
                    json={"model": model},
                    timeout=600.0,
                ) as resp:
                    async for line in resp.aiter_lines():
                        if line:
                            try:
                                obj = json.loads(line)
                                lines.append(obj.get("status", line))
                            except Exception:
                                lines.append(line)
                return [TextContent(type="text", text="\n".join(lines[-20:]))]
            except Exception as e:
                return [TextContent(type="text", text=f"[ERROR] {e}")]

        # ── gpu_status ─────────────────────────────────────────────────────
        elif name == "gpu_status":
            import asyncio
            try:
                proc = await asyncio.create_subprocess_exec(
                    "nvidia-smi",
                    "--query-gpu=name,temperature.gpu,utilization.gpu,"
                    "memory.used,memory.total,power.draw,power.limit",
                    "--format=csv,noheader,nounits",
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=10)
                if proc.returncode == 0:
                    lines = stdout.decode().strip().splitlines()
                    gpus = []
                    for line in lines:
                        parts = [p.strip() for p in line.split(",")]
                        if len(parts) >= 7:
                            gpus.append({
                                "name":         parts[0],
                                "temp_c":       parts[1],
                                "util_pct":     parts[2],
                                "vram_used_mb": parts[3],
                                "vram_total_mb":parts[4],
                                "power_w":      parts[5],
                                "power_limit_w":parts[6],
                            })
                    return [TextContent(type="text", text=json.dumps({"gpus": gpus}, indent=2))]
                else:
                    return [TextContent(type="text", text=f"nvidia-smi error: {stderr.decode()}")]
            except FileNotFoundError:
                return [TextContent(type="text", text='{"error":"nvidia-smi not found"}')]
            except Exception as e:
                return [TextContent(type="text", text=f"[ERROR] {e}")]

        else:
            return [TextContent(type="text", text=f"[ERROR] Unknown tool: {name}")]


# ── Entry point ───────────────────────────────────────────────────────────────

async def main() -> None:
    log.info("🔱 Beast Sovereign MCP Server — starting (stdio transport)")
    log.info(f"   Ollama target : {OLLAMA_BASE}")
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options(),
        )


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
