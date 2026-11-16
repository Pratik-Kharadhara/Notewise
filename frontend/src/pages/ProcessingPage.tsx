import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  ChevronRight,
  AudioLines,
  Sparkles,
  FileText,
  UploadCloud,
} from 'lucide-react';
import { usePollJob } from '../hooks/usePollJob';
import { api } from '../services/index.js';
import type { PipelineStage, Recording } from '../types/echonote';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';

const PIPELINE_STEPS: {
  key: PipelineStage;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'uploaded',
    label: 'Uploaded',
    description: 'Audio saved securely and queued for processing.',
    icon: <UploadCloud className="w-4 h-4" />,
  },
  {
    key: 'noise_reduction',
    label: 'Noise Reduction',
    description: 'Python DSP filter removes classroom echo and background hum.',
    icon: <AudioLines className="w-4 h-4" />,
  },
  {
    key: 'transcription',
    label: 'Whisper Transcription',
    description: 'Converting cleaned speech into timestamped lecture segments.',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    key: 'generating_notes',
    label: 'Generating Study Notes',
    description: 'Building structured notes, revision sheet, cheatsheet, and mindmap.',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    key: 'done',
    label: 'Ready to Study',
    description: 'All exam materials are saved and ready for review.',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
];

function getStageIndex(stage?: PipelineStage): number {
  const idx = PIPELINE_STEPS.findIndex((s) => s.key === stage);
  return idx === -1 ? 0 : idx;
}

export function ProcessingPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { job, displayProgress, loading, error, isRetrying, retry } = usePollJob(jobId);
  const [recording, setRecording] = useState<Recording | null>(null);

  useEffect(() => {
    if (!job?.recordingId) return;
    api
      .getRecordingById(job.recordingId)
      .then(setRecording)
      .catch(() => {});
  }, [job?.recordingId, job?.status]);

  const currentStageIndex = getStageIndex(job?.stage);
  const isDone = job?.status === 'done';
  const isFailed = job?.status === 'failed';

  return (
    <div className="p-5 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-700 font-medium">Processing Pipeline</span>
        </nav>

        <Card highlighted padding="lg">
          {loading && !job ? (
            <div className="space-y-4">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-80" />
              <Skeleton className="h-3 w-full" />
              <div className="space-y-3 pt-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge
                      variant={
                        isDone ? 'transcribed' : isFailed ? 'failed' : 'processing'
                      }
                    >
                      {isDone ? 'DONE' : isFailed ? 'FAILED' : 'PROCESSING'}
                    </Badge>
                    {recording?.subjectLabel && (
                      <Badge variant="indigo">{recording.subjectLabel}</Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {recording?.title || 'Processing Lecture Audio'}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {isDone
                      ? 'Your lecture notes, cheatsheet, mindmap, and transcript are ready.'
                      : isFailed
                        ? 'One of the background workers encountered an issue.'
                        : 'Polling job status automatically every few seconds.'}
                  </p>
                </div>

                {isDone && job?.recordingId && (
                  <Button
                    size="lg"
                    onClick={() => navigate(`/notes/${job.recordingId}`)}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Open Study Notes
                  </Button>
                )}

                {isFailed && (
                  <Button
                    variant="danger"
                    size="lg"
                    loading={isRetrying}
                    onClick={retry}
                    icon={<RotateCcw className="w-4 h-4" />}
                  >
                    Retry Processing
                  </Button>
                )}
              </div>

              <ProgressBar
                value={displayProgress}
                tone={isDone ? 'emerald' : isFailed ? 'rose' : 'indigo'}
                label={
                  isDone
                    ? 'All pipeline stages complete'
                    : isFailed
                      ? 'Pipeline interrupted'
                      : `Stage: ${PIPELINE_STEPS[currentStageIndex]?.label || 'Queued'}`
                }
                showPercent
              />

              {(isFailed || error) && (
                <div
                  role="alert"
                  className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-800"
                >
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Processing error</p>
                    <p className="mt-0.5">
                      {job?.error || error || 'Unable to fetch job status. Retrying with backoff.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Stage Stepper */}
              <ol className="space-y-3" aria-label="Processing pipeline stages">
                {PIPELINE_STEPS.map((step, idx) => {
                  const completed =
                    isDone || (!isFailed && idx < currentStageIndex);
                  const active =
                    !isDone && !isFailed && idx === currentStageIndex;
                  const failedHere = isFailed && idx === currentStageIndex;

                  return (
                    <li
                      key={step.key}
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                        completed
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : active
                            ? 'bg-indigo-50/70 border-indigo-200 shadow-sm'
                            : failedHere
                              ? 'bg-rose-50/60 border-rose-200'
                              : 'bg-slate-50/60 border-slate-200/80 opacity-75'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          completed
                            ? 'bg-emerald-600 text-white'
                            : active
                              ? 'bg-indigo-600 text-white'
                              : failedHere
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : active ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : failedHere ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-900">
                            {idx + 1}. {step.label}
                          </p>
                          <span className="text-xs font-semibold text-slate-500">
                            {completed
                              ? 'Complete'
                              : active
                                ? 'In progress'
                                : failedHere
                                  ? 'Failed'
                                  : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{step.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <Link
                  to="/notes"
                  className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  Back to All Notes
                </Link>
                {!isDone && !isFailed && (
                  <p className="text-xs text-slate-400">
                    You can leave this page safely — processing continues in the background.
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
