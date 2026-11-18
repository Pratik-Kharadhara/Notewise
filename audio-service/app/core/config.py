"""Service configuration and constraints (override via environment / .env)."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Frozen contract: uploads up to 100 MB.
    max_file_size_mb: float = 100
    # Heavy jobs allowed at once (each needs several times the file size in RAM).
    max_concurrent_jobs: int = 2
    # Reject audio shorter than this many samples.
    min_samples: int = 2048

    # Spectral-gating parameters (noisereduce)
    nr_stationary: bool = False      # True = steady noise (fans); False = adaptive
    nr_prop_decrease: float = 0.6    # 0..1, how much noise to remove
    nr_chunk_size: int = 600_000     # samples per internal noisereduce chunk
    # Long files are processed in blocks of this many seconds (bounds RAM use),
    # each with `nr_pad_seconds` of surrounding audio as context.
    nr_block_seconds: float = 30.0
    nr_pad_seconds: float = 2.0

    @property
    def max_file_size_bytes(self) -> int:
        return int(self.max_file_size_mb * 1024 * 1024)


settings = Settings()
