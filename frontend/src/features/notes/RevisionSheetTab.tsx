import React, { useState } from 'react';
import { BookmarkCheck, CheckSquare, Square } from 'lucide-react';
import type { StructuredNotes } from '../../types/echonote';
import { Card } from '../../components/ui/Card';

export function RevisionSheetTab({ notes }: { notes: StructuredNotes }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (idx: number) => {
    setChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = notes.revisionSheet.filter((_, i) => checked[i]).length;

  return (
    <div className="space-y-6">
      <Card highlighted padding="lg" className="bg-indigo-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
              <BookmarkCheck className="w-4 h-4" />
              Last-Minute Exam Revision Sheet
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              High-Yield Takeaways
            </h3>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1.5 rounded-xl tabular-nums self-start sm:self-auto">
            {completedCount} / {notes.revisionSheet.length} reviewed
          </span>
        </div>

        <div className="space-y-3">
          {notes.revisionSheet.map((item, idx) => {
            const isDone = Boolean(checked[idx]);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggle(idx)}
                className={`w-full text-left flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                  isDone
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-600'
                    : 'bg-white border-indigo-100 hover:border-indigo-300 text-slate-800 shadow-sm'
                }`}
              >
                {isDone ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                )}
                <span className={`text-sm leading-6 font-medium ${isDone ? 'line-through opacity-80' : ''}`}>
                  {item}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {notes.definitions.length > 0 && (
        <Card padding="lg">
          <h4 className="text-base font-bold text-slate-900 mb-3">
            Quick Glossary Recall
          </h4>
          <dl className="divide-y divide-slate-100">
            {notes.definitions.map((d, i) => (
              <div key={i} className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <dt className="font-bold text-slate-900">{d.term}</dt>
                <dd className="sm:col-span-2 text-slate-600">{d.meaning}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}
    </div>
  );
}
