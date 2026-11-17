import { db } from '../db';
import { audioClient } from './audioClient';
import { convertToWav } from './audioConverter';
import { whisperService } from './whisperService';
import { llmService } from './llmService';
import { JobStatus, OutputType, PipelineStage } from '../types';

export class JobOrchestrator {
  private processingJobs = new Set<string>();

  /**
   * Triggers asynchronous background pipeline execution for a newly queued job.
   */
  async processJob(jobId: string): Promise<void> {
    if (this.processingJobs.has(jobId)) {
      return;
    }
    this.processingJobs.add(jobId);

    // Run pipeline asynchronously so HTTP response returns immediately
    setImmediate(async () => {
      try {
        await this.runPipeline(jobId);
      } catch (err: any) {
        console.error(`[JobOrchestrator] Job ${jobId} failed with critical error:`, err);
        await db.updateJob(jobId, {
          status: 'failed',
          stage: 'failed',
          progress: 0,
          error_message: err.message || 'Pipeline execution failed',
        });
      } finally {
        this.processingJobs.delete(jobId);
      }
    });
  }

  /**
   * Core 7-stage linear pipeline
   */
  private async runPipeline(jobId: string): Promise<void> {
    const job = await db.getJob(jobId);
    if (!job) return;

    const recording = await db.getRecording(job.recording_id);
    if (!recording) throw new Error('Associated recording not found');

    console.log(`[JobOrchestrator] Starting pipeline for job: ${jobId} (${recording.original_filename})`);

    // Stage 1 & 2: Update status to processing
    await db.updateJob(jobId, {
      status: 'processing',
      stage: 'uploaded',
      progress: 20,
    });

    // Stage 3: Noise Reduction Preprocessing
    console.log(`[JobOrchestrator] [Stage 3] Preparing & cleaning audio for job ${jobId}...`);
    await db.updateJob(jobId, { stage: 'noise_reduction', progress: 35 });

    let wavPath = recording.raw_audio_path;
    if (wavPath) {
      try {
        wavPath = await convertToWav(wavPath);
      } catch (e: any) {
        console.warn('[JobOrchestrator] WAV conversion warning:', e.message);
      }
    }

    const cleanedWavPath = await audioClient.cleanAudio(wavPath, jobId);
    await db.updateRecording(recording.id, { cleaned_audio_path: cleanedWavPath });

    // Stage 4: Whisper Transcription
    console.log(`[JobOrchestrator] [Stage 4] Transcribing audio for job ${jobId}...`);
    await db.updateJob(jobId, { stage: 'transcription', progress: 55 });

    let transcript = await db.getTranscript(jobId);
    if (!transcript) {
      const transcriptionResult = await whisperService.transcribe(cleanedWavPath || wavPath);
      transcript = await db.saveTranscript({
        id: `trans-${jobId}`,
        job_id: jobId,
        full_text: transcriptionResult.fullText,
        segments: transcriptionResult.segments,
        word_count: transcriptionResult.wordCount,
        created_at: new Date().toISOString(),
      });
    }

    // Stage 5: Generation (3 Independent LLM Calls)
    console.log(`[JobOrchestrator] [Stage 5] Generating study notes, cheatsheet & mindmap...`);
    await db.updateJob(jobId, { stage: 'generating_notes', progress: 75 });

    await this.generateOutputsForJob(jobId, transcript.full_text, recording.title);
  }

  /**
   * Independent parallel LLM generation with Partial-Success handling
   */
  private async generateOutputsForJob(
    jobId: string,
    fullText: string,
    lectureTitle?: string
  ): Promise<void> {
    const existingOutputs = await db.getAllOutputs(jobId);
    const completedArtifacts: OutputType[] = [];

    // 1. Notes Generation
    if (!existingOutputs.notes) {
      try {
        const notes = await llmService.generateNotes(fullText, lectureTitle);
        await db.saveOutput({
          job_id: jobId,
          type: 'notes',
          content: notes,
        });
        completedArtifacts.push('notes');
      } catch (err: any) {
        console.error(`[JobOrchestrator] Notes generation failed for job ${jobId}:`, err.message);
      }
    } else {
      completedArtifacts.push('notes');
    }

    // 2. Cheatsheet Generation
    if (!existingOutputs.cheatsheet) {
      try {
        const cheatsheet = await llmService.generateCheatsheet(fullText);
        await db.saveOutput({
          job_id: jobId,
          type: 'cheatsheet',
          content: cheatsheet,
        });
        completedArtifacts.push('cheatsheet');
      } catch (err: any) {
        console.error(`[JobOrchestrator] Cheatsheet generation failed for job ${jobId}:`, err.message);
      }
    } else {
      completedArtifacts.push('cheatsheet');
    }

    // 3. Mindmap Generation
    if (!existingOutputs.mindmap) {
      try {
        const mindmap = await llmService.generateMindmap(fullText, lectureTitle);
        await db.saveOutput({
          job_id: jobId,
          type: 'mindmap',
          content: mindmap,
        });
        completedArtifacts.push('mindmap');
      } catch (err: any) {
        console.error(`[JobOrchestrator] Mindmap generation failed for job ${jobId}:`, err.message);
      }
    } else {
      completedArtifacts.push('mindmap');
    }

    // Partial-success state machine rule:
    // If all 3 succeed -> done
    // If 1 or 2 succeed -> partial
    // If 0 succeed -> failed
    let finalStatus: JobStatus = 'failed';
    let finalStage: PipelineStage = 'failed';
    let finalProgress = 0;

    if (completedArtifacts.length === 3) {
      finalStatus = 'done';
      finalStage = 'done';
      finalProgress = 100;
    } else if (completedArtifacts.length > 0) {
      finalStatus = 'partial';
      finalStage = 'done';
      finalProgress = 85;
    }

    await db.updateJob(jobId, {
      status: finalStatus,
      stage: finalStage,
      progress: finalProgress,
      completed_artifacts: completedArtifacts,
      error_message:
        finalStatus === 'partial'
          ? 'Some artifacts could not be generated. Retry to complete remaining artifacts.'
          : finalStatus === 'failed'
            ? 'Failed to generate study artifacts.'
            : null,
    });

    console.log(`[JobOrchestrator] Job ${jobId} finished with status: ${finalStatus} (${completedArtifacts.length}/3 artifacts)`);
  }

  /**
   * Selective retry endpoint:
   * Re-runs only missing or failed stages without repeating expensive audio cleaning or Whisper transcription.
   */
  async retryJob(jobId: string): Promise<{ success: boolean; status: JobStatus; message: string }> {
    const job = await db.getJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const transcript = await db.getTranscript(jobId);
    const recording = await db.getRecording(job.recording_id);

    // If transcript is missing, restart from scratch
    if (!transcript) {
      await db.updateJob(jobId, { status: 'queued', error_message: null });
      this.processJob(jobId);
      return { success: true, status: 'queued', message: 'Restarting full pipeline' };
    }

    // Otherwise only regenerate missing artifacts
    await db.updateJob(jobId, { status: 'processing', stage: 'generating_notes', error_message: null });
    await this.generateOutputsForJob(jobId, transcript.full_text, recording?.title);

    const updatedJob = await db.getJob(jobId);
    return {
      success: true,
      status: updatedJob?.status || 'done',
      message: 'Retry completed successfully',
    };
  }
}

export const jobOrchestrator = new JobOrchestrator();

