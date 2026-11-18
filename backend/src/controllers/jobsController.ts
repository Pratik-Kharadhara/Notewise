import { Request, Response } from 'express';
import { db } from '../db';
import { jobOrchestrator } from '../services/jobOrchestrator';
import { OutputType } from '../types';

export const jobsController = {
  /**
   * Retrieves pipeline processing status for a job
   */
  async getStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const job = await db.getJob(id);

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      // Return unified response compatible with both docs/api-contracts.md and frontend usePollJob
      return res.json({
        id: job.id,
        jobId: job.id,
        recording_id: job.recording_id,
        recordingId: job.recording_id,
        status: job.status,
        stage: job.stage || (job.status === 'done' ? 'done' : 'processing'),
        progress: job.progress || (job.status === 'done' ? 100 : 40),
        error_message: job.error_message || null,
        error: job.error_message || undefined,
        completed_artifacts: job.completed_artifacts || [],
        created_at: job.created_at,
        updated_at: job.updated_at,
      });
    } catch (err: any) {
      console.error('[JobsController] getStatus error:', err);
      return res.status(500).json({ error: 'Failed to retrieve job status', message: err.message });
    }
  },

  /**
   * Retrieves full transcript with timestamped segments
   */
  async getTranscript(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transcript = await db.getTranscript(id);

      if (!transcript) {
        return res.status(404).json({ error: 'Transcript not found for this job' });
      }

      return res.json({
        id: transcript.id || `trans-${id}`,
        job_id: transcript.job_id,
        full_text: transcript.full_text,
        segments: transcript.segments,
        word_count: transcript.word_count,
        created_at: transcript.created_at,
      });
    } catch (err: any) {
      console.error('[JobsController] getTranscript error:', err);
      return res.status(500).json({ error: 'Failed to retrieve transcript', message: err.message });
    }
  },

  /**
   * Retrieves a generated study artifact (notes, cheatsheet, mindmap, or qa)
   */
  async getOutput(req: Request, res: Response) {
    try {
      const { id, type } = req.params;
      const validTypes: OutputType[] = ['notes', 'cheatsheet', 'mindmap', 'qa'];

      if (!validTypes.includes(type as OutputType)) {
        return res.status(400).json({ error: `Invalid output type: ${type}. Expected: ${validTypes.join(', ')}` });
      }

      const output = await db.getOutput(id, type as OutputType);
      if (!output) {
        return res.status(404).json({ error: `Output of type '${type}' not found for this job` });
      }

      return res.json({
        id: output.id,
        job_id: output.job_id,
        type: output.type,
        content: output.content,
        created_at: output.created_at,
      });
    } catch (err: any) {
      console.error('[JobsController] getOutput error:', err);
      return res.status(500).json({ error: 'Failed to retrieve output', message: err.message });
    }
  },

  /**
   * Re-runs only missing or failed outputs without re-running noise reduction or Whisper
   */
  async retry(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await jobOrchestrator.retryJob(id);
      return res.json(result);
    } catch (err: any) {
      console.error('[JobsController] retry error:', err);
      return res.status(500).json({ error: 'Failed to retry job', message: err.message });
    }
  },
};

