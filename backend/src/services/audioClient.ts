import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { env } from '../config/env';

export class AudioClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.AUDIO_SERVICE_URL;
  }

  /**
   * Health check to inspect if Python microservice is alive
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await axios.get(`${this.baseUrl}/health`, { timeout: 3000 });
      return res.status === 200 && res.data?.status === 'ok';
    } catch {
      return false;
    }
  }

  /**
   * Cleans classroom noise via Python FastAPI microservice using spectral gating (noisereduce).
   * Contract: POST /clean accepts multipart form-data with 'file', returns raw binary WAV.
   * If service is offline or fails, falls back gracefully to stubbing (returning original WAV).
   */
  async cleanAudio(inputWavPath: string, jobId: string): Promise<string> {
    const isAlive = await this.checkHealth();
    if (!isAlive) {
      console.warn(`[AudioClient] Python noise-reduction microservice at ${this.baseUrl} is offline. Stubbing noise reduction stage per specification.`);
      return inputWavPath;
    }

    const cleanedOutputPath = path.join(env.CLEANED_DIR, `cleaned-${jobId}-${path.basename(inputWavPath)}`);

    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(inputWavPath), {
        filename: path.basename(inputWavPath),
        contentType: 'audio/wav',
      });

      const response = await axios.post(`${this.baseUrl}/clean`, form, {
        headers: {
          ...form.getHeaders(),
        },
        responseType: 'stream',
        timeout: 120000, // 2 minutes max
        maxContentLength: env.MAX_FILE_SIZE_BYTES,
        maxBodyLength: env.MAX_FILE_SIZE_BYTES,
      });

      const writer = fs.createWriteStream(cleanedOutputPath);
      response.data.pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', (err) => reject(err));
      });

      console.log(`[AudioClient] Cleaned audio successfully saved to: ${cleanedOutputPath}`);
      return cleanedOutputPath;
    } catch (err: any) {
      console.warn(`[AudioClient] Noise reduction failed (${err?.message || err}). Stubbing with input audio.`);
      return inputWavPath;
    }
  }
}

export const audioClient = new AudioClient();

