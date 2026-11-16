import type { Recording } from '../types/echonote';

export type DateFilterOption = 'all' | 'today' | 'week' | 'month';
export type SortOption = 'recent' | 'title' | 'oldest';
export type ActivityTabFilter = 'all' | 'recordings' | 'transcripts';

export interface NotesFilterCriteria {
  query: string;
  folderId: string;
  dateFilter: DateFilterOption;
  sortBy: SortOption;
  nowMs?: number;
}

/**
 * Pure search, folder, date-range, and sort filter for lecture notes.
 */
export function filterAndSortNotes(
  recordings: Recording[],
  criteria: NotesFilterCriteria
): Recording[] {
  const query = criteria.query.trim().toLowerCase();
  const nowMs = criteria.nowMs ?? Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const filtered = recordings.filter((rec) => {
    if (criteria.folderId !== 'all' && rec.folderId !== criteria.folderId) {
      return false;
    }

    if (criteria.dateFilter !== 'all') {
      const updatedMs = new Date(rec.updatedAt).getTime();
      if (Number.isNaN(updatedMs)) return false;
      const ageMs = nowMs - updatedMs;
      if (criteria.dateFilter === 'today' && ageMs > dayMs) return false;
      if (criteria.dateFilter === 'week' && ageMs > 7 * dayMs) return false;
      if (criteria.dateFilter === 'month' && ageMs > 30 * dayMs) return false;
    }

    if (query) {
      const haystack = [
        rec.title,
        rec.subjectLabel,
        rec.lecturer,
        rec.notes?.summary || '',
        ...(rec.notes?.keyPoints || []),
        ...rec.transcript.map((seg) => seg.text),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }

    return true;
  });

  const sorted = [...filtered];
  if (criteria.sortBy === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (criteria.sortBy === 'oldest') {
    sorted.sort(
      (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
  } else {
    sorted.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  return sorted;
}

/**
 * Filters dashboard recent activity by tab ("All Notes", "Recordings", "Transcripts").
 */
export function filterActivityByTab(
  recordings: Recording[],
  tab: ActivityTabFilter
): Recording[] {
  if (tab === 'recordings') {
    return recordings.filter((r) => r.source === 'recorded' || r.status === 'processing');
  }
  if (tab === 'transcripts') {
    return recordings.filter((r) => r.status === 'done' && r.transcript.length > 0);
  }
  return recordings;
}
