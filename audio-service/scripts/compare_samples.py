"""Before/after test over real recordings.

Usage (from audio-service/):
    python -m scripts.compare_samples
Reads samples/raw/*.wav -> writes samples/cleaned/*.wav and samples/snr_report.csv
"""
import argparse
import csv
import time
from pathlib import Path

import soundfile as sf

from app.services.metrics import estimate_snr_db
from app.services.noise_reduction import reduce_noise_wav

ROOT = Path(__file__).resolve().parent.parent / "samples"


def _snr(audio, sr):
    try:
        return estimate_snr_db(audio, sr)
    except ValueError:  # silent / too short / too little non-silent audio
        return None


def _fmt(v, width, prec=2):
    return f"{'n/a':>{width}}" if v is None else f"{v:{width}.{prec}f}"


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--raw", type=Path, default=ROOT / "raw")
    p.add_argument("--cleaned", type=Path, default=ROOT / "cleaned")
    p.add_argument("--report", type=Path, default=ROOT / "snr_report.csv")
    args = p.parse_args()

    args.cleaned.mkdir(parents=True, exist_ok=True)
    files = sorted(args.raw.glob("*.wav"))
    if not files:
        raise SystemExit(f"No .wav files in {args.raw}")

    rows = []
    for f in files:
        out = args.cleaned / f.name
        t0 = time.perf_counter()
        reduce_noise_wav(f, out)
        secs = time.perf_counter() - t0

        before, sr = sf.read(str(f), dtype="float32", always_2d=True)
        after, _ = sf.read(str(out), dtype="float32", always_2d=True)
        b, a = _snr(before, sr), _snr(after, sr)
        rows.append(
            {
                "file": f.name,
                "duration_s": round(len(before) / sr, 1),
                "snr_before_db": None if b is None else round(b, 2),
                "snr_after_db": None if a is None else round(a, 2),
                "improvement_db": None if a is None or b is None else round(a - b, 2),
                "process_time_s": round(secs, 1),
            }
        )

    print(f"{'file':32} {'before':>8} {'after':>8} {'gain':>7} {'time':>7}")
    for r in rows:
        print(
            f"{r['file'][:32]:32} {_fmt(r['snr_before_db'], 8)} {_fmt(r['snr_after_db'], 8)} "
            f"{_fmt(r['improvement_db'], 7)} {r['process_time_s']:6.1f}s"
        )

    with args.report.open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    print(f"\nReport saved to {args.report}")


if __name__ == "__main__":
    main()