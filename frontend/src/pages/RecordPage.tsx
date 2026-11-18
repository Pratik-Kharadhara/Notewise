import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mic,
  Pause,
  Play,
  Square,
  RotateCcw,
  UploadCloud,
  ChevronRight,
  AudioLines,
  FileAudio,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/index.js';
import type { Folder } from '../types/echonote';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { LiveWaveform } from '../features/recording/LiveWaveform';
import { formatDurationClock, formatFileSize } from '../utils/audioValidation';

export function RecordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const recorder = useAudioRecorder();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [title, setTitle] = useState('');
  const [folderId, setFolderId] = useState('');
  const [titleError, setTitleError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api
      .getFolders()
      .then((list) => {
        setFolders(list);
        if (list.length > 0) setFolderId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const handleUploadRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Please enter a lecture title before uploading.');
      return;
    }
    if (!recorder.audioBlob) {
      showToast('Record audio first before submitting to the pipeline.', 'warning');
      return;
    }

    setUploading(true);
    try {
      const file = new File([recorder.audioBlob], `lecture-${Date.now()}.webm`, {
        type: recorder.audioBlob.type || 'audio/webm',
      });
      const res = await api.createRecording({
        audio: file,
        title: title.trim(),
        folderId: folderId || 'cs101',
        durationSeconds: Math.max(1, recorder.elapsedSeconds),
        source: 'recorded',
      });
      showToast('Lecture uploaded! Starting noise reduction and transcription.', 'success');
      navigate(`/processing/${res.jobId}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to upload recorded lecture.',
        'error'
      );
    } finally {
      setUploading(false);
    }
  };

  const statusBadge =
    recorder.state === 'recording' ? (
      <Badge variant="failed">RECORDING</Badge>
    ) : recorder.state === 'paused' ? (
      <Badge variant="processing">PAUSED</Badge>
    ) : recorder.state === 'stopped' ? (
      <Badge variant="transcribed">READY TO UPLOAD</Badge>
    ) : (
      <Badge variant="neutral">STANDBY</Badge>
    );

  return (
    <div className="p-5 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb & page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <Link to="/" className="hover:text-indigo-600 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-700 font-medium">Recording Session</span>
            </nav>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Recording session
            </h1>
            <p className="text-slate-500 mt-1">
              Capture your classroom audio now. Notewise processes and transcribes it right after upload.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => navigate('/upload')}
            icon={<UploadCloud className="w-4 h-4" />}
          >
            Upload file instead
          </Button>
        </div>

        {recorder.error && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-900">Microphone unavailable</p>
                <p className="text-sm text-rose-700 mt-0.5">{recorder.error}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/upload')}
              icon={<UploadCloud className="w-4 h-4" />}
            >
              Upload audio file
            </Button>
          </div>
        )}

        <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left 3 columns: Recording Deck */}
          <Card padding="lg" className="xl:col-span-3 relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-indigo-50 pointer-events-none"
            />
            <div className="relative z-10">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-7">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="indigo">Web Audio Studio</Badge>
                    {statusBadge}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {title.trim() || 'Untitled Classroom Lecture'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {folders.find((f) => f.id === folderId)?.name || 'Select a subject folder'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 px-6 py-8 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">
                  Current duration
                </p>
                <div
                  data-testid="recording-timer"
                  className="text-5xl sm:text-6xl font-mono font-semibold tracking-tight text-slate-900 tabular-nums"
                >
                  {formatDurationClock(recorder.elapsedSeconds)}
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  {recorder.state === 'recording'
                    ? 'Capturing microphone audio...'
                    : recorder.state === 'paused'
                      ? 'Recording paused'
                      : recorder.state === 'stopped'
                        ? 'Recording complete — review and upload below'
                        : 'Press Start Recording when your professor begins'}
                </p>

                <div className="mt-6">
                  <LiveWaveform
                    levels={recorder.state === 'recording' ? recorder.levels : undefined}
                    active={recorder.state === 'recording'}
                    paused={recorder.state === 'paused'}
                    tone="rose"
                    heightClass="h-20"
                  />
                </div>
              </div>

              {/* Transport Controls */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                {recorder.state === 'idle' && (
                  <Button
                    size="lg"
                    onClick={recorder.start}
                    className="bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-100 min-w-44"
                    icon={<Mic className="w-5 h-5" />}
                  >
                    Start Recording
                  </Button>
                )}

                {recorder.state === 'recording' && (
                  <>
                    <Button
                      variant="amber"
                      size="lg"
                      onClick={recorder.pause}
                      icon={<Pause className="w-4 h-4" />}
                    >
                      Pause
                    </Button>
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={recorder.stop}
                      icon={<Square className="w-4 h-4" />}
                    >
                      Stop &amp; Review
                    </Button>
                  </>
                )}

                {recorder.state === 'paused' && (
                  <>
                    <Button
                      size="lg"
                      onClick={recorder.resume}
                      icon={<Play className="w-4 h-4" />}
                    >
                      Resume
                    </Button>
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={recorder.stop}
                      icon={<Square className="w-4 h-4" />}
                    >
                      Stop &amp; Review
                    </Button>
                  </>
                )}

                {recorder.state === 'stopped' && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={recorder.reset}
                    icon={<RotateCcw className="w-4 h-4" />}
                  >
                    Discard &amp; Re-record
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-7 pt-6 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2.5">
                  <AudioLines className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-700">Live Waveform</p>
                    <p>Web Audio AnalyserNode</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <FileAudio className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-700">Browser MediaRecorder</p>
                    <p>WebM / Opus capture</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-700">Post-Upload Pipeline</p>
                    <p>Denoise → Whisper → Notes</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Right 2 columns: Lecture Details & Upload */}
          <Card padding="md" className="xl:col-span-2 flex flex-col justify-between">
            <form onSubmit={handleUploadRecording} className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Lecture details &amp; upload
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Once you stop recording, submit the audio to generate structured notes, a cheatsheet, and a mindmap.
                </p>
              </div>

              <Input
                label="Lecture title"
                placeholder="e.g. Operating Systems: Memory Paging"
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

              {recorder.audioUrl && recorder.audioBlob && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Recorded audio preview</span>
                    <span className="font-mono tabular-nums">
                      {formatFileSize(recorder.audioBlob.size)}
                    </span>
                  </div>
                  <audio controls src={recorder.audioUrl} className="w-full" />
                </div>
              )}

              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                <strong>Pipeline note:</strong> Transcription happens after upload so our
                Python noise-reduction filter can clean classroom echo before Whisper runs.
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={uploading}
                disabled={recorder.state !== 'stopped' || !recorder.audioBlob}
                icon={<UploadCloud className="w-4 h-4" />}
              >
                Upload &amp; Generate Notes
              </Button>
            </form>
          </Card>
        </section>
      </div>
    </div>
  );
}
