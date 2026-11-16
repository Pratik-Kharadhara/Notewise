import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  Plus,
  FolderClosed,
  FileCheck2,
  Clock3,
  Code2,
  Brain,
  Landmark,
  Pencil,
  Trash2,
  Search,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/index.js';
import type { Folder, FolderColor, Recording } from '../types/echonote';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { FolderModal, type FolderModalMode } from '../features/folders/FolderModal';
import { NoteCard } from '../features/notes/NoteCard';
import { formatRelativeTime, getSubjectStyle } from '../utils/audioValidation';

function FolderGlyph({ icon }: { icon: Folder['icon'] }) {
  if (icon === 'code') return <Code2 className="w-6 h-6" />;
  if (icon === 'brain') return <Brain className="w-6 h-6" />;
  if (icon === 'landmark') return <Landmark className="w-6 h-6" />;
  return <FolderClosed className="w-6 h-6" />;
}

export function FoldersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    () => searchParams.get('selected') || ''
  );
  const [folderNoteQuery, setFolderNoteQuery] = useState('');

  const [modalMode, setModalMode] = useState<FolderModalMode>(null);
  const [modalTarget, setModalTarget] = useState<Folder | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [flds, recs] = await Promise.all([api.getFolders(), api.getRecordings()]);
      setFolders(flds);
      setRecordings(recs);
      setSelectedFolderId((prev) => {
        if (prev && flds.some((f) => f.id === prev)) return prev;
        return flds[0]?.id || '';
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load folders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedFolder = useMemo(
    () => folders.find((f) => f.id === selectedFolderId) || null,
    [folders, selectedFolderId]
  );

  const notesInSelectedFolder = useMemo(() => {
    if (!selectedFolder) return [];
    const q = folderNoteQuery.trim().toLowerCase();
    return recordings.filter((r) => {
      if (r.folderId !== selectedFolder.id) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        (r.notes?.summary || '').toLowerCase().includes(q)
      );
    });
  }, [recordings, selectedFolder, folderNoteQuery]);

  const handleSelectFolder = (id: string) => {
    setSelectedFolderId(id);
    setSearchParams({ selected: id });
  };

  const handleCreate = async (data: {
    name: string;
    description: string;
    color: FolderColor;
  }) => {
    const created = await api.createFolder(data);
    showToast(`Folder "${created.name}" created.`, 'success');
    await loadData();
    handleSelectFolder(created.id);
  };

  const handleRename = async (id: string, name: string, description: string) => {
    await api.updateFolder(id, { name, description });
    showToast(`Folder renamed to "${name}".`, 'success');
    await loadData();
  };

  const handleDelete = async (id: string) => {
    await api.deleteFolder(id);
    showToast('Folder deleted. Existing notes remain in All Notes.', 'info');
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

  return (
    <div className="p-5 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <section className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <Link to="/" className="hover:text-indigo-600 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-600 font-medium">Folders</span>
            </nav>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Your folders
            </h1>
            <p className="text-slate-500 mt-1.5">
              Keep lectures, recordings, and study notes organized by subject.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => {
              setModalTarget(null);
              setModalMode('create');
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            New folder
          </Button>
        </section>

        {/* Stats strip */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total folders</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FolderClosed className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3 tabular-nums">
              {folders.length}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Notes organized</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3 tabular-nums">
              {recordings.length}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Recently updated</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock3 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">
              {recordings[0] ? formatRelativeTime(recordings[0].updatedAt) : 'Today'}
            </p>
          </div>
        </section>

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
              Retry
            </Button>
          </Card>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <Skeleton className="h-44 rounded-3xl" />
            <Skeleton className="h-44 rounded-3xl" />
            <Skeleton className="h-44 rounded-3xl" />
          </div>
        ) : (
          <>
            {/* Folder Grid */}
            <section>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">All folders</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Select a folder to inspect or filter its lecture notes below.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {folders.map((folder) => {
                  const style = getSubjectStyle(folder.color);
                  const isSelected = folder.id === selectedFolder?.id;
                  const count = recordings.filter((r) => r.folderId === folder.id).length;

                  return (
                    <div
                      key={folder.id}
                      className={`group relative bg-white rounded-3xl p-5 transition-all hover:shadow-md ${
                        isSelected
                          ? 'border-2 border-indigo-300 shadow-sm ring-4 ring-indigo-50/70'
                          : 'border border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleSelectFolder(folder.id)}
                          className="flex items-center gap-3.5 text-left min-w-0 flex-1 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 rounded-2xl"
                        >
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${style.iconBg}`}
                          >
                            <FolderGlyph icon={folder.icon} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 truncate">
                              {folder.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 tabular-nums">
                              {count} {count === 1 ? 'note' : 'notes'} ·{' '}
                              {formatRelativeTime(folder.updatedAt)}
                            </p>
                          </div>
                        </button>
                      </div>

                      <p className="text-sm text-slate-500 mt-4 line-clamp-2 min-h-[2.5rem]">
                        {folder.description}
                      </p>

                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${style.dotClass}`} />
                          {isSelected ? 'Selected folder' : 'Click to open'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setModalTarget(folder);
                              setModalMode('rename');
                            }}
                            aria-label={`Rename ${folder.name}`}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModalTarget(folder);
                              setModalMode('delete');
                            }}
                            aria-label={`Delete ${folder.name}`}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Create new folder dashed card */}
                <button
                  type="button"
                  onClick={() => {
                    setModalTarget(null);
                    setModalMode('create');
                  }}
                  className="bg-white rounded-3xl border-2 border-slate-200 border-dashed p-6 flex flex-col items-center justify-center min-h-[188px] text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-current flex items-center justify-center mb-3">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold">Create new folder</span>
                </button>
              </div>
            </section>

            {/* Selected Folder Detail */}
            {selectedFolder && (
              <Card padding="lg" id="selected-folder">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        getSubjectStyle(selectedFolder.color).iconBg
                      }`}
                    >
                      <FolderGlyph icon={selectedFolder.icon} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-2xl font-bold text-slate-900">
                          {selectedFolder.name}
                        </h2>
                        <Badge variant="indigo">
                          {notesInSelectedFolder.length}{' '}
                          {notesInSelectedFolder.length === 1 ? 'note' : 'notes'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {selectedFolder.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setModalTarget(selectedFolder);
                        setModalMode('rename');
                      }}
                      icon={<Pencil className="w-3.5 h-3.5" />}
                    >
                      Rename
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setModalTarget(selectedFolder);
                        setModalMode('delete');
                      }}
                      icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="relative mb-6">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={folderNoteQuery}
                    onChange={(e) => setFolderNoteQuery(e.target.value)}
                    placeholder={`Search notes in ${selectedFolder.name}...`}
                    aria-label={`Search notes in ${selectedFolder.name}`}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                {notesInSelectedFolder.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                    <p className="text-sm font-bold text-slate-800">
                      {folderNoteQuery
                        ? `No notes in this folder match "${folderNoteQuery}".`
                        : 'This folder has no lecture notes yet.'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload a recording or start a new lecture session and assign it to{' '}
                      {selectedFolder.name}.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {notesInSelectedFolder.map((rec) => (
                      <NoteCard
                        key={rec.id}
                        recording={rec}
                        folderColor={selectedFolder.color}
                        onDelete={handleDeleteNote}
                      />
                    ))}
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>

      <FolderModal
        open={modalMode !== null}
        mode={modalMode}
        folder={modalTarget}
        onClose={() => setModalMode(null)}
        onCreate={handleCreate}
        onRename={handleRename}
        onDelete={handleDelete}
      />
    </div>
  );
}
