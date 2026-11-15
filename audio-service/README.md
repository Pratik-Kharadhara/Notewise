# Audio Noise-Reduction Microservice

Spectral-gating noise reduction (noisereduce) behind a small FastAPI service.
Owner: Member 3 (Audio Processing).

## Setup
```bash
python -m venv venv
# Windows: .\venv\Scripts\activate
source venv/bin/activate          # Linux/macOS
pip install -r requirements.txt
cp .env.example .env              # optional
uvicorn app.main:app --reload --port 8000
curl http://localhost:8000/health
```

## API contract (frozen)
| Endpoint | Behaviour |
|---|---|
| `GET /health` | `{"status": "ok"}` |
| `POST /clean` | multipart field `file` (WAV, up to 100 MB) -> `audio/wav` binary body (same sample rate, channels, length) |

```bash
curl -F "file=@samples/raw/fan_noise.wav" http://localhost:8000/clean -o cleaned.wav
```

### Errors
All errors are JSON: `{"error": {"code": "...", "message": "..."}}`

| Status | code | When |
|---|---|---|
| 400 | `INVALID_FILE_TYPE` | filename does not end in `.wav` |
| 400 | `CORRUPTED_AUDIO` | not a real WAV, truncated, empty, or too short |
| 413 | `FILE_TOO_LARGE` | over `MAX_FILE_SIZE_MB` (100) |
| 422 | `INVALID_REQUEST` | `file` field missing |
| 500 | `PROCESSING_FAILED` | noise reduction raised an exception (logged) |

## Tests
```bash
pytest
```

## Before/after + SNR testing (Week 1)
1. Put raw classroom recordings in `samples/raw/` (ceiling/desk fans, whispers,
   back-row echo, normal speech). Use WAV; name files by condition, e.g. `fan_back_row.wav`.
2. Run:
   ```bash
   python -m scripts.compare_samples
   ```
   Cleaned files go to `samples/cleaned/`; SNR table to `samples/snr_report.csv`.
3. Listen to every pair. SNR gain alone is not enough: raise `NR_PROP_DECREASE`
   until whispers start sounding muffled/"watery", then back off.
   Try `NR_STATIONARY=true` for constant fan noise.

SNR is a *blind estimate* (quietest frames = noise, loudest = signal), so use it to
compare before vs after on the same file, not as an absolute measurement.

## Operational notes
- Memory: a WAV is loaded as float32 and the spectral gate needs several copies, so a
  100 MB file can use ~1-2 GB RAM. `MAX_CONCURRENT_JOBS` caps parallel jobs.
- Size limit: the 100 MB check uses the `Content-Length` header and the bytes received,
  but the multipart body is already received when it runs. Also set a body limit at the
  reverse proxy (e.g. nginx `client_max_body_size 100m;`).
- Output keeps the input's sample rate, channel count and bit depth (PCM/float).
