"""Spectral-gating noise reduction (noisereduce) for WAV files.

Long files are processed block by block (read -> denoise -> write), so memory
use depends on the block size, not on the length of the recording.
"""
import logging
from pathlib import Path

import noisereduce as nr
import numpy as np
import soundfile as sf

from app.core.config import settings
from app.core.errors import AudioServiceError, CorruptedAudioError, ProcessingError
from app.services.blocks import iter_blocks

logger = logging.getLogger("audio-service")

_KEEP_SUBTYPES = {"PCM_U8", "PCM_16", "PCM_24", "PCM_32", "FLOAT", "DOUBLE"}


def spectral_gate(data: np.ndarray, sr: int) -> np.ndarray:
    """data: (samples, channels) float32 in, same shape out. Length is preserved."""
    y = data.T                      # (channels, samples)
    if y.shape[0] == 1:
        y = y[0]                    # mono -> 1-D
    out = nr.reduce_noise(
        y=y,
        sr=sr,
        stationary=settings.nr_stationary,
        prop_decrease=settings.nr_prop_decrease,
        chunk_size=settings.nr_chunk_size,
        n_jobs=1,
    )
    out = np.asarray(out, dtype=np.float32)
    if out.ndim == 1:
        out = out[None, :]
    return np.clip(out.T, -1.0, 1.0)


def reduce_noise_wav(input_path: Path, output_path: Path) -> None:
    """Denoise input WAV and write output WAV (same rate, channels, length)."""
    try:
        info = sf.info(str(input_path))
        if info.format != "WAV":
            raise CorruptedAudioError("File is not a valid WAV file")
        if info.frames < settings.min_samples:
            raise CorruptedAudioError("Audio is empty or too short to process")
    except AudioServiceError:
        raise
    except RuntimeError as exc:  # soundfile.LibsndfileError
        raise CorruptedAudioError("Corrupted or unreadable WAV file") from exc

    sr = info.samplerate
    subtype = info.subtype if info.subtype in _KEEP_SUBTYPES else "PCM_16"
    block = max(1, int(settings.nr_block_seconds * sr))
    pad = max(0, int(settings.nr_pad_seconds * sr))

    try:
        with sf.SoundFile(str(input_path)) as fin, sf.SoundFile(
            str(output_path),
            mode="w",
            samplerate=sr,
            channels=info.channels,
            format="WAV",
            subtype=subtype,
        ) as fout:
            for lo, start, end, hi in iter_blocks(info.frames, block, pad):
                try:
                    fin.seek(lo)
                    data = fin.read(hi - lo, dtype="float32", always_2d=True)
                except RuntimeError as exc:
                    raise CorruptedAudioError("Corrupted or unreadable WAV file") from exc
                if data.shape[0] != hi - lo:
                    raise CorruptedAudioError("WAV file ended unexpectedly (truncated)")

                cleaned = spectral_gate(data, sr)
                fout.write(cleaned[start - lo : end - lo])
    except AudioServiceError:
        raise
    except Exception as exc:
        logger.exception("Noise reduction failed")
        raise ProcessingError("Audio processing failed") from exc
