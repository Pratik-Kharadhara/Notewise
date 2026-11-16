import type {
  Folder,
  FolderColor,
  JobStatusResponse,
  Recording,
} from '../types/echonote';

export const USE_MOCK: boolean;

export const api: {
  getFolders(): Promise<Folder[]>;
  createFolder(input: {
    name: string;
    description?: string;
    color?: FolderColor;
  }): Promise<Folder>;
  updateFolder(
    id: string,
    updates: Partial<Pick<Folder, 'name' | 'description' | 'color'>>
  ): Promise<Folder>;
  deleteFolder(id: string): Promise<{ deleted: boolean }>;
  getRecordings(): Promise<Recording[]>;
  getRecordingById(id: string): Promise<Recording>;
  createRecording(input: {
    audio: File | Blob;
    title: string;
    folderId: string;
    durationSeconds?: number;
    source?: 'recorded' | 'uploaded';
  }): Promise<{ recordingId: string; jobId: string }>;
  getJobStatus(jobId: string): Promise<JobStatusResponse>;
  retryJob(jobId: string): Promise<JobStatusResponse>;
  updateRecording(
    id: string,
    updates: Partial<Pick<Recording, 'title' | 'folderId' | 'subjectLabel'>>
  ): Promise<Recording>;
  deleteRecording(id: string): Promise<{ deleted: boolean }>;
  askLectureQuestion(
    recordingId: string,
    question: string
  ): Promise<{ answer: string }>;
};
