import logging

from fastapi import FastAPI

from app.api.routes import router
from app.core.errors import register_exception_handlers

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Audio Noise-Reduction Service", version="1.0.0")
register_exception_handlers(app)
app.include_router(router)
