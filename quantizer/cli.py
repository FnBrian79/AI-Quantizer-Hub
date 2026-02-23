#!/usr/bin/env python3
"""
Forge CLI – AI-Quantizer-Hub quantization engine
=================================================

Subcommands
-----------
  fetch           Download a Hugging Face model snapshot to the cache dir.
  quant gguf      Convert + quantize a model to GGUF format via llama.cpp.
  bench           Report output file sizes and show a sample llama.cpp run command.
  recommend       Suggest GGUF quant types based on available VRAM.

Usage
-----
  python -m quantizer.cli --config quantizer/configs/forge_default.yaml fetch --repo TheBloke/Mistral-7B-v0.1-GGUF
  python -m quantizer.cli quant gguf
  python -m quantizer.cli bench
  python -m quantizer.cli recommend --vram 12
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
from pathlib import Path
from typing import Any

import yaml

# ── default paths ─────────────────────────────────────────────────────────────
_REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CONFIG = _REPO_ROOT / "quantizer" / "configs" / "forge_default.yaml"


# ── logging setup ─────────────────────────────────────────────────────────────
def _setup_logging(level: str = "INFO") -> None:
    numeric = getattr(logging, level.upper(), logging.INFO)
    logging.basicConfig(
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%H:%M:%S",
        level=numeric,
    )


# ── config loader ─────────────────────────────────────────────────────────────
def _load_config(path: Path) -> dict[str, Any]:
    if not path.exists():
        sys.exit(f"[forge] Config file not found: {path}")
    with path.open() as fh:
        cfg = yaml.safe_load(fh)
    if not isinstance(cfg, dict):
        sys.exit(f"[forge] Config file is invalid (expected a YAML mapping): {path}")
    return cfg


# ── subcommand: fetch ─────────────────────────────────────────────────────────
def cmd_fetch(args: argparse.Namespace, cfg: dict[str, Any]) -> int:
    from quantizer.pipelines.gguf import fetch_model

    repo_id = args.repo
    if not repo_id:
        # Fall back to first model in config
        models = cfg.get("models", [])
        if not models:
            sys.exit("[forge] No --repo specified and no models defined in config.")
        repo_id = models[0]["repo_id"]

    cache_dir = Path(args.cache_dir or cfg.get("cache_dir", "/cache/models"))
    skip = not args.force

    log = logging.getLogger(__name__)
    log.info("Fetching model: %s → %s", repo_id, cache_dir)
    dest = fetch_model(repo_id, cache_dir, skip_existing=skip)
    log.info("Model available at: %s", dest)
    return 0


# ── subcommand: quant gguf ────────────────────────────────────────────────────
def cmd_quant_gguf(args: argparse.Namespace, cfg: dict[str, Any]) -> int:
    from quantizer.pipelines.gguf import run_pipeline

    log = logging.getLogger(__name__)
    models = cfg.get("models", [])
    if not models:
        sys.exit("[forge] No models defined in config.")

    # Override with CLI args when provided
    if args.repo:
        quant_types = args.quant_types or ["Q4_K_M"]
        targets = [{"repo_id": args.repo, "quant_types": quant_types}]
    else:
        targets = models

    # Allow per-run path overrides
    if args.cache_dir:
        cfg = {**cfg, "cache_dir": args.cache_dir}
    if args.output_dir:
        cfg = {**cfg, "output_dir": args.output_dir}

    all_outputs: list[Path] = []
    for target in targets:
        outputs = run_pipeline(cfg, target["repo_id"], target["quant_types"])
        all_outputs.extend(outputs)

    log.info("All done. Outputs:")
    for p in all_outputs:
        size_mb = p.stat().st_size / 1024 / 1024 if p.exists() else 0
        log.info("  %s  (%.1f MB)", p, size_mb)
    return 0


# ── subcommand: bench ─────────────────────────────────────────────────────────
def cmd_bench(args: argparse.Namespace, cfg: dict[str, Any]) -> int:
    import glob as _glob

    output_dir = Path(args.output_dir or cfg.get("output_dir", "/out"))
    llama_cpp_dir = cfg.get("llama_cpp_dir", "/opt/llama.cpp")
    main_bin = Path(llama_cpp_dir) / "build" / "bin" / "llama-cli"

    print(f"\n{'─'*60}")
    print(f"  Bench report – output directory: {output_dir}")
    print(f"{'─'*60}")

    gguf_files = sorted(output_dir.glob("**/*.gguf")) if output_dir.exists() else []
    if not gguf_files:
        print("  (no .gguf files found – run `quant gguf` first)")
    else:
        for f in gguf_files:
            size_mb = f.stat().st_size / 1024 / 1024
            print(f"  {f.name:<60}  {size_mb:>8.1f} MB")
            print(f"    Sample run: {main_bin} -m {f} -p 'Hello, world!' -n 32")

    print(f"{'─'*60}\n")
    return 0


# ── subcommand: recommend ─────────────────────────────────────────────────────

# Heuristic table: (min_vram_gb, quant_type, label)
_VRAM_TABLE = [
    (4,  "Q2_K",   "Very aggressive – minimal quality, runs on 4 GB"),
    (6,  "Q4_K_S", "Balanced small – good quality, fits 6 GB"),
    (8,  "Q4_K_M", "Recommended – great quality, fits 8 GB+"),
    (10, "Q5_K_M", "High quality – near-lossless, fits 10 GB+"),
    (12, "Q6_K",   "Premium – excellent quality, fits 12 GB+"),
    (16, "Q8_0",   "Near-lossless – full precision, 16 GB+"),
]


def cmd_recommend(args: argparse.Namespace, cfg: dict[str, Any]) -> int:
    vram = args.vram
    if vram is None or vram <= 0:
        sys.exit("[forge] Please supply --vram <GB> (e.g., --vram 12)")

    print(f"\n  VRAM available: {vram} GB")
    print("  Recommended GGUF quant types:\n")
    found = False
    best_min = max((m for m, _, _ in _VRAM_TABLE if vram >= m), default=None)
    for min_v, qt, label in _VRAM_TABLE:
        if vram >= min_v:
            marker = "  ✓" if min_v == best_min else "   "
            print(f"  {marker}  {qt:<12} – {label}")
            found = True
    if not found:
        print("  (less than 4 GB VRAM detected – GGUF inference may not be feasible)")
    print()
    return 0


# ── argument parser ───────────────────────────────────────────────────────────
def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="forge",
        description="Forge – GGUF-first AI model quantization engine",
    )
    parser.add_argument(
        "--config",
        default=str(DEFAULT_CONFIG),
        metavar="PATH",
        help="Path to YAML config file (default: %(default)s)",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging verbosity (default: %(default)s)",
    )

    sub = parser.add_subparsers(dest="command", metavar="COMMAND")
    sub.required = True

    # fetch
    p_fetch = sub.add_parser("fetch", help="Download a HF model snapshot to the cache dir")
    p_fetch.add_argument("--repo", metavar="REPO_ID", help="Hugging Face repo ID")
    p_fetch.add_argument("--cache-dir", metavar="PATH", help="Override cache directory")
    p_fetch.add_argument("--force", action="store_true", help="Re-download even if cached")

    # quant (with sub-subcommand)
    p_quant = sub.add_parser("quant", help="Quantize a model")
    quant_sub = p_quant.add_subparsers(dest="quant_format", metavar="FORMAT")
    quant_sub.required = True

    p_gguf = quant_sub.add_parser("gguf", help="Convert + quantize to GGUF via llama.cpp")
    p_gguf.add_argument("--repo", metavar="REPO_ID", help="Override repo from config")
    p_gguf.add_argument(
        "--quant-types",
        nargs="+",
        metavar="TYPE",
        help="Quant types (e.g. Q4_K_M Q5_K_M)",
    )
    p_gguf.add_argument("--cache-dir", metavar="PATH", help="Override cache directory")
    p_gguf.add_argument("--output-dir", metavar="PATH", help="Override output directory")

    # bench
    p_bench = sub.add_parser("bench", help="Report output file sizes and sample run commands")
    p_bench.add_argument("--output-dir", metavar="PATH", help="Directory containing .gguf files")

    # recommend
    p_rec = sub.add_parser("recommend", help="Suggest quant types based on VRAM")
    p_rec.add_argument("--vram", type=float, metavar="GB", help="Available VRAM in GB")

    return parser


# ── entry point ───────────────────────────────────────────────────────────────
def main() -> int:
    parser = _build_parser()
    args = parser.parse_args()

    _setup_logging(args.log_level)
    cfg = _load_config(Path(args.config))

    dispatch = {
        "fetch": cmd_fetch,
        "bench": cmd_bench,
        "recommend": cmd_recommend,
    }

    if args.command == "quant":
        return cmd_quant_gguf(args, cfg)
    elif args.command in dispatch:
        return dispatch[args.command](args, cfg)
    else:
        parser.print_help()
        return 1


if __name__ == "__main__":
    sys.exit(main())
