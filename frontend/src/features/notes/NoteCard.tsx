import React from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pencil,
  Download,
  Trash2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { FolderColor, Recording } from '../../types/echonote';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import {
  formatDurationLabel,
  formatRelativeTime,
  getSubjectStyle,
} from '../../utils/audioValidation';

interface NoteCardProps {
  recording: Recording;
  folderColor?: FolderColor;
  layout?: 'grid' | 'list';
  onDelete?: (recording: Recording) => void;
  onRename?: (recording: Recording) => void;
}

export function NoteCard({
  recording,
  folderColor = 'indigo',
  layout = 'grid',
  onDelete,
  onRename,
}: NoteCardProps) {
  const style = getSubjectStyle(folderColor);
  const destination =
    recording.status === 'done'
      ? `/notes/${recording.id}`
      : `/processing/${recording.jobId}`;

  const statusBadge =
    recording.status === 'done' ? (
      <Badge variant="transcribed">Transcribed</Badge>
    ) : recording.status === 'failed' ? (
      <Badge variant="failed">Failed</Badge>
    ) : (
      <Badge variant="processing">{recording.progress}% Processing</Badge>
    );

  if (layout === 'list') {
    return (
      <article className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              recording.status === 'done'
                ? 'bg-indigo-50 text-indigo-600'
                : recording.status === 'failed'
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-amber-50 text-amber-600'
            }`}
          >
            {recording.status === 'done' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : recording.status === 'failed' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style.badgeClass}`}
              >
                {recording.subjectLabel}
              </span>
              {statusBadge}
            </div>
            <Link
              to={destination}
              className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors block truncate"
            >
              {recording.title}
            </Link>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {recording.lecturer} · {formatDurationLabel(recording.durationSeconds)} ·{' '}
              {formatRelativeTime(recording.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRename && (
            <button
              type="button"
              onClick={() => onRename(recording)}
              aria-label={`Rename ${recording.title}`}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(recording)}
              aria-label={`Delete ${recording.title}`}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <Link
            to={destination}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap transition-colors"
          >
            {recording.status === 'done' ? 'Open notes' : 'View status'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
      <div
        className={`px-5 py-4 border-b flex items-center justify-between gap-2 ${style.headerBg} ${style.headerBorder}`}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${style.badgeClass}`}
          >
            {recording.subjectLabel}
          </span>
          {statusBadge}
        </div>
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
          {onRename && (
            <button
              type="button"
              onClick={() => onRename(recording)}
              aria-label={`Rename ${recording.title}`}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {recording.status === 'done' && (
            <Link
              to={`/notes/${recording.id}?export=1`}
              aria-label={`Export ${recording.title} as PDF`}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </Link>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(recording)}
              aria-label={`Delete ${recording.title}`}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <Link to={destination} className="p-6 flex-1 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100">
        <div>
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                recording.status === 'done'
                  ? 'bg-indigo-50 text-indigo-600'
                  : recording.status === 'failed'
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-amber-50 text-amber-600'
              }`}
            >
              {recording.status === 'done' ? (
                <Sparkles className="w-4 h-4" />
              ) : recording.status === 'failed' ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                {recording.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {recording.lecturer} · {formatDurationLabel(recording.durationSeconds)}
              </p>
            </div>
          </div>

          {recording.status === 'done' && recording.notes ? (
            <p className="text-sm leading-6 text-slate-600 mt-4 line-clamp-3">
              {recording.notes.summary}
            </p>
          ) : recording.status === 'failed' ? (
            <p className="text-sm leading-6 text-rose-600 mt-4 line-clamp-3">
              {recording.error || 'Audio processing failed. Open to retry.'}
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm leading-6 text-slate-500">
                Pipeline running: noise reduction, Whisper transcription, and study notes generation.
              </p>
              <ProgressBar
                value={recording.progress}
                tone="amber"
                label="Pipeline progress"
                showPercent
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            {formatRelativeTime(recording.updatedAt)}
          </span>
          <span className="font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
            {recording.status === 'done' ? 'AI Generated' : recording.status === 'failed' ? 'Retry job' : 'Track progress'}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
