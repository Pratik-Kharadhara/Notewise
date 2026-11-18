import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mic,
  UploadCloud,
  Plus,
  ChevronRight,
  Code2,
  Brain,
  Landmark,
  FolderClosed,
  FilePlus2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/index.js';
import type { Folder, FolderColor, Recording } from '../types/echonote';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { NoteCardSkeleton } from '../components/ui/Skeleton';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { NoteCard } from '../features/notes/NoteCard';
import { LiveWaveform } from '../features/recording/LiveWaveform';
import { FolderModal } from '../features/folders/FolderModal';
import { useToast } from '../context/ToastContext';
import { getSubjectStyle } from '../utils/audioValidation';
import { filterActivityByTab, type ActivityTabFilter } from '../utils/notesFilters';

function FolderIcon({ icon }: { icon: Folder['icon'] }) {
  if (icon === 'code') return <Code2 className="w-5 h-5" />;
  if (icon === 'brain') return <Brain className="w-5 h-5" />;
  if (icon === 'landmark') return <Landmark className="w-5 h-5" />;
  return <FolderClosed className="w-5 h-5" />;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityTab, setActivityTab] = useState<ActivityTabFilter>('all');

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Recording | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recs, flds] = await Promise.all([api.getRecordings(), api.getFolders()]);
      setRecordings(recs);
      setFolders(flds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const folderColorMap = useMemo(() => {
    const map: Record<string, FolderColor> = {};
    for (const f of folders) map[f.id] = f.color;
    return map;
  }, [folders]);

  const visibleActivity = useMemo(
    () => filterActivityByTab(recordings, activityTab).slice(0, 6),
    [recordings, activityTab]
  );

  const spotlight = useMemo(() => {
    const processing = recordings.find((r) => r.status === 'processing');
    if (processing) return processing;
    return recordings.find((r) => r.status === 'done') || null;
  }, [recordings]);

  const handleCreateFolder = async (data: {
    name: string;
    description: string;
    color: FolderColor;
  }) => {
    await api.createFolder(data);
    showToast(`Folder "${data.name}" created.`, 'success');
    await loadData();
  };

  const handleDeleteNote = async (rec: Recording) => {
    try {
      await api.deleteRecording(rec.id);
      setRecordings((prev) => prev.filter((r) => r.id !== rec.id));
      showToast(`Deleted "${rec.title}".`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed.', 'error');
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !renameTitle.trim()) return;
    setRenameSaving(true);
    try {
      const updated = await api.updateRecording(renameTarget.id, {
        title: renameTitle.trim(),
      });
      setRecordings((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast('Lecture title updated.', 'success');
      setRenameTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Rename failed.', 'error');
    } finally {
      setRenameSaving(false);
    }
  };

  return (
    <div className="p-5 md:p-8 pb-28">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Record + Recent Folders */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card padding="lg" className="lg:col-span-2 relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Ready to record?
                  </h1>
                  <p className="text-slate-500 mt-1 text-sm md:text-base">
                    Capture a live lecture or upload audio to generate exam-ready notes.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/upload')}
                  icon={<UploadCloud className="w-4 h-4" />}
                >
                  Upload File
                </Button>
              </div>

              <div className="flex flex-col items-center justify-center py-4">
                <div className="text-4xl md:text-5xl font-mono font-semibold tracking-tight text-slate-900 tabular-nums mb-5">
                  00:00:00
                </div>

                <Link
                  to="/record"
                  aria-label="Start recording session"
                  className="relative w-24 h-24 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-200 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
                >
                  <Mic className="w-9 h-9" />
                </Link>

                <p className="text-xs font-semibold text-slate-500 mt-4">
                  Click the microphone to open the recording studio
                </p>

                <div className="w-full max-w-sm mt-4">
                  <LiveWaveform active={false} tone="rose" heightClass="h-10" />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 text-xs text-slate-500">
                <span>Supports MP3, WAV, M4A &amp; WebM</span>
                <span>Noise reduction → Whisper → AI Study Notes</span>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-60 z-0 pointer-events-none"
            />
          </Card>

          <Card padding="md" className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Recent Folders</h2>
              <Link
                to="/folders"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                  <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                  <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
                </div>
              ) : (
                folders.slice(0, 3).map((folder) => {
                  const style = getSubjectStyle(folder.color);
                  return (
                    <Link
                      key={folder.id}
                      to={`/folders?selected=${encodeURIComponent(folder.id)}`}
                      className={`flex items-center justify-between p-3 border rounded-2xl transition-colors ${style.softCardBg} ${style.softCardBorder}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}
                        >
                          <FolderIcon icon={folder.icon} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {folder.name}
                          </p>
                          <p className="text-xs text-slate-500 tabular-nums">
                            {folder.noteCount ?? 0} Notes
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </Link>
                  );
                })
              )}

              <button
                type="button"
                onClick={() => setCreateFolderOpen(true)}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-sm font-semibold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/40 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Folder
              </button>
            </div>
          </Card>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            <div className="flex items-center gap-5" role="tablist" aria-label="Filter recent activity">
              {(
                [
                  { id: 'all', label: 'All Notes' },
                  { id: 'recordings', label: 'Recordings' },
                  { id: 'transcripts', label: 'Transcripts' },
                ] as const
              ).map((tab) => {
                const active = activityTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActivityTab(tab.id)}
                    className={`text-sm font-semibold transition-colors cursor-pointer pb-1 ${
                      active
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <Card padding="lg" className="text-center">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-900">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={loadData}
                className="mt-4"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry loading
              </Button>
            </Card>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <NoteCardSkeleton />
              <NoteCardSkeleton />
              <NoteCardSkeleton />
            </div>
          ) : visibleActivity.length === 0 ? (
            <Card padding="lg" className="text-center border-dashed border-slate-300">
              <p className="text-base font-bold text-slate-900">No lectures here yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Record a classroom session or upload an audio file to get started.
              </p>
              <div className="flex justify-center gap-3 mt-5">
                <Button onClick={() => navigate('/record')} icon={<Mic className="w-4 h-4" />}>
                  Record Session
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/upload')}
                  icon={<UploadCloud className="w-4 h-4" />}
                >
                  Upload Audio
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {visibleActivity.map((rec) => (
                <NoteCard
                  key={rec.id}
                  recording={rec}
                  folderColor={folderColorMap[rec.folderId] || 'indigo'}
                  onDelete={handleDeleteNote}
                  onRename={(target) => {
                    setRenameTarget(target);
                    setRenameTitle(target.title);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pipeline / Study Spotlight (replaces fake live transcription card on Dashboard) */}
        {spotlight && (
          <Card highlighted padding="lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  <Badge variant={spotlight.status === 'processing' ? 'processing' : 'ai'}>
                    <Sparkles className="w-3.5 h-3.5" />
                    {spotlight.status === 'processing'
                      ? 'Pipeline Active'
                      : 'Latest Study Material'}
                  </Badge>
                  <Badge variant="neutral">{spotlight.subjectLabel}</Badge>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{spotlight.title}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {spotlight.status === 'processing'
                    ? 'Audio cleanup, Whisper transcription, and mindmap generation are underway.'
                    : spotlight.notes?.summary}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="dark"
                  onClick={() =>
                    navigate(
                      spotlight.status === 'processing'
                        ? `/processing/${spotlight.jobId}`
                        : `/notes/${spotlight.id}`
                    )
                  }
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  {spotlight.status === 'processing' ? 'Track Pipeline' : 'Open Study Notes'}
                </Button>
              </div>
            </div>

            {spotlight.status === 'processing' ? (
              <ProgressBar
                value={spotlight.progress}
                tone="amber"
                label="Current pipeline stage"
                showPercent
              />
            ) : (
              spotlight.notes && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Key Points Extracted
                    </p>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {(spotlight.notes.keyPoints ?? spotlight.notes.key_points ?? []).slice(0, 3).map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                      Exam Revision Highlight
                    </p>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {(spotlight.notes.revisionSheet?.[0] ?? spotlight.notes.quick_revision_sheet?.[0]) || spotlight.notes.summary}
                    </p>
                    <Link
                      to={`/notes/${spotlight.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-1"
                    >
                      View mindmap, cheatsheet &amp; Q&amp;A
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            )}
          </Card>
        )}
      </div>

      {/* Floating Quick-Action Dock from Dashboard design */}
      <div className="hidden md:flex fixed bottom-6 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-40 items-center gap-2 p-2 bg-slate-900/95 backdrop-blur shadow-2xl rounded-2xl border border-white/10">
        <Link
          to="/record"
          className="flex items-center gap-2.5 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95"
        >
          <Mic className="w-4 h-4" />
          <span>Start Session</span>
        </Link>
        <div className="w-px h-7 bg-white/20 mx-0.5" aria-hidden="true" />
        <Link
          to="/notes"
          aria-label="Browse all notes"
          title="All Notes"
          className="flex items-center justify-center w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
        >
          <FilePlus2 className="w-4 h-4" />
        </Link>
        <Link
          to="/upload"
          aria-label="Upload audio lecture"
          title="Upload Audio"
          className="flex items-center justify-center w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
        >
          <UploadCloud className="w-4 h-4" />
        </Link>
      </div>

      <FolderModal
        open={createFolderOpen}
        mode="create"
        folder={null}
        onClose={() => setCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
        onRename={async () => {}}
        onDelete={async () => {}}
      />

      <Modal
        open={Boolean(renameTarget)}
        onClose={() => setRenameTarget(null)}
        title="Rename lecture note"
        description="Update the display title for this recording."
      >
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <Input
            label="Lecture title"
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={renameSaving} disabled={!renameTitle.trim()}>
              Save title
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
