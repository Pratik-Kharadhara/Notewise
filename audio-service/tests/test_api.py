import io

import soundfile as sf

from app.core.config import settings


def _post(client, name, content):
    return client.post("/clean", files={"file": (name, content, "audio/wav")})


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_clean_returns_wav(client, make_wav):
    wav = make_wav(sr=16000, channels=1)
    r = _post(client, "ok.wav", wav)
    assert r.status_code == 200
    assert r.headers["content-type"] == "audio/wav"
    assert r.content[:4] == b"RIFF"
    data, sr = sf.read(io.BytesIO(r.content))
    assert sr == 16000
    assert len(data) == 32000  # length preserved


def test_clean_stereo_preserves_channels(client, make_wav):
    r = _post(client, "st.wav", make_wav(channels=2))
    assert r.status_code == 200
    data, _ = sf.read(io.BytesIO(r.content), always_2d=True)
    assert data.shape[1] == 2


def test_rejects_wrong_extension(client, make_wav):
    r = _post(client, "audio.mp3", make_wav())
    assert r.status_code == 400
    assert r.json()["error"] == "INVALID_FILE_TYPE"


def test_rejects_corrupted_file(client):
    r = _post(client, "bad.wav", b"this is a corrupt file")
    assert r.status_code == 400
    assert r.json()["error"] == "CORRUPTED_AUDIO"


def test_rejects_truncated_wav(client, make_wav):
    r = _post(client, "cut.wav", make_wav()[:30])
    assert r.status_code == 400
    assert r.json()["error"] == "CORRUPTED_AUDIO"


def test_rejects_too_short(client, make_wav):
    r = _post(client, "tiny.wav", make_wav(duration=0.005))
    assert r.status_code == 400
    assert r.json()["error"] == "CORRUPTED_AUDIO"


def test_rejects_oversized(client, make_wav, monkeypatch):
    monkeypatch.setattr(settings, "max_file_size_mb", 0.01)  # ~10 KB
    r = _post(client, "big.wav", make_wav(duration=2.0))     # ~64 KB
    assert r.status_code == 413
    assert r.json()["error"] == "FILE_TOO_LARGE"


def test_missing_file_field(client):
    r = client.post("/clean")
    assert r.status_code == 422
    assert r.json()["error"] == "INVALID_REQUEST"
    assert "detail" in r.json()
