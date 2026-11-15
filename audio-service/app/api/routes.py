import asyncio
import logging
import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, Request, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.core.config import settings
from app.core.errors import (
    CorruptedAudioError,
    FileTooLargeError,
    InvalidFileTypeError,
)
from app.services.noise_reduction import reduce_noise_wav

logger = logging.getLogger("audio-service")
router = APIRouter()

CHUNK_SIZE = 1024 * 1024
_job_slots = asyncio.Semaphore(settings.max_concurrent_jobs)


def _too_large() -> FileTooLargeError:
    return FileTooLargeError(f"File exceeds the {settings.max_file_size_mb:g} MB limit")


async def _save_upload(file: UploadFile, dest: Path) -> None:
    size = 0
    with dest.open("wb") as out:
        while chunk := await file.read(CHUNK_SIZE):
            size += len(chunk)
            if size > settings.max_file_size_bytes:
                raise _too_large()
            out.write(chunk)


def _looks_like_wav(path: Path) -> bool:
    with path.open("rb") as f:
        header = f.read(12)
    return len(header) == 12 and header[:4] == b"RIFF" and header[8:12] == b"WAVE"


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/clean")
async def clean(request: Request, file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".wav"):
        raise InvalidFileTypeError("Only WAV files are supported")

    declared = request.headers.get("content-length")
    if declared and declared.isdigit():
        # small slack for multipart overhead
        if int(declared) > settings.max_file_size_bytes + CHUNK_SIZE:
            raise _too_large()

    workdir = Path(tempfile.mkdtemp(prefix="audio-clean-"))
    try:
        input_path = workdir / "input.wav"
        output_path = workdir / "cleaned.wav"

        await _save_upload(file, input_path)

        if not _looks_like_wav(input_path):
            raise CorruptedAudioError("File is not a valid WAV file")

        async with _job_slots:
            # CPU-heavy: run in a worker thread so the event loop stays free
            await run_in_threadpool(reduce_noise_wav, input_path, output_path)
    except BaseException:
        shutil.rmtree(workdir, ignore_errors=True)
        raise
    finally:
        await file.close()

    # Streams the file in chunks; temp dir is removed after the response is sent.
    return FileResponse(
        output_path,
        media_type="audio/wav",
        filename="cleaned.wav",
        background=BackgroundTask(shutil.rmtree, workdir, ignore_errors=True),
    )
