import React, { useMemo, useState } from 'react';
import { Search, MessageSquareText } from 'lucide-react';
import type { TranscriptSegment } from '../../types/echonote';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';

export function TranscriptTab({ segments }: { segments: TranscriptSegment[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return segments;
    return segments.filter(
      (s) => s.text.toLowerCase().includes(q) || s.speaker.toLowerCase().includes(q)
    );
  }, [segments, query]);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <MessageSquareText className="w-4 h-4 text-indigo-600" />
          <span>Full Whisper Transcript ({segments.length} segments)</span>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter transcript..."
            aria-label="Filter transcript"
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="p-6 space-y-5 max-h-[540px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            No transcript lines match "{query}".
          </p>
        ) : (
          filtered.map((seg) => (
            <div key={seg.id} className="flex gap-3.5">
              <Avatar name={seg.speaker} size="md" tone="slate" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-slate-900">{seg.speaker}</p>
                  <span className="text-[11px] font-mono tabular-nums text-slate-400">
                    {seg.timestamp}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-600">{seg.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
