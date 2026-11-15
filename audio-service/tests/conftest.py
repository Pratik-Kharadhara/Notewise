import io

import numpy as np
import pytest


@pytest.fixture
def make_wav():
    """Build WAV bytes: first half noise only, second half 440 Hz tone + noise."""

    def _make(duration=2.0, sr=16000, noise=0.02, tone=0.3, channels=1) -> bytes:
        import soundfile as sf

        rng = np.random.default_rng(0)
        t = np.arange(int(duration * sr)) / sr
        sig = np.where(t >= duration / 2, tone * np.sin(2 * np.pi * 440 * t), 0.0)
        audio = (sig + rng.normal(0, noise, t.shape)).astype(np.float32)
        if channels > 1:
            audio = np.stack([audio] * channels, axis=1)
        buf = io.BytesIO()
        sf.write(buf, audio, sr, format="WAV", subtype="PCM_16")
        return buf.getvalue()

    return _make


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    return TestClient(app)
