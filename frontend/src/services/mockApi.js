import { INITIAL_FOLDERS, INITIAL_RECORDINGS } from './mockData.js';

const STORAGE_KEYS = {
  folders: 'echonote_mock_folders_v1',
  recordings: 'echonote_mock_recordings_v1',
};

const STAGE_SEQUENCE = [
  { stage: 'uploaded', progress: 15, status: 'processing' },
  { stage: 'noise_reduction', progress: 40, status: 'processing' },
  { stage: 'transcription', progress: 68, status: 'processing' },
  { stage: 'generating_notes', progress: 90, status: 'processing' },
  { stage: 'done', progress: 100, status: 'done' },
];

// Tracks job tick counts in memory so polling advances smoothly
const jobTickMap = new Map();

function delay(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return structuredClone(fallback);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

function generateStudyArtifacts(title, subjectLabel) {
  return {
    suggestedQuestions: [
      `What are the core takeaways from "${title}"?`,
      'Which definitions are most likely to appear on an exam?',
      'Can you summarize the main example discussed in this lecture?',
    ],
    transcript: [
      {
        id: 'gen-1',
        speaker: 'Lecturer',
        timestamp: '00:00:42',
        text: `Welcome to today's session on ${title}. We will begin by establishing the core vocabulary and why this topic matters within ${subjectLabel}.`,
      },
      {
        id: 'gen-2',
        speaker: 'Lecturer',
        timestamp: '00:08:15',
        text: `Keep in mind the primary trade-offs and causal relationships we highlight here—these form the backbone of midterm short-answer problems.`,
      },
      {
        id: 'gen-3',
        speaker: 'Lecturer',
        timestamp: '00:16:30',
        text: `To wrap up, review the worked example and contrast the baseline approach against the optimized framework.`,
      },
    ],
    notes: {
      title,
      summary: `Structured study notes generated from "${title}" (${subjectLabel}), highlighting core principles, exam-ready definitions, and worked examples.`,
      keyPoints: [
        `Foundational framework and terminology introduced for ${title}.`,
        'Cause-and-effect relationships linking theory to practical problem solving.',
        'Comparison of baseline assumptions versus edge-case constraints.',
        'High-priority exam concepts emphasized during the final summary.',
      ],
      definitions: [
        {
          term: 'Core Principle',
          meaning: `The central mechanism governing how ${title} operates under standard conditions.`,
        },
        {
          term: 'Boundary Condition',
          meaning: 'The threshold or constraint where standard assumptions no longer hold.',
        },
      ],
      examples: [
        `Worked classroom scenario demonstrating ${title} step-by-step from input to outcome.`,
        'Common exam pitfall: confusing surface correlation with underlying mechanism.',
      ],
      revisionSheet: [
        `Review the primary definition and boundary conditions for ${title}.`,
        'Practice explaining the worked example in 3 concise bullet points without notes.',
        'Check how this lecture connects back to earlier foundational lessons in the same folder.',
      ],
    },
    cheatsheet: {
      sections: [
        {
          heading: 'Quick Reference',
          bullets: [
            `Topic: ${title}`,
            `Subject: ${subjectLabel}`,
            'Focus on mechanism → trade-off → real-world example',
          ],
        },
        {
          heading: 'Exam Checklist',
          bullets: [
            'Define key terms accurately',
            'State assumptions before applying formulas or models',
            'Compare edge cases clearly',
          ],
        },
      ],
    },
    mindmap: {
      topic: title,
      children: [
        {
          topic: 'Core Concepts',
          children: [
            { topic: 'Primary Mechanism' },
            { topic: 'Key Terminology' },
          ],
        },
        {
          topic: 'Applications',
          children: [
            { topic: 'Worked Example' },
            { topic: 'Edge Cases' },
          ],
        },
        {
          topic: 'Exam Prep',
          children: [
            { topic: 'High-Yield Takeaways' },
            { topic: 'Common Pitfalls' },
          ],
        },
      ],
    },
  };
}

function answerFromTranscript(recording, question) {
  const q = question.toLowerCase();
  const segments = recording.transcript || [];
  const notes = recording.notes;

  if (segments.length === 0 && !notes) {
    return 'This lecture does not have a completed transcript yet. Wait for processing to finish before asking questions.';
  }

  // Score transcript segments and note items by keyword overlap
  const keywords = q
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['what', 'how', 'why', 'when', 'does', 'the', 'and', 'for', 'with', 'from', 'this', 'that', 'which', 'are'].includes(w));

  let bestSegment = null;
  let bestScore = 0;

  for (const seg of segments) {
    const lower = seg.text.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestSegment = seg;
    }
  }

  if (bestSegment && bestScore > 0) {
    const matchedDef = notes?.definitions?.find((d) =>
      keywords.some(
        (kw) => d.term.toLowerCase().includes(kw) || d.meaning.toLowerCase().includes(kw)
      )
    );
    const extra = matchedDef ? `\n\nKey definition — ${matchedDef.term}: ${matchedDef.meaning}` : '';
    return `Based on the transcript at ${bestSegment.timestamp}: "${bestSegment.text}"${extra}`;
  }

  if (q.includes('summary') || q.includes('takeaway') || q.includes('main')) {
    const pts = (notes?.keyPoints || []).slice(0, 3).map((p) => `• ${p}`).join('\n');
    return `${notes?.summary || ''}${pts ? `\n\nKey points:\n${pts}` : ''}`;
  }

  if (q.includes('exam') || q.includes('definition') || q.includes('revision')) {
    const defs = (notes?.definitions || [])
      .slice(0, 2)
      .map((d) => `• ${d.term}: ${d.meaning}`)
      .join('\n');
    return defs
      ? `From the lecture notes:\n${defs}`
      : `Revision highlight: ${(notes?.revisionSheet || [])[0] || notes?.summary}`;
  }

  if (segments.length > 0) {
    return `I checked the transcript for "${recording.title}", and the closest discussion is at ${segments[0].timestamp}: "${segments[0].text}" If your question covers a topic outside this recording, it is not mentioned in the lecture transcript.`;
  }

  return `Based on the generated notes for "${recording.title}": ${notes?.summary || 'No matching details found in the transcript.'}`;
}

export const mockApi = {
  async getFolders() {
    await delay(180);
    const folders = readStorage(STORAGE_KEYS.folders, INITIAL_FOLDERS);
    const recordings = readStorage(STORAGE_KEYS.recordings, INITIAL_RECORDINGS);
    return folders.map((f) => ({
      ...f,
      noteCount: recordings.filter((r) => r.folderId === f.id).length,
    }));
  },

  async createFolder({ name, description = '', color = 'indigo' }) {
    await delay(200);
    const folders = readStorage(STORAGE_KEYS.folders, INITIAL_FOLDERS);
    const icons = {
      blue: 'code',
      rose: 'brain',
      amber: 'landmark',
      indigo: 'book',
      emerald: 'atom',
      violet: 'folder',
    };
    const created = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || `Lecture notes and recordings for ${name.trim()}.`,
      color,
      icon: icons[color] || 'folder',
      updatedAt: new Date().toISOString(),
      noteCount: 0,
    };
    const next = [created, ...folders];
    writeStorage(STORAGE_KEYS.folders, next);
    return created;
  },

  async updateFolder(id, updates) {
    await delay(180);
    const folders = readStorage(STORAGE_KEYS.folders, INITIAL_FOLDERS);
    let updatedFolder = null;
    const next = folders.map((f) => {
      if (f.id !== id) return f;
      updatedFolder = {
        ...f,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return updatedFolder;
    });
    if (!updatedFolder) throw new Error('Folder not found.');
    writeStorage(STORAGE_KEYS.folders, next);
    return updatedFolder;
  },

  async deleteFolder(id) {
    await delay(180);
    const folders = readStorage(STORAGE_KEYS.folders, INITIAL_FOLDERS);
    const nextFolders = folders.filter((f) => f.id !== id);
    writeStorage(STORAGE_KEYS.folders, nextFolders);

    // Notes remain available in All Notes (unassigned folderId)
    const recordings = readStorage(STORAGE_KEYS.recordings, INITIAL_RECORDINGS);
    const nextRecordings = recordings.map((r) =>
      r.folderId === id ? { ...r, folderId: 'unassigned', subjectLabel: 'General' } : r
    );
    writeStorage(STORAGE_KEYS.recordings, nextRecordings);
    return { deleted: true };
  },

  async getRecordings() {
    await delay(220);
    return readStorage(STORAGE_KEYS.recordings, INITIAL_RECORDINGS);
  },

  async getRecordingById(id) {
    await delay(180);
    const recordings = readStorage(STORAGE_KEYS.recordings, INITIAL_RECORDINGS);
    const found = recordings.find((r) => r.id === id);
    if (!found) throw new Error('Lecture recording not found.');
    return found;
  },

  async createRecording({ title, folderId, durationSeconds = 960, source = 'uploaded' }) {
    await delay(320);
    const folders = readStorage(STORAGE_KEYS.folders, INITIAL_FOLDERS);
    const folder = folders.find((f) => f.id === folderId);
    const recordings = readStorage(STORAGE_KEYS.recordings, INITIAL_RECORDINGS);

    const id = `rec-${Date.now()}`;
    const jobId = `job-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newRec = {
      id,
      jobId,
      title: title.trim(),
      folderId: folder?.id || folderId || 'cs101',
      subjectLabel: folder?.name || 'General',
      lecturer: 'Course Lecture',
      source,
      status: 'processing',
      progress: 15,
      stage: 'uploaded',
      durationSeconds: Math.max(30, Math.round(durationSeconds)),
      createdAt: nowIso,
      updatedAt: nowIso,
      transcript: [],
      notes: null,
      cheatsheet: null,
      mindmap: null,
    };

    jobTickMap.set(jobId, 0);
    writeStorage(STORAGE_KEYS.recordings, [newRec, ...recordings]);
    return { recordingId: id, jobId };
  },

  async getJobStatus(jobId) {
    await delay(200);
    const recordings = readStorage(STORAGE_KEYS.recordings, INITIAL_RECORDINGS);
    const idx = recordings.findIndex((r) => r.jobId === jobId);
    if (idx === -1) {
      throw new Error('Processing job not found.');
    }

    const rec = recordings[idx];
    if (rec.status === 'done') {
      return {
        jobId,
        recordingId: rec.id,
        status: 'done',
        stage: 'done',
        progress: 100,
      };
    }

    if (rec.status === 'failed') {
      return {
        jobId,
        recordingId: rec.id,
        status: 'failed',
        stage: 'failed',
        progress: rec.progress || 38,
        error: rec.error || 'Processing failed during audio cleanup.',
      };
    }

    // Advance stage cleanly on each poll
    const currentStageIdx = STAGE_SEQUENCE.findIndex((s) => s.stage === rec.stage);
    const ticks = (jobTickMap.get(jobId) ?? 0) + 1;
    jobTickMap.set(jobId, ticks);

    const nextStageIdx = Math.min(
      STAGE_SEQUENCE.length - 1,
      Math.max(0, currentStageIdx === -1 ? 0 : currentStageIdx + 1)
    );
    const nextStep = STAGE_SEQUENCE[nextStageIdx];

    const updatedRec = {
      ...rec,
      stage: nextStep.stage,
      progress: nextStep.progress,
      status: nextStep.status,
      updatedAt: new Date().toISOString(),
    };

    if (nextStep.status === 'done' && !updatedRec.notes) {
      const artifacts = generateStudyArtifacts(updatedRec.title, updatedRec.subjectLabel);
      updatedRec.transcript = artifacts.transcript;
      updatedRec.notes = artifacts.notes;
      updatedRec.cheatsheet = artifacts.cheatsheet;
      updatedRec.mindmap = artifacts.mindmap;
      updatedRec.suggestedQuestions = artifacts.suggestedQuestions;
    }

    recordings[idx] = updatedRec;
    writeStorage(STORAGE_KEYS.recordings, recordings);

    return {
      jobId,
      recordingId: updatedRec.id,
      status: updatedRec.status,
      stage: updatedRec.stage,
      progress: updatedRec.progress,
    };
  },

  async retryJob(jobId) {
    await delay(240);
    const recordings = readStorage(STORAGE_KEYS.recordings, INITIAL_RECORDINGS);
    const idx = recordings.findIndex((r) => r.jobId === jobId);
    if (idx === -1) throw new Error('Job not found.');

    recordings[idx] = {
      ...recordings[idx],
      status: 'processing',
      stage: 'uploaded',
      progress: 15,
      error: undefined,
      updatedAt: new Date().toISOString(),
    };
    jobTickMap.set(jobId, 0);
    writeStorage(STORAGE_KEYS.recordings, recordings);

    return {
      jobId,
      recordingId: recordings[idx].id,
      status: 'processing',
      stage: 'uploaded',
      progress: 15,
    };
  },

  async updateRecording(id, updates) {
    await delay(180);
    const recordings = readStorage(STORAGE_KEYS.recordings, INITIAL_RECORDINGS);
    let updated = null;
    const next = recordings.map((r) => {
      if (r.id !== id) return r;
      updated = { ...r, ...updates, updatedAt: new Date().toISOString() };
      return updated;
    });
    if (!updated) throw new Error('Note not found.');
    writeStorage(STORAGE_KEYS.recordings, next);
    return updated;
  },

  async deleteRecording(id) {
    await delay(180);
    const recordings = readStorage(STORAGE_KEYS.recordings, INITIAL_RECORDINGS);
    const next = recordings.filter((r) => r.id !== id);
    writeStorage(STORAGE_KEYS.recordings, next);
    return { deleted: true };
  },

  async askLectureQuestion(recordingId, question) {
    await delay(550);
    if (!question || !question.trim()) {
      throw new Error('Please enter a question about this lecture.');
    }
    const recordings = readStorage(STORAGE_KEYS.recordings, INITIAL_RECORDINGS);
    const rec = recordings.find((r) => r.id === recordingId);
    if (!rec) throw new Error('Lecture not found.');

    const answer = answerFromTranscript(rec, question.trim());
    return { answer };
  },
};
