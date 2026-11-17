import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import {
  RecordingData,
  JobData,
  TranscriptData,
  OutputData,
  OutputType,
  Folder,
} from '../types';

let pgPool: Pool | null = null;
let usePostgres = false;

// Fallback in-memory stores for decoupled offline development and testing
const memoryRecordings = new Map<string, RecordingData>();
const memoryJobs = new Map<string, JobData>();
const memoryTranscripts = new Map<string, TranscriptData>();
const memoryOutputs = new Map<string, Map<OutputType, OutputData>>();
const memoryFolders = new Map<string, Folder>();

// Initialize default folders
const defaultFolders: Folder[] = [
  {
    id: 'cs101',
    name: 'CS101: Systems',
    description: 'Data structures, algorithms, operating systems, and memory architecture.',
    color: 'blue',
    icon: 'code',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'psychology',
    name: 'Psychology',
    description: 'Cognitive development, memory formation, and social behavior studies.',
    color: 'rose',
    icon: 'brain',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'history',
    name: 'World History',
    description: 'Industrialization, modern European geopolitics, and primary source seminars.',
    color: 'amber',
    icon: 'landmark',
    updatedAt: new Date().toISOString(),
  },
];
defaultFolders.forEach((f) => memoryFolders.set(f.id, f));

// Load seed data if available
function loadSeeds() {
  const seedPath = path.resolve(__dirname, '..', '..', '..', 'database', 'seeds', 'seed_data.json');
  if (fs.existsSync(seedPath)) {
    try {
      const raw = fs.readFileSync(seedPath, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.recordings)) {
        for (const rec of data.recordings) {
          const recObj: RecordingData = {
            id: rec.id,
            session_id: rec.session_id || 'seed-session',
            original_filename: rec.original_filename || 'lecture.wav',
            raw_audio_path: rec.raw_audio_path || '',
            cleaned_audio_path: rec.cleaned_audio_path || null,
            created_at: rec.created_at || new Date().toISOString(),
            title: rec.title || rec.original_filename?.replace(/\.[^/.]+$/, ''),
            folder_id: rec.folder_id || 'cs101',
            duration_seconds: rec.duration_seconds || 1800,
            source: 'uploaded',
            subject_label: 'Computer Science',
            lecturer: rec.lecturer || 'Prof. Lecturer',
          };
          memoryRecordings.set(recObj.id, recObj);

          if (rec.job) {
            const jobObj: JobData = {
              id: rec.job.id,
              recording_id: rec.id,
              status: rec.job.status,
              error_message: rec.job.error_message || null,
              stage: rec.job.status === 'done' ? 'done' : 'uploaded',
              progress: rec.job.status === 'done' ? 100 : 50,
              completed_artifacts: rec.job.status === 'done' ? ['notes', 'cheatsheet', 'mindmap'] : [],
              created_at: rec.job.created_at || new Date().toISOString(),
              updated_at: rec.job.updated_at || new Date().toISOString(),
            };
            memoryJobs.set(jobObj.id, jobObj);
          }

          if (rec.transcript && rec.job) {
            memoryTranscripts.set(rec.job.id, {
              id: `trans-${rec.job.id}`,
              job_id: rec.job.id,
              full_text: rec.transcript.full_text || '',
              segments: rec.transcript.segments || [],
              word_count: rec.transcript.word_count || 0,
              created_at: new Date().toISOString(),
            });
          }

          if (rec.outputs && rec.job) {
            const jobOuts = new Map<OutputType, OutputData>();
            for (const [key, content] of Object.entries(rec.outputs)) {
              const outType = key as OutputType;
              jobOuts.set(outType, {
                id: `out-${rec.job.id}-${outType}`,
                job_id: rec.job.id,
                type: outType,
                content,
                created_at: new Date().toISOString(),
              });
            }
            memoryOutputs.set(rec.job.id, jobOuts);
          }
        }
        console.log(`[Database] Loaded ${memoryRecordings.size} seed scenarios from seed_data.json.`);
      }
    } catch (err) {
      console.warn('[Database] Could not parse seed_data.json:', err);
    }
  }
}

export async function initDatabase(): Promise<void> {
  loadSeeds();

  if (!env.DATABASE_URL) {
    console.log('[Database] DATABASE_URL not set. Running in resilient in-memory mode.');
    return;
  }

  try {
    pgPool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
    });

    const client = await pgPool.connect();
    console.log('[Database] Connected successfully to PostgreSQL.');
    usePostgres = true;
    client.release();
  } catch (err) {
    console.warn('[Database] Unable to connect to PostgreSQL. Falling back to in-memory store:', (err as Error).message);
    usePostgres = false;
  }
}

export const db = {
  // Recordings
  async createRecording(data: Omit<RecordingData, 'created_at'>): Promise<RecordingData> {
    const created_at = new Date().toISOString();
    const fullData: RecordingData = { ...data, created_at };

    if (usePostgres && pgPool) {
      try {
        const query = `
          INSERT INTO recordings (id, session_id, original_filename, raw_audio_path, cleaned_audio_path, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *;
        `;
        const res = await pgPool.query(query, [
          fullData.id,
          fullData.session_id,
          fullData.original_filename,
          fullData.raw_audio_path,
          fullData.cleaned_audio_path || null,
          created_at,
        ]);
        const row = res.rows[0];
        // Combine DB row with in-memory metadata
        memoryRecordings.set(fullData.id, fullData);
        return { ...fullData, ...row };
      } catch (e) {
        console.error('[Database] Postgres createRecording error, saving to memory fallback:', e);
      }
    }

    memoryRecordings.set(fullData.id, fullData);
    return fullData;
  },

  async getRecording(id: string): Promise<RecordingData | null> {
    if (usePostgres && pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM recordings WHERE id = $1', [id]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          const cached = memoryRecordings.get(id);
          return { ...cached, ...row };
        }
      } catch (e) {
        console.error('[Database] Postgres getRecording error:', e);
      }
    }
    return memoryRecordings.get(id) || null;
  },

  async updateRecording(id: string, updates: Partial<RecordingData>): Promise<RecordingData | null> {
    const existing = await this.getRecording(id);
    if (!existing) return null;

    const merged = { ...existing, ...updates };
    memoryRecordings.set(id, merged);

    if (usePostgres && pgPool && updates.cleaned_audio_path !== undefined) {
      try {
        await pgPool.query(
          'UPDATE recordings SET cleaned_audio_path = $1 WHERE id = $2',
          [updates.cleaned_audio_path, id]
        );
      } catch (e) {
        console.error('[Database] Postgres updateRecording error:', e);
      }
    }

    return merged;
  },

  async listRecordings(sessionId?: string): Promise<RecordingData[]> {
    if (usePostgres && pgPool) {
      try {
        const query = sessionId
          ? 'SELECT * FROM recordings WHERE session_id = $1 ORDER BY created_at DESC'
          : 'SELECT * FROM recordings ORDER BY created_at DESC';
        const params = sessionId ? [sessionId] : [];
        const res = await pgPool.query(query, params);
        return res.rows.map((row) => ({ ...(memoryRecordings.get(row.id) || {}), ...row }));
      } catch (e) {
        console.error('[Database] Postgres listRecordings error:', e);
      }
    }
    const all = Array.from(memoryRecordings.values());
    if (sessionId) {
      return all.filter((r) => r.session_id === sessionId);
    }
    return all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async deleteRecording(id: string): Promise<boolean> {
    memoryRecordings.delete(id);
    if (usePostgres && pgPool) {
      try {
        await pgPool.query('DELETE FROM recordings WHERE id = $1', [id]);
        return true;
      } catch (e) {
        console.error('[Database] Postgres deleteRecording error:', e);
      }
    }
    return true;
  },

  // Jobs
  async createJob(data: { id: string; recording_id: string; status: JobData['status'] }): Promise<JobData> {
    const now = new Date().toISOString();
    const job: JobData = {
      id: data.id,
      recording_id: data.recording_id,
      status: data.status,
      stage: 'uploaded',
      progress: 10,
      error_message: null,
      completed_artifacts: [],
      created_at: now,
      updated_at: now,
    };

    if (usePostgres && pgPool) {
      try {
        await pgPool.query(
          `INSERT INTO jobs (id, recording_id, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5);`,
          [job.id, job.recording_id, job.status, now, now]
        );
      } catch (e) {
        console.error('[Database] Postgres createJob error:', e);
      }
    }

    memoryJobs.set(job.id, job);
    return job;
  },

  async getJob(id: string): Promise<JobData | null> {
    if (usePostgres && pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM jobs WHERE id = $1', [id]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          const cached = memoryJobs.get(id);
          // fetch completed artifacts
          const outRes = await pgPool.query('SELECT type FROM outputs WHERE job_id = $1', [id]);
          const artifacts = outRes.rows.map((r) => r.type as OutputType);
          return {
            ...cached,
            ...row,
            completed_artifacts: artifacts,
          };
        }
      } catch (e) {
        console.error('[Database] Postgres getJob error:', e);
      }
    }
    return memoryJobs.get(id) || null;
  },

  async getJobByRecordingId(recordingId: string): Promise<JobData | null> {
    for (const job of memoryJobs.values()) {
      if (job.recording_id === recordingId) return job;
    }
    if (usePostgres && pgPool) {
      try {
        const res = await pgPool.query(
          'SELECT * FROM jobs WHERE recording_id = $1 ORDER BY created_at DESC LIMIT 1',
          [recordingId]
        );
        if (res.rows.length > 0) {
          return res.rows[0];
        }
      } catch (e) {
        console.error('[Database] Postgres getJobByRecordingId error:', e);
      }
    }
    return null;
  },

  async updateJob(id: string, updates: Partial<JobData>): Promise<JobData | null> {
    const existing = await this.getJob(id);
    if (!existing) return null;

    const merged = { ...existing, ...updates, updated_at: new Date().toISOString() };
    memoryJobs.set(id, merged);

    if (usePostgres && pgPool) {
      try {
        await pgPool.query(
          `UPDATE jobs 
           SET status = COALESCE($1, status),
               error_message = $2,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [updates.status || null, updates.error_message || null, id]
        );
      } catch (e) {
        console.error('[Database] Postgres updateJob error:', e);
      }
    }

    return merged;
  },

  // Transcripts
  async saveTranscript(transcript: TranscriptData): Promise<TranscriptData> {
    memoryTranscripts.set(transcript.job_id, transcript);

    if (usePostgres && pgPool) {
      try {
        await pgPool.query(
          `INSERT INTO transcripts (id, job_id, full_text, segments, word_count, created_at)
           VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
           ON CONFLICT (job_id) DO UPDATE 
           SET full_text = EXCLUDED.full_text,
               segments = EXCLUDED.segments,
               word_count = EXCLUDED.word_count;`,
          [
            transcript.id || transcript.job_id,
            transcript.job_id,
            transcript.full_text,
            JSON.stringify(transcript.segments),
            transcript.word_count,
          ]
        );
      } catch (e) {
        console.error('[Database] Postgres saveTranscript error:', e);
      }
    }

    return transcript;
  },

  async getTranscript(jobId: string): Promise<TranscriptData | null> {
    if (usePostgres && pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM transcripts WHERE job_id = $1', [jobId]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            job_id: row.job_id,
            full_text: row.full_text,
            segments: typeof row.segments === 'string' ? JSON.parse(row.segments) : row.segments,
            word_count: row.word_count,
            created_at: row.created_at,
          };
        }
      } catch (e) {
        console.error('[Database] Postgres getTranscript error:', e);
      }
    }
    return memoryTranscripts.get(jobId) || null;
  },

  // Outputs
  async saveOutput(output: OutputData): Promise<OutputData> {
    let jobOuts = memoryOutputs.get(output.job_id);
    if (!jobOuts) {
      jobOuts = new Map<OutputType, OutputData>();
      memoryOutputs.set(output.job_id, jobOuts);
    }
    jobOuts.set(output.type, output);

    // Update job's completed_artifacts
    const job = memoryJobs.get(output.job_id);
    if (job) {
      const artifacts = Array.from(jobOuts.keys());
      job.completed_artifacts = artifacts;
    }

    if (usePostgres && pgPool) {
      try {
        await pgPool.query(
          `INSERT INTO outputs (id, job_id, type, content, created_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
           ON CONFLICT (job_id, type) DO UPDATE
           SET content = EXCLUDED.content,
               created_at = CURRENT_TIMESTAMP;`,
          [
            output.id || `${output.job_id}-${output.type}`,
            output.job_id,
            output.type,
            JSON.stringify(output.content),
          ]
        );
      } catch (e) {
        console.error('[Database] Postgres saveOutput error:', e);
      }
    }

    return output;
  },

  async getOutput(jobId: string, type: OutputType): Promise<OutputData | null> {
    if (usePostgres && pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM outputs WHERE job_id = $1 AND type = $2', [jobId, type]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            job_id: row.job_id,
            type: row.type,
            content: typeof row.content === 'string' ? JSON.parse(row.content) : row.content,
            created_at: row.created_at,
          };
        }
      } catch (e) {
        console.error('[Database] Postgres getOutput error:', e);
      }
    }
    const jobOuts = memoryOutputs.get(jobId);
    return jobOuts?.get(type) || null;
  },

  async getAllOutputs(jobId: string): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    if (usePostgres && pgPool) {
      try {
        const res = await pgPool.query('SELECT type, content FROM outputs WHERE job_id = $1', [jobId]);
        for (const row of res.rows) {
          result[row.type] = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
        }
        if (Object.keys(result).length > 0) return result;
      } catch (e) {
        console.error('[Database] Postgres getAllOutputs error:', e);
      }
    }

    const jobOuts = memoryOutputs.get(jobId);
    if (jobOuts) {
      for (const [type, data] of jobOuts.entries()) {
        result[type] = data.content;
      }
    }
    return result;
  },

  // Folders (supporting Frontend UI)
  async listFolders(): Promise<Folder[]> {
    return Array.from(memoryFolders.values());
  },

  async getFolder(id: string): Promise<Folder | null> {
    return memoryFolders.get(id) || null;
  },

  async createFolder(folder: Omit<Folder, 'updatedAt'>): Promise<Folder> {
    const full: Folder = { ...folder, updatedAt: new Date().toISOString() };
    memoryFolders.set(full.id, full);
    return full;
  },

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | null> {
    const existing = memoryFolders.get(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    memoryFolders.set(id, merged);
    return merged;
  },

  async deleteFolder(id: string): Promise<boolean> {
    return memoryFolders.delete(id);
  },
};
