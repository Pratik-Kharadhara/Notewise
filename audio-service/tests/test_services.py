import numpy as np
import pytest
import soundfile as sf

from app.core.config import settings
from app.services.metrics import estimate_snr_db, snr_db
from app.services.noise_reduction import reduce_noise_wav


def _signal(noise_level, sr=16000, seconds=2.0):
    rng = np.random.default_rng(1)
    t = np.arange(int(sr * seconds)) / sr
    clean = np.where(t >= seconds / 2, 0.3 * np.sin(2 * np.pi * 440 * t), 0.0)
    return clean, clean + rng.normal(0, noise_level, t.shape), sr


def test_estimated_snr_is_higher_for_cleaner_audio():
    _, low_noise, sr = _signal(0.01)
    _, high_noise, _ = _signal(0.05)
    assert estimate_snr_db(low_noise, sr) > estimate_snr_db(high_noise, sr)


def test_true_snr_is_higher_for_cleaner_audio():
    clean, low_noise, _ = _signal(0.01)
    _, high_noise, _ = _signal(0.05)
    assert snr_db(clean, low_noise) > snr_db(clean, high_noise)


def test_noise_floor_is_reduced(tmp_path, make_wav, monkeypatch):
    monkeypatch.setattr(settings, "nr_stationary", True)
    src, dst = tmp_path / "in.wav", tmp_path / "out.wav"
    src.write_bytes(make_wav(duration=2.0, sr=16000, noise=0.02))

    reduce_noise_wav(src, dst)

    before, _ = sf.read(src)
    after, _ = sf.read(dst)
    half = len(before) // 2 - 1600  # noise-only region (first half, minus margin)
    rms = lambda x: float(np.sqrt(np.mean(x**2)))
    assert rms(after[:half]) < rms(before[:half])


def test_digital_silence_does_not_inflate_snr():
    sr = 16000
    rng = np.random.default_rng(2)
    t = np.arange(sr * 4) / sr
    audio = rng.normal(0, 0.01, t.shape)                  # noise bed
    audio[t >= 2] += 0.3 * np.sin(2 * np.pi * 440 * t[t >= 2])
    audio[: sr // 2] = 0.0                                # digital silence at start
    audio[int(3.5 * sr):] = 0.0                           # and at the end
    assert 10 < estimate_snr_db(audio, sr) < 40


def test_silent_audio_raises():
    with pytest.raises(ValueError):
        estimate_snr_db(np.zeros(16000), 16000)