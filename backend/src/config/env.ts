import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env if present
dotenv.config();

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(ROOT_DIR, 'uploads');
const CLEANED_DIR = path.join(UPLOADS_DIR, 'cleaned');

// Ensure upload directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(CLEANED_DIR)) {
  fs.mkdirSync(CLEANED_DIR, { recursive: true });
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || '',
  AUDIO_SERVICE_URL: (process.env.AUDIO_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, ''),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  WHISPER_PATH: process.env.WHISPER_PATH || 'whisper',
  WHISPER_MODEL_PATH: process.env.WHISPER_MODEL_PATH || 'models/ggml-base.bin',
  UPLOADS_DIR,
  CLEANED_DIR,
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024, // 100 MB per contract
};

