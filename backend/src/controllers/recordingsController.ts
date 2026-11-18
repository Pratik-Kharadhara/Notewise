import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { db } from '../db';
import { jobOrchestrator } from '../services/jobOrchestrator';

export const recordingsController = {
  /**
   * Uploads audio and queues pipeline processing.
   * Supports:
   * - Official contract: POST /api/recordings/upload (multipart field 'file')
   * - Frontend contract: POST /api/recordings (multipart field 'audio')
   */
  async upload(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'Audio file is required (multipart field "file" or "audio")' });
      }

      const sessionId =
        (req.headers['x-session-id'] as string) ||
        req.body.sessionId ||
        req.body.session_id ||
        `session-${uuidv4().slice(0, 8)}`;

      const recordingId = uuidv4();
      const jobId = uuidv4();

      const rawTitle = req.body.title || path.basename(file.originalname, path.extname(file.originalname));
      const cleanedTitle = rawTitle.replace(/[_-]+/g, ' ').trim();
      const folderId = req.body.folderId || req.body.folder_id || 'cs101';
      const durationSeconds = parseInt(req.body.durationSeconds || req.body.duration_seconds || '1800', 10);
      const source = req.body.source === 'recorded' ? 'recorded' : 'uploaded';

      // 1. Create recording row
      const recording = await db.createRecording({
        id: recordingId,
        session_id: sessionId,
        original_filename: file.originalname,
        raw_audio_path: file.path,
        cleaned_audio_path: null,
        title: cleanedTitle,
        folder_id: folderId,
        duration_seconds: durationSeconds,
        source,
        subject_label: 'Computer Science',
        lecturer: 'Prof. Lecturer',
      });

      // 2. Create job row with queued status
      const job = await db.createJob({
        id: jobId,
        recording_id: recordingId,
        status: 'queued',
      });

      // 3. Trigger asynchronous background orchestration
      jobOrchestrator.processJob(jobId);

      // 4. Return dual-compatible payload (for both official E2E contracts & frontend)
      return res.status(201).json({
        recording_id: recording.id,
        recordingId: recording.id,
        job_id: job.id,
        jobId: job.id,
        status: job.status,
        filename: recording.original_filename,
        title: recording.title,
      });
    } catch (err: any) {
      console.error('[RecordingsController] Upload error:', err);
      return res.status(500).json({ error: 'Failed to upload and queue audio', message: err.message });
    }
  },

  /**
   * Lists all recordings for the session (or all for local dev)
   */
  async list(req: Request, res: Response) {
    try {
      const sessionId = req.headers['x-session-id'] as string | undefined;
      const recordings = await db.listRecordings(sessionId);

      // Hydrate with job status and outputs
      const hydrated = await Promise.all(
        recordings.map(async (r) => {
          const job = await db.getJobByRecordingId(r.id);
          const transcript = job ? await db.getTranscript(job.id) : null;
          const outputs = job ? await db.getAllOutputs(job.id) : {};

          return {
            id: r.id,
            jobId: job?.id || '',
            title: r.title || r.original_filename.replace(/\.[^/.]+$/, ''),
            folderId: r.folder_id || 'cs101',
            subjectLabel: r.subject_label || 'Computer Science',
            lecturer: r.lecturer || 'Prof. Lecturer',
            source: r.source || 'uploaded',
            status: job?.status || 'queued',
            progress: job?.progress || (job?.status === 'done' ? 100 : 30),
            stage: job?.stage || (job?.status === 'done' ? 'done' : 'uploaded'),
            durationSeconds: r.duration_seconds || 1800,
            createdAt: r.created_at,
            updatedAt: job?.updated_at || r.created_at,
            error: job?.error_message || undefined,
            transcript: transcript?.segments || [],
            notes: outputs.notes || null,
            cheatsheet: outputs.cheatsheet || null,
            mindmap: outputs.mindmap || null,
          };
        })
      );

      return res.json(hydrated);
    } catch (err: any) {
      console.error('[RecordingsController] List error:', err);
      return res.status(500).json({ error: 'Failed to fetch recordings', message: err.message });
    }
  },

  /**
   * Retrieves single recording detail hydrated with all artifacts
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const recording = await db.getRecording(id);

      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }

      const job = await db.getJobByRecordingId(recording.id);
      const transcript = job ? await db.getTranscript(job.id) : null;
      const outputs = job ? await db.getAllOutputs(job.id) : {};

      const responsePayload = {
        id: recording.id,
        jobId: job?.id || '',
        title: recording.title || recording.original_filename.replace(/\.[^/.]+$/, ''),
        folderId: recording.folder_id || 'cs101',
        subjectLabel: recording.subject_label || 'Computer Science',
        lecturer: recording.lecturer || 'Prof. Lecturer',
        source: recording.source || 'uploaded',
        status: job?.status || 'queued',
        progress: job?.progress || (job?.status === 'done' ? 100 : 30),
        stage: job?.stage || (job?.status === 'done' ? 'done' : 'uploaded'),
        durationSeconds: recording.duration_seconds || 1800,
        createdAt: recording.created_at,
        updatedAt: job?.updated_at || recording.created_at,
        error: job?.error_message || undefined,
        transcript: transcript?.segments || [],
        notes: outputs.notes || null,
        cheatsheet: outputs.cheatsheet || null,
        mindmap: outputs.mindmap || null,
        suggestedQuestions: [
          `What are the core exam takeaways from ${recording.title}?`,
          'Can you explain the main definitions mentioned in this lecture?',
          'What are the key trade-offs highlighted by the professor?',
        ],
      };

      return res.json(responsePayload);
    } catch (err: any) {
      console.error('[RecordingsController] GetById error:', err);
      return res.status(500).json({ error: 'Failed to retrieve recording', message: err.message });
    }
  },

  /**
   * Updates recording metadata (title, folder)
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = await db.updateRecording(id, {
        title: updates.title,
        folder_id: updates.folderId || updates.folder_id,
      });

      if (!updated) {
        return res.status(404).json({ error: 'Recording not found' });
      }

      return res.json(updated);
    } catch (err: any) {
      console.error('[RecordingsController] Update error:', err);
      return res.status(500).json({ error: 'Failed to update recording', message: err.message });
    }
  },

  /**
   * Deletes recording
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await db.deleteRecording(id);
      return res.status(204).send();
    } catch (err: any) {
      console.error('[RecordingsController] Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete recording', message: err.message });
    }
  },
};

