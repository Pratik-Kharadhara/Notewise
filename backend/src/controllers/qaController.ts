import { Request, Response } from 'express';
import { db } from '../db';
import { llmService } from '../services/llmService';

export const qaController = {
  /**
   * Handles Grounded Q&A via Job ID (Contract: POST /api/jobs/:id/qa)
   */
  async askByJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { question } = req.body;

      if (!question || typeof question !== 'string' || !question.trim()) {
        return res.status(400).json({ error: 'Question is required' });
      }

      const transcript = await db.getTranscript(id);
      if (!transcript || !transcript.full_text) {
        return res.status(404).json({ error: 'Transcript not available for this job yet' });
      }

      const result = await llmService.answerLectureQuestion(transcript.full_text, question.trim());
      return res.json({
        question: question.trim(),
        answer: result.answer,
        grounded: result.grounded,
      });
    } catch (err: any) {
      console.error('[QAController] askByJob error:', err);
      return res.status(500).json({ error: 'Failed to process question', message: err.message });
    }
  },

  /**
   * Handles Grounded Q&A via Recording ID (Frontend: POST /api/recordings/:id/ask)
   */
  async askByRecording(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { question } = req.body;

      if (!question || typeof question !== 'string' || !question.trim()) {
        return res.status(400).json({ error: 'Question is required' });
      }

      const recording = await db.getRecording(id);
      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }

      const job = await db.getJobByRecordingId(recording.id);
      if (!job) {
        return res.status(404).json({ error: 'No processing job associated with this recording' });
      }

      const transcript = await db.getTranscript(job.id);
      if (!transcript || !transcript.full_text) {
        return res.status(404).json({ error: 'Transcript is not ready for Q&A yet' });
      }

      const result = await llmService.answerLectureQuestion(transcript.full_text, question.trim());
      return res.json({
        question: question.trim(),
        answer: result.answer,
        grounded: result.grounded,
      });
    } catch (err: any) {
      console.error('[QAController] askByRecording error:', err);
      return res.status(500).json({ error: 'Failed to process question', message: err.message });
    }
  },
};

