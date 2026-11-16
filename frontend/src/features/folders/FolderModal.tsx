import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { Folder, FolderColor } from '../../types/echonote';

export type FolderModalMode = 'create' | 'rename' | 'delete' | null;

interface FolderModalProps {
  open: boolean;
  mode: FolderModalMode;
  folder: Folder | null;
  onClose: () => void;
  onCreate: (data: { name: string; description: string; color: FolderColor }) => Promise<void>;
  onRename: (id: string, name: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const COLOR_OPTIONS: { value: FolderColor; label: string; dot: string }[] = [
  { value: 'blue', label: 'Blue', dot: 'bg-blue-500' },
  { value: 'rose', label: 'Rose', dot: 'bg-rose-500' },
  { value: 'amber', label: 'Amber', dot: 'bg-amber-500' },
  { value: 'indigo', label: 'Indigo', dot: 'bg-indigo-600' },
  { value: 'emerald', label: 'Emerald', dot: 'bg-emerald-500' },
  { value: 'violet', label: 'Violet', dot: 'bg-violet-500' },
];

export function FolderModal({
  open,
  mode,
  folder,
  onClose,
  onCreate,
  onRename,
  onDelete,
}: FolderModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<FolderColor>('indigo');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setSubmitting(false);
    if (mode === 'create') {
      setName('');
      setDescription('');
      setColor('indigo');
    } else if (mode === 'rename' && folder) {
      setName(folder.name);
      setDescription(folder.description || '');
      setColor(folder.color);
    }
  }, [open, mode, folder]);

  const title =
    mode === 'create'
      ? 'Create new folder'
      : mode === 'rename'
        ? 'Rename folder'
        : 'Delete folder?';

  const subtitle =
    mode === 'create'
      ? 'Organize your lecture notes and recordings by subject.'
      : mode === 'rename'
        ? 'Update the folder name without changing its notes.'
        : 'This action cannot be undone.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'delete' && folder) {
      setSubmitting(true);
      try {
        await onDelete(folder.id);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to delete folder.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!name.trim()) {
      setError('Please enter a folder name.');
      return;
    }
    if (name.trim().length < 2) {
      setError('Folder name must be at least 2 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'create') {
        await onCreate({ name: name.trim(), description: description.trim(), color });
      } else if (mode === 'rename' && folder) {
        await onRename(folder.id, name.trim(), description.trim());
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save folder.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} description={subtitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'delete' ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-sm text-rose-800 leading-relaxed">
            Deleting <strong>{folder?.name}</strong> removes the folder, while your
            existing lecture notes remain safely accessible in <strong>All Notes</strong>.
          </div>
        ) : (
          <>
            <Input
              label="Folder name"
              placeholder="e.g. Biology 2026"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              error={error}
              autoFocus
            />

            <div>
              <label
                htmlFor="folder-description"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Description (optional)
              </label>
              <textarea
                id="folder-description"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Topics, professor, or semester..."
                className="w-full resize-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {mode === 'create' && (
              <div>
                <p className="block text-sm font-semibold text-slate-700 mb-2">
                  Subject color
                </p>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setColor(opt.value)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        color === opt.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${opt.dot}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {mode === 'delete' && error && (
          <p className="text-xs font-medium text-rose-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={mode === 'delete' ? 'danger' : 'primary'}
            loading={submitting}
          >
            {mode === 'create'
              ? 'Create folder'
              : mode === 'rename'
                ? 'Save changes'
                : 'Delete folder'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
