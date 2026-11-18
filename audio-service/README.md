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

## Input requirements
- The service accepts **WAV only** (`.wav` name and a real RIFF/WAVE header). There is no
  format fallback, so the backend must convert phone formats (M4A, MP3, WebM...) first:
  ```bash
  ffmpeg -i input.m4a -ar 16000 -ac 1 -c:a pcm_s16le output.wav
  ```
  16 kHz mono 16-bit is what Whisper uses internally, so it is also the smallest sensible size.
- **Size limit is 100 MB.** 16 kHz mono 16-bit WAV is about 1.9 MB per minute, so 100 MB is
  roughly 54 minutes. A 90-minute lecture will be rejected (413). Split long recordings
  before calling `/clean`, e.g. 40-minute parts:
  ```bash
  ffmpeg -i lecture.m4a -ar 16000 -ac 1 -c:a pcm_s16le -f segment -segment_time 2400 part_%03d.wav
  ```
  (Raising `MAX_FILE_SIZE_MB` changes the frozen contract; agree it with the team first.)

### Errors
All errors are JSON: `{"error": "<CODE>", "detail": "<human-readable message>"}`

| Status | error | When |
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
- Memory: audio is processed in blocks (`NR_BLOCK_SECONDS`, default 30 s, with
  `NR_PAD_SECONDS` of context), so RAM use depends on the block size and not on the file
  length. Lower `NR_BLOCK_SECONDS` and set `MAX_CONCURRENT_JOBS=1` on small hosts (e.g. 512 MB).
  Measure it with `python -m scripts.memory_check --minutes 90`.
- Long files are denoised block by block, so the result can differ very slightly from
  processing the whole file at once (listen near the 30 s boundaries when testing).
- Size limit: the 100 MB check uses the `Content-Length` header and the bytes received,
  but the multipart body is already received when it runs. Also set a body limit at the
  reverse proxy (e.g. nginx `client_max_body_size 100m;`).
- Output keeps the input's sample rate, channel count and bit depth (PCM/float).
