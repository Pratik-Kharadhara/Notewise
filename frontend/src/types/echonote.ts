export type FolderColor = 'blue' | 'rose' | 'amber' | 'indigo' | 'emerald' | 'violet';

export interface Folder {
  id: string;
  name: string;
  description: string;
  color: FolderColor;
  icon: 'code' | 'brain' | 'landmark' | 'book' | 'atom' | 'folder';
  updatedAt: string;
  noteCount?: number;
}

export type RecordingStatus = 'done' | 'processing' | 'failed';

export type PipelineStage =
  | 'uploaded'
  | 'noise_reduction'
  | 'transcription'
  | 'generating_notes'
  | 'done'
  | 'failed';

export interface DefinitionItem {
  term: string;
  meaning: string;
}

export interface StructuredNotes {
  title: string;
  summary: string;
  keyPoints: string[];
  definitions: DefinitionItem[];
  examples: string[];
  revisionSheet: string[];
}

export interface CheatsheetSection {
  heading: string;
  bullets: string[];
}

export interface Cheatsheet {
  sections: CheatsheetSection[];
}

export interface MindmapNode {
  topic: string;
  children?: MindmapNode[];
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  timestamp: string;
  text: string;
}

export interface Recording {
  id: string;
  jobId: string;
  title: string;
  folderId: string;
  subjectLabel: string;
  lecturer: string;
  source: 'recorded' | 'uploaded';
  status: RecordingStatus;
  progress: number;
  stage: PipelineStage;
  durationSeconds: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
  transcript: TranscriptSegment[];
  notes: StructuredNotes | null;
  cheatsheet: Cheatsheet | null;
  mindmap: MindmapNode | null;
  suggestedQuestions?: string[];
}

export interface JobStatusResponse {
  jobId: string;
  recordingId: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  stage: PipelineStage;
  progress: number;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  error?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  major: string;
  isGuest: boolean;
}
