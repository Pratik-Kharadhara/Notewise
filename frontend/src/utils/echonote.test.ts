import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAudioFile,
  formatDurationClock,
  formatDurationLabel,
  getInitials,
  MAX_AUDIO_SIZE_BYTES,
} from './audioValidation';
import { filterAndSortNotes, filterActivityByTab } from './notesFilters';
import { mindmapJsonToMarkdown, countMindmapNodes } from './mindmapFormat';
import type { Recording } from '../types/echonote';

test('validateAudioFile accepts valid mp3, wav, m4a, and webm files', () => {
  assert.equal(validateAudioFile({ name: 'lecture1.mp3', size: 1024 * 500, type: 'audio/mpeg' }).valid, true);
  assert.equal(validateAudioFile({ name: 'seminar.wav', size: 2048, type: 'audio/wav' }).valid, true);
  assert.equal(validateAudioFile({ name: 'lab.M4A', size: 4096, type: 'audio/m4a' }).valid, true);
  assert.equal(validateAudioFile({ name: 'mic.webm', size: 4096, type: 'audio/webm' }).valid, true);
});

test('validateAudioFile rejects invalid formats, empty files, and oversized files', () => {
  const missing = validateAudioFile(null);
  assert.equal(missing.valid, false);

  const pdf = validateAudioFile({ name: 'slides.pdf', size: 5000, type: 'application/pdf' });
  assert.equal(pdf.valid, false);
  assert.match(pdf.error || '', /Unsupported format/);

  const empty = validateAudioFile({ name: 'empty.mp3', size: 0, type: 'audio/mpeg' });
  assert.equal(empty.valid, false);

  const tooBig = validateAudioFile({
    name: 'huge.wav',
    size: MAX_AUDIO_SIZE_BYTES + 1,
    type: 'audio/wav',
  });
  assert.equal(tooBig.valid, false);
  assert.match(tooBig.error || '', /size limit/);
});

test('formatDurationClock and getInitials behave deterministically', () => {
  assert.equal(formatDurationClock(872), '00:14:32');
  assert.equal(formatDurationClock(3661), '01:01:01');
  assert.equal(formatDurationLabel(2520), '42 min');
  assert.equal(getInitials('Aarav Sharma'), 'AS');
  assert.equal(getInitials('Priya'), 'PR');
});

const SAMPLE_RECORDINGS: Recording[] = [
  {
    id: 'rec-1',
    jobId: 'job-1',
    title: 'Big O Notation',
    folderId: 'cs101',
    subjectLabel: 'Computer Science',
    lecturer: 'Prof. Mehta',
    source: 'recorded',
    status: 'done',
    progress: 100,
    stage: 'done',
    durationSeconds: 1800,
    createdAt: '2026-11-15T09:00:00Z',
    updatedAt: '2026-11-15T10:00:00Z',
    transcript: [{ id: 't1', speaker: 'Prof. Mehta', timestamp: '00:01', text: 'Asymptotic complexity' }],
    notes: {
      title: 'Big O Notation',
      summary: 'Time and space complexity basics.',
      keyPoints: ['O(1) constant time'],
      definitions: [],
      examples: [],
      revisionSheet: [],
    },
    cheatsheet: null,
    mindmap: null,
  },
  {
    id: 'rec-2',
    jobId: 'job-2',
    title: 'Cognitive Development',
    folderId: 'psych',
    subjectLabel: 'Psychology',
    lecturer: 'Dr. Nair',
    source: 'uploaded',
    status: 'processing',
    progress: 60,
    stage: 'transcription',
    durationSeconds: 2100,
    createdAt: '2026-11-10T09:00:00Z',
    updatedAt: '2026-11-10T10:00:00Z',
    transcript: [],
    notes: null,
    cheatsheet: null,
    mindmap: null,
  },
];

test('filterAndSortNotes filters by query, folder, date, and sorts properly', () => {
  const nowMs = new Date('2026-11-15T12:00:00Z').getTime();

  const byFolder = filterAndSortNotes(SAMPLE_RECORDINGS, {
    query: '',
    folderId: 'cs101',
    dateFilter: 'all',
    sortBy: 'recent',
    nowMs,
  });
  assert.equal(byFolder.length, 1);
  assert.equal(byFolder[0].id, 'rec-1');

  const byTranscriptQuery = filterAndSortNotes(SAMPLE_RECORDINGS, {
    query: 'asymptotic',
    folderId: 'all',
    dateFilter: 'all',
    sortBy: 'recent',
    nowMs,
  });
  assert.equal(byTranscriptQuery.length, 1);
  assert.equal(byTranscriptQuery[0].id, 'rec-1');

  const todayOnly = filterAndSortNotes(SAMPLE_RECORDINGS, {
    query: '',
    folderId: 'all',
    dateFilter: 'today',
    sortBy: 'recent',
    nowMs,
  });
  assert.equal(todayOnly.length, 1);
  assert.equal(todayOnly[0].id, 'rec-1');

  const sortedByTitle = filterAndSortNotes(SAMPLE_RECORDINGS, {
    query: '',
    folderId: 'all',
    dateFilter: 'all',
    sortBy: 'title',
    nowMs,
  });
  assert.equal(sortedByTitle[0].title, 'Big O Notation');

  assert.equal(filterActivityByTab(SAMPLE_RECORDINGS, 'transcripts').length, 1);
});

test('mindmapJsonToMarkdown builds hierarchical markdown and counts nodes', () => {
  const tree = {
    topic: 'Memory Management',
    children: [
      {
        topic: 'Paging',
        children: [{ topic: 'Page Table' }, { topic: 'TLB' }],
      },
      { topic: 'Segmentation' },
    ],
  };

  const md = mindmapJsonToMarkdown(tree);
  assert.match(md, /^# Memory Management/m);
  assert.match(md, /^## Paging/m);
  assert.match(md, /^### Page Table/m);
  assert.equal(countMindmapNodes(tree), 5);
});
