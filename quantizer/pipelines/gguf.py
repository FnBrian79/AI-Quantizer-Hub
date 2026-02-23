"""
Forge GGUF Pipeline
===================
Steps:
  1. Resolve / download the HF model snapshot into the cache directory.
  2. Convert the safetensors/bin checkpoint to GGUF (F16) using llama.cpp.
  3. Quantize the F16 GGUF to each requested quant type.

All paths come from the resolved config dict so they are fully configurable.
"""

from __future__ import annotations

import logging
import os
import shutil
import subprocess
from pathlib import Path
from typing import Any

log = logging.getLogger(__name__)


# ── helpers ───────────────────────────────────────────────────────────────────

def _run(cmd: list[str], *, cwd: Path | None = None) -> None:
    """Run a subprocess command, streaming output and raising on failure."""
    log.info("$ %s", " ".join(str(c) for c in cmd))
    result = subprocess.run(cmd, cwd=cwd, text=True, capture_output=False)
    if result.returncode != 0:
        raise RuntimeError(
            f"Command failed (exit {result.returncode}): {' '.join(str(c) for c in cmd)}"
        )


def _model_cache_path(cache_dir: Path, repo_id: str) -> Path:
    """Return the local snapshot directory for *repo_id*."""
    safe_name = repo_id.replace("/", "--")
    return cache_dir / safe_name


def _check_binary(path: Path, label: str) -> None:
    if not path.exists():
        raise FileNotFoundError(
            f"{label} not found at {path}. "
            "Ensure the Docker image was built correctly (make build-forge)."
        )


# ── public API ────────────────────────────────────────────────────────────────

def fetch_model(repo_id: str, cache_dir: Path, skip_existing: bool = True) -> Path:
    """
    Download *repo_id* from Hugging Face into *cache_dir*.

    Returns the local snapshot directory path.

    Air-gap mode: if the snapshot already exists and *skip_existing* is True,
    the download is skipped.  You can also pre-populate the cache directory by
    copying model files manually (see docs/air-gap mode in README).
    """
    try:
        from huggingface_hub import snapshot_download
    except ImportError as exc:
        raise ImportError(
            "huggingface_hub is required. Install it with: "
            "pip install -r quantizer/requirements.txt"
        ) from exc

    dest = _model_cache_path(cache_dir, repo_id)
    if skip_existing and dest.exists() and any(dest.iterdir()):
        log.info("Cache hit – skipping download for %s (%s)", repo_id, dest)
        return dest

    log.info("Downloading %s → %s", repo_id, dest)
    local_dir = snapshot_download(
        repo_id=repo_id,
        local_dir=str(dest),
    )
    return Path(local_dir)


def convert_to_gguf(
    model_dir: Path,
    output_dir: Path,
    convert_script: Path,
) -> Path:
    """
    Convert *model_dir* (HF safetensors/bin checkpoint) to a GGUF F16 file.

    Returns the path to the generated GGUF file.
    """
    _check_binary(convert_script, "llama.cpp convert script")

    output_dir.mkdir(parents=True, exist_ok=True)
    model_name = model_dir.name
    gguf_f16_path = output_dir / f"{model_name}-F16.gguf"

    if gguf_f16_path.exists():
        log.info("F16 GGUF already exists, skipping conversion: %s", gguf_f16_path)
        return gguf_f16_path

    _run(
        ["python3", str(convert_script), str(model_dir), "--outfile", str(gguf_f16_path)],
    )
    log.info("Conversion complete: %s", gguf_f16_path)
    return gguf_f16_path


def quantize_gguf(
    gguf_f16_path: Path,
    output_dir: Path,
    quant_type: str,
    quantize_bin: Path,
) -> Path:
    """
    Quantize *gguf_f16_path* to *quant_type* using the llama.cpp quantize binary.

    Returns the path to the quantized GGUF file.
    """
    _check_binary(quantize_bin, "llama-quantize binary")

    output_dir.mkdir(parents=True, exist_ok=True)
    stem = gguf_f16_path.stem.replace("-F16", "")
    out_path = output_dir / f"{stem}-{quant_type}.gguf"

    if out_path.exists():
        log.info("Quantized file already exists, skipping: %s", out_path)
        return out_path

    _run([str(quantize_bin), str(gguf_f16_path), str(out_path), quant_type])
    size_mb = out_path.stat().st_size / 1024 / 1024
    log.info("Quantization complete: %s (%.1f MB)", out_path, size_mb)
    return out_path


def run_pipeline(cfg: dict[str, Any], repo_id: str, quant_types: list[str]) -> list[Path]:
    """
    Run the full GGUF pipeline for *repo_id* and each quant type in *quant_types*.

    Returns the list of output GGUF paths.
    """
    cache_dir = Path(cfg["cache_dir"])
    output_dir = Path(cfg["output_dir"])
    convert_script = Path(cfg["convert_script"])
    quantize_bin = Path(cfg["quantize_bin"])
    skip_existing = bool(cfg.get("skip_existing", True))

    cache_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)

    log.info("=== Forge GGUF Pipeline: %s ===", repo_id)

    # Step 1 – fetch
    model_dir = fetch_model(repo_id, cache_dir, skip_existing=skip_existing)

    # Step 2 – convert
    gguf_f16 = convert_to_gguf(model_dir, output_dir, convert_script)

    # Step 3 – quantize (each requested type)
    outputs: list[Path] = []
    for qt in quant_types:
        out = quantize_gguf(gguf_f16, output_dir, qt, quantize_bin)
        outputs.append(out)

    log.info("=== Pipeline finished for %s ===", repo_id)
    return outputs
