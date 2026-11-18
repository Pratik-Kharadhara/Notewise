export type JobStatus = 'queued' | 'processing' | 'done' | 'partial' | 'failed';

export type PipelineStage =
  | 'uploaded'
  | 'noise_reduction'
  | 'transcription'
  | 'generating_notes'
  | 'done'
  | 'failed';

export type OutputType = 'notes' | 'cheatsheet' | 'mindmap' | 'qa';

export interface DefinitionItem {
  term: string;
  definition: string;
  meaning?: string;
}

export interface NotesContent {
  title?: string;
  summary?: string;
  key_points: string[];
  keyPoints?: string[];
  definitions: DefinitionItem[];
  examples: string[];
  quick_revision_sheet: string[];
  revisionSheet?: string[];
}

export interface CheatsheetSection {
  heading: string;
  bullets: string[];
}

export interface CheatsheetContent {
  sections: CheatsheetSection[];
}

export interface MindmapNode {
  title: string;
  topic?: string;
  children?: MindmapNode[];
}

export interface TranscriptSegment {
  id?: string;
  start: number;
  end: number;
  timestamp?: string;
  speaker?: string;
  text: string;
}

export interface TranscriptData {
  id?: string;
  job_id: string;
  full_text: string;
  segments: TranscriptSegment[];
  word_count: number;
  created_at?: string;
}

export interface OutputData {
  id?: string;
  job_id: string;
  type: OutputType;
  content: any;
  created_at?: string;
}

export interface RecordingData {
  id: string;
  session_id: string;
  original_filename: string;
  raw_audio_path: string;
  cleaned_audio_path?: string | null;
  created_at: string;
  // Metadata extensions supported for frontend UI integration
  title?: string;
  folder_id?: string;
  duration_seconds?: number;
  source?: 'recorded' | 'uploaded';
  subject_label?: string;
  lecturer?: string;
}

export interface JobData {
  id: string;
  recording_id: string;
  status: JobStatus;
  stage?: PipelineStage;
  progress?: number;
  error_message?: string | null;
  completed_artifacts?: OutputType[];
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  name: string;
  description: string;
  color: 'blue' | 'rose' | 'amber' | 'indigo' | 'emerald' | 'violet';
  icon: 'code' | 'brain' | 'landmark' | 'book' | 'atom' | 'folder';
  updatedAt: string;
  noteCount?: number;
}

