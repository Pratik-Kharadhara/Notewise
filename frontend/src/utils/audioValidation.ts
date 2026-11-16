import type { FolderColor } from '../types/echonote';

export const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.webm'] as const;
export const ALLOWED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/aac',
  'audio/webm',
  'video/webm',
];
export const MAX_AUDIO_SIZE_MB = 150;
export const MAX_AUDIO_SIZE_BYTES = MAX_AUDIO_SIZE_MB * 1024 * 1024;

export interface AudioValidationInput {
  name: string;
  size: number;
  type?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates audio files before upload (supports .mp3, .wav, .m4a, .webm up to 150 MB).
 */
export function validateAudioFile(file: AudioValidationInput | null | undefined): ValidationResult {
  if (!file) {
    return { valid: false, error: 'Please select an audio file to upload.' };
  }

  const lowerName = file.name.toLowerCase().trim();
  const hasValidExt = ALLOWED_AUDIO_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const mime = (file.type || '').toLowerCase();
  const hasValidMime = mime === '' || ALLOWED_AUDIO_MIMES.includes(mime);

  if (!hasValidExt || !hasValidMime) {
    return {
      valid: false,
      error: 'Unsupported format. Please upload an MP3, WAV, M4A, or WebM audio file.',
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'The selected file is empty (0 bytes).' };
  }

  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds the ${MAX_AUDIO_SIZE_MB} MB size limit. Please trim or compress the recording.`,
    };
  }

  return { valid: true };
}

/**
 * Formats seconds into HH:MM:SS for the recording timer and audio metadata.
 */
export function formatDurationClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':');
}

/**
 * Formats seconds into a concise human string like "42 min" or "1h 12m".
 */
export function formatDurationLabel(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  if (safe < 60) return `${safe} sec`;
  const mins = Math.round(safe / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hrs}h` : `${hrs}h ${rem}m`;
}

/**
 * Formats file byte size into KB or MB.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Formats an ISO timestamp into relative time (e.g., "45m ago", "3h ago", "2d ago").
 */
export function formatRelativeTime(isoDate: string, nowMs: number = Date.now()): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return 'Recently';
  const diffSec = Math.max(0, Math.floor((nowMs - then) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Generates up to 2 uppercase initials from a student's name for the avatar badge.
 */
export function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'EN';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface SubjectStyle {
  iconBg: string;
  softCardBg: string;
  softCardBorder: string;
  headerBg: string;
  headerBorder: string;
  badgeClass: string;
  dotClass: string;
}

const SUBJECT_STYLES: Record<FolderColor, SubjectStyle> = {
  blue: {
    iconBg: 'bg-blue-500 text-white',
    softCardBg: 'bg-blue-50/50 hover:bg-blue-50',
    softCardBorder: 'border-blue-100',
    headerBg: 'bg-blue-50/40',
    headerBorder: 'border-blue-100',
    badgeClass: 'bg-blue-100 text-blue-700',
    dotClass: 'bg-blue-500',
  },
  rose: {
    iconBg: 'bg-rose-500 text-white',
    softCardBg: 'bg-rose-50/50 hover:bg-rose-50',
    softCardBorder: 'border-rose-100',
    headerBg: 'bg-rose-50/40',
    headerBorder: 'border-rose-100',
    badgeClass: 'bg-rose-100 text-rose-700',
    dotClass: 'bg-rose-500',
  },
  amber: {
    iconBg: 'bg-amber-500 text-white',
    softCardBg: 'bg-amber-50/50 hover:bg-amber-50',
    softCardBorder: 'border-amber-100',
    headerBg: 'bg-amber-50/50',
    headerBorder: 'border-amber-100',
    badgeClass: 'bg-amber-100 text-amber-700',
    dotClass: 'bg-amber-500',
  },
  indigo: {
    iconBg: 'bg-indigo-600 text-white',
    softCardBg: 'bg-indigo-50/50 hover:bg-indigo-50',
    softCardBorder: 'border-indigo-100',
    headerBg: 'bg-indigo-50/40',
    headerBorder: 'border-indigo-100',
    badgeClass: 'bg-indigo-100 text-indigo-700',
    dotClass: 'bg-indigo-600',
  },
  emerald: {
    iconBg: 'bg-emerald-500 text-white',
    softCardBg: 'bg-emerald-50/50 hover:bg-emerald-50',
    softCardBorder: 'border-emerald-100',
    headerBg: 'bg-emerald-50/40',
    headerBorder: 'border-emerald-100',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    dotClass: 'bg-emerald-500',
  },
  violet: {
    iconBg: 'bg-violet-500 text-white',
    softCardBg: 'bg-violet-50/50 hover:bg-violet-50',
    softCardBorder: 'border-violet-100',
    headerBg: 'bg-violet-50/40',
    headerBorder: 'border-violet-100',
    badgeClass: 'bg-violet-100 text-violet-700',
    dotClass: 'bg-violet-500',
  },
};

export function getSubjectStyle(color?: FolderColor): SubjectStyle {
  return SUBJECT_STYLES[color || 'indigo'] || SUBJECT_STYLES.indigo;
}
