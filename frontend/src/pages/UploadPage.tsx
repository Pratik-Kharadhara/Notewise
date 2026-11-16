import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileAudio,
  X,
  Mic,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/index.js';
import type { Folder } from '../types/echonote';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import {
  ALLOWED_AUDIO_EXTENSIONS,
  MAX_AUDIO_SIZE_MB,
  formatFileSize,
  validateAudioFile,
} from '../utils/audioValidation';

export function UploadPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [folderId, setFolderId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .getFolders()
      .then((list) => {
        setFolders(list);
        if (list.length > 0) setFolderId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const handleFileChosen = (file: File | null | undefined) => {
    if (!file) return;
    const validation = validateAudioFile(file);
    if (!validation.valid) {
      setSelectedFile(null);
      setFileError(validation.error || 'Invalid audio file.');
      return;
    }

    setFileError('');
    setSelectedFile(file);
    if (!title.trim()) {
      const cleaned = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
      setTitle(cleaned);
      setTitleError('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileChosen(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let valid = true;
    if (!selectedFile) {
      setFileError('Please select or drop a lecture audio file.');
      valid = false;
    }
    if (!title.trim()) {
      setTitleError('Please provide a lecture title.');
      valid = false;
    }
    if (!valid || !selectedFile) return;

    setSubmitting(true);
    try {
      const res = await api.createRecording({
        audio: selectedFile,
        title: title.trim(),
        folderId: folderId || 'cs101',
        durationSeconds: 1800,
        source: 'uploaded',
      });
      showToast('Audio uploaded! Processing pipeline started.', 'success');
      navigate(`/processing/${res.jobId}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Upload failed. Please try again.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-5 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <Link to="/" className="hover:text-indigo-600 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-700 font-medium">Upload Lecture</span>
            </nav>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Upload lecture audio
            </h1>
            <p className="text-slate-500 mt-1">
              Drop a classroom recording to generate notes, revision sheets, a cheatsheet, and a mindmap.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => navigate('/record')}
            icon={<Mic className="w-4 h-4 text-rose-500" />}
          >
            Record live instead
          </Button>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drag & drop area */}
            <div>
              <p className="block text-sm font-semibold text-slate-700 mb-2">
                Lecture audio file
              </p>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/70'
                    : fileError
                      ? 'border-rose-300 bg-rose-50/40'
                      : 'border-slate-300 bg-slate-50/70 hover:border-indigo-300 hover:bg-indigo-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_AUDIO_EXTENSIONS.join(',')}
                  aria-label="Choose audio file"
                  className="sr-only"
                  onChange={(e) => handleFileChosen(e.target.files?.[0])}
                />

                {!selectedFile ? (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">
                        Drag &amp; drop your lecture recording here
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports MP3, WAV, M4A, and WebM · Max {MAX_AUDIO_SIZE_MB} MB
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse computer
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileAudio className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ready · {formatFileSize(selectedFile.size)}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      aria-label="Remove selected audio file"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {fileError && (
                <p
                  role="alert"
                  className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fileError}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Lecture title"
                placeholder="e.g. Data Structures: AVL Trees"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                error={titleError}
              />

              <Select
                label="Subject folder"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
              >
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Pipeline stages: Noise removal → Whisper transcription → Notes &amp; Mindmap
              </p>
              <Button
                type="submit"
                size="lg"
                loading={submitting}
                icon={<UploadCloud className="w-4 h-4" />}
              >
                Upload &amp; Process
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
