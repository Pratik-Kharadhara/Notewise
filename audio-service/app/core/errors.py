"""Structured errors: every failure returns {"error": "<CODE>", "detail": "<message>"}."""
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("audio-service")


class AudioServiceError(Exception):
    status_code = 500
    code = "INTERNAL_ERROR"

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class InvalidFileTypeError(AudioServiceError):
    status_code = 400
    code = "INVALID_FILE_TYPE"


class CorruptedAudioError(AudioServiceError):
    status_code = 400
    code = "CORRUPTED_AUDIO"


class FileTooLargeError(AudioServiceError):
    status_code = 413
    code = "FILE_TOO_LARGE"


class ProcessingError(AudioServiceError):
    status_code = 500
    code = "PROCESSING_FAILED"


def _body(code: str, message: str) -> dict:
    return {"error": code, "detail": message}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AudioServiceError)
    async def _service_error(_: Request, exc: AudioServiceError):
        return JSONResponse(_body(exc.code, exc.message), status_code=exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def _validation_error(_: Request, exc: RequestValidationError):
        return JSONResponse(
            _body("INVALID_REQUEST", "Multipart field 'file' is required"),
            status_code=422,
        )

    @app.exception_handler(Exception)
    async def _unexpected(_: Request, exc: Exception):
        logger.exception("Unhandled error")
        return JSONResponse(
            _body("INTERNAL_ERROR", "Unexpected server error"), status_code=500
        )
