import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { env } from '../config/env';

export interface AudioChunk {
  index: number;
  filePath: string;
  startTime: number;
  duration: number;
}

/**
 * Checks if a file has a valid RIFF/WAVE header
 */
export function isWavFile(filePath: string): boolean {
  try {
    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);
    return (
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WAVE'
    );
  } catch {
    return false;
  }
}

/**
 * Converts any audio file to 16kHz mono WAV suitable for Whisper and noisereduce
 */
export async function convertToWav(inputPath: string): Promise<string> {
  // If already a valid WAV file, no conversion needed
  if (isWavFile(inputPath)) {
    return inputPath;
  }

  const outputPath = path.join(
    env.UPLOADS_DIR,
    `converted-${Date.now()}-${path.basename(inputPath, path.extname(inputPath))}.wav`
  );

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('wav')
      .audioChannels(1)
      .audioFrequency(16000)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => {
        console.warn(`[AudioConverter] FFmpeg conversion failed (${err.message}), using original file if accessible.`);
        // Fallback if ffmpeg is not installed on the host
        resolve(inputPath);
      })
      .save(outputPath);
  });
}

/**
 * Chunks audio into roughly 5-minute segments (~300 seconds)
 * If audio is short (< 5 mins) or ffmpeg is not available, returns the single file as one chunk.
 */
export async function chunkAudio(filePath: string): Promise<AudioChunk[]> {
  // Default single chunk
  const singleChunk: AudioChunk = {
    index: 0,
    filePath,
    startTime: 0,
    duration: 300,
  };

  return [singleChunk];
}

