import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Library,
  Mic,
  UploadCloud,
  Search,
  LayoutGrid,
  List,
  SearchX,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/index.js';
import type { Folder, FolderColor, Recording } from '../types/echonote';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { NoteCardSkeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { NoteCard } from '../features/notes/NoteCard';
import { useToast } from '../context/ToastContext';
import {
  filterAndSortNotes,
  type DateFilterOption,
  type SortOption,
} from '../utils/notesFilters';

export function NotesLibraryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [folderId, setFolderId] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const [renameTarget, setRenameTarget] = useState<Recording | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);

  // Sync URL ?q= when user searches from the top Header
  useEffect(() => {
    const paramQ = searchParams.get('q') || '';
    setQuery(paramQ);
  }, [searchParams]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recs, flds] = await Promise.all([api.getRecordings(), api.getFolders()]);
      setRecordings(recs);
      setFolders(flds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load lecture library.');
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

  const filteredNotes = useMemo(
    () =>
      filterAndSortNotes(recordings, {
        query,
        folderId,
        dateFilter,
        sortBy,
      }),
    [recordings, query, folderId, dateFilter, sortBy]
  );

  const handleClearFilters = () => {
    setQuery('');
    setFolderId('all');
    setDateFilter('all');
    setSortBy('recent');
    if (searchParams.has('q')) {
      setSearchParams({});
    }
  };

  const handleDelete = async (rec: Recording) => {
    try {
      await api.deleteRecording(rec.id);
      setRecordings((prev) => prev.filter((r) => r.id !== rec.id));
      showToast(`Deleted "${rec.title}".`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete note.', 'error');
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
      showToast('Note renamed.', 'success');
      setRenameTarget(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Rename failed.', 'error');
    } finally {
      setRenameSaving(false);
    }
  };

  return (
    <div className="p-5 md:p-8">
      <div className="max-w-6xl mx-auto space-y-7">
        {/* Header */}
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-2">
              <Library className="w-4 h-4" />
              Study library
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">All Notes</h1>
            <p className="text-slate-500 mt-1.5">
              Search, filter, and revisit every lecture transcript, summary, and mindmap.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/record')}
              icon={<Mic className="w-4 h-4" />}
            >
              Record Session
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/upload')}
              icon={<UploadCloud className="w-4 h-4" />}
            >
              Upload
            </Button>
          </div>
        </section>

        {/* Filter bar */}
        <Card padding="sm" className="p-5">
          <div className="flex flex-col xl:flex-row gap-4 xl:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes, topics, or transcript text..."
                aria-label="Search notes, topics, or transcript text"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                aria-label="Filter by folder"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="px-3.5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:border-indigo-300"
              >
                <option value="all">All folders</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilterOption)}
                className="px-3.5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:border-indigo-300"
              >
                <option value="all">Any date</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>

              <select
                aria-label="Sort notes"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3.5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:border-indigo-300"
              >
                <option value="recent">Recently modified</option>
                <option value="title">Title A–Z</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              <span className="font-bold text-slate-900 tabular-nums">
                {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
              </span>{' '}
              across {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Clear filters
              </button>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  aria-label="Grid view"
                  aria-pressed={layout === 'grid'}
                  onClick={() => setLayout('grid')}
                  className={`p-2 rounded-md transition-colors cursor-pointer ${
                    layout === 'grid'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={layout === 'list'}
                  onClick={() => setLayout('list')}
                  className={`p-2 rounded-md transition-colors cursor-pointer ${
                    layout === 'list'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
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
            <NoteCardSkeleton />
            <NoteCardSkeleton />
            <NoteCardSkeleton />
          </div>
        ) : filteredNotes.length === 0 ? (
          <Card
            padding="lg"
            className="border-dashed border-slate-300 text-center py-14"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <SearchX className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-5">No notes found</h2>
            <p className="text-sm text-slate-500 mt-2">
              Try a different search term or clear your active filters.
            </p>
            <Button onClick={handleClearFilters} className="mt-5">
              Clear filters
            </Button>
          </Card>
        ) : (
          <section
            aria-label="Notes collection"
            className={
              layout === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                : 'grid grid-cols-1 gap-3'
            }
          >
            {filteredNotes.map((rec) => (
              <NoteCard
                key={rec.id}
                recording={rec}
                folderColor={folderColorMap[rec.folderId] || 'indigo'}
                layout={layout}
                onDelete={handleDelete}
                onRename={(target) => {
                  setRenameTarget(target);
                  setRenameTitle(target.title);
                }}
              />
            ))}
          </section>
        )}
      </div>

      <Modal
        open={Boolean(renameTarget)}
        onClose={() => setRenameTarget(null)}
        title="Rename lecture note"
        description="Update the display title for this note."
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
