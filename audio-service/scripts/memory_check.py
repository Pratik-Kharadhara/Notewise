"""Memory/time check on a long synthetic recording (calls the service code directly).

Usage (from audio-service/):
    python -m scripts.memory_check --minutes 90 --sr 16000
Note: tracemalloc sees Python/numpy allocations only; also watch the python.exe
process in Task Manager while it runs for the real peak.
"""
import argparse
import tempfile
import time
import tracemalloc
from pathlib import Path

import numpy as np
import soundfile as sf

from app.services.noise_reduction import reduce_noise_wav


def make_long_wav(path: Path, minutes: float, sr: int) -> None:
    """Write the test file one minute at a time so generating it needs little RAM."""
    rng = np.random.default_rng(0)
    total, step, done = int(minutes * 60 * sr), 60 * sr, 0
    with sf.SoundFile(str(path), "w", samplerate=sr, channels=1, format="WAV", subtype="PCM_16") as f:
        while done < total:
            n = min(step, total - done)
            t = (np.arange(n) + done) / sr
            speechlike = 0.2 * np.sin(2 * np.pi * 220 * t) * (np.sin(2 * np.pi * 0.3 * t) > 0)
            f.write((speechlike + rng.normal(0, 0.02, n)).astype(np.float32))
            done += n


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--minutes", type=float, default=90)
    p.add_argument("--sr", type=int, default=16000)
    args = p.parse_args()

    with tempfile.TemporaryDirectory() as tmp:
        src, dst = Path(tmp) / "long.wav", Path(tmp) / "out.wav"
        make_long_wav(src, args.minutes, args.sr)
        print(f"input: {src.stat().st_size / 1e6:.1f} MB, {args.minutes:g} min @ {args.sr} Hz")

        tracemalloc.start()
        t0 = time.perf_counter()
        reduce_noise_wav(src, dst)
        secs = time.perf_counter() - t0
        _, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        frames_in, frames_out = sf.info(str(src)).frames, sf.info(str(dst)).frames
        print(f"time: {secs:.1f} s | peak traced memory: {peak / 1e6:.0f} MB")
        print(f"frames in/out: {frames_in}/{frames_out} -> {'OK' if frames_in == frames_out else 'MISMATCH'}")


if __name__ == "__main__":
    main()
