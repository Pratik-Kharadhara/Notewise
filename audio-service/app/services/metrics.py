"""Audio quality metrics for before/after comparison."""
import numpy as np

_EPS = 1e-12


def _mono(audio) -> np.ndarray:
    a = np.asarray(audio, dtype=np.float64)
    return a.mean(axis=1) if a.ndim == 2 else a


def estimate_snr_db(
    audio,
    sr: int,
    frame_ms: float = 25.0,
    noise_percentile: float = 10.0,
    signal_percentile: float = 70.0,
    silence_floor_db: float = 60.0,
    min_active_frames: int = 10,
) -> float:
    """Blind SNR estimate (no clean reference needed).

    Frames more than `silence_floor_db` below the loudest frame are treated as
    digital silence / gated audio and ignored (otherwise they would be mistaken
    for "noise" and inflate the SNR). Among the remaining frames, noise power =
    mean power of the quietest ones; signal power = mean power of the loudest
    ones minus noise. Use it to COMPARE before vs after on the same recording,
    not as an absolute lab measurement.

    Raises ValueError if the audio is too short, silent, or has too few
    non-silent frames to estimate from.
    """
    x = _mono(audio)
    n = max(1, int(sr * frame_ms / 1000))
    if len(x) < n * 10:
        raise ValueError("Audio too short for SNR estimation")
    frames = x[: len(x) // n * n].reshape(-1, n)
    power = np.mean(frames**2, axis=1)

    peak = float(power.max())
    if peak <= _EPS:
        raise ValueError("Audio is silent")
    active = power[power >= peak * 10 ** (-silence_floor_db / 10)]
    if len(active) < min_active_frames:
        raise ValueError("Too little non-silent audio for SNR estimation")

    noise_thr = np.percentile(active, noise_percentile)
    sig_thr = np.percentile(active, signal_percentile)
    noise = max(float(active[active <= noise_thr].mean()), _EPS)
    speech = float(active[active >= sig_thr].mean())
    return float(10 * np.log10(max(speech - noise, _EPS) / noise))


def snr_db(reference, test) -> float:
    """True SNR (dB) of `test` against a known clean `reference`."""
    r, t = _mono(reference), _mono(test)
    n = min(len(r), len(t))
    r, t = r[:n], t[:n]
    noise = np.mean((t - r) ** 2)
    return float(10 * np.log10(max(np.mean(r**2), _EPS) / max(noise, _EPS)))