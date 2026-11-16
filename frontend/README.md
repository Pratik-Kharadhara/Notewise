# EchoNote — Lecture Recording & AI Study Notes Frontend

EchoNote helps students record or upload classroom lectures and turn them into exam-ready study materials: structured notes, a high-yield revision sheet, a quick-reference cheatsheet, an interactive concept mindmap, transcript-grounded Q&A, and PDF exports.

## Tech Stack

- **Framework:** React 19 + Vite
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4 (`Plus Jakarta Sans` & `JetBrains Mono`)
- **Icons:** `lucide-react`
- **Mindmap:** `markmap-lib` + `markmap-view`
- **PDF Export:** `jspdf` + `html2canvas` (plus `@media print` support)
- **Audio Capture:** Browser `MediaRecorder` + Web Audio API `AnalyserNode`

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment variables:**
   Copy `.env.example` to `.env` (optional — defaults to standalone mock mode):
   ```env
   VITE_USE_MOCK="true"
   VITE_API_BASE_URL="http://localhost:5000"
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.
4. **Run unit tests & typecheck:**
   ```bash
   npx tsx --test src/utils/echonote.test.ts
   npm run lint
   npm run build
   ```

## Switching from Mock Mode to the Real Backend API

The frontend switches cleanly between `src/services/mockApi.js` and `src/services/api.js` inside `src/services/index.js` without changing any component code:

- **Mock Mode (default):** `VITE_USE_MOCK="true"` (or unset). Uses `localStorage`-persisted seed data across 3 subjects and 7 lectures covering `done`, `processing`, and `failed` states.
- **Real Backend Mode:** Set `VITE_USE_MOCK="false"` and `VITE_API_BASE_URL="http://localhost:5000"` (or your deployed Express API URL) in `.env` and restart Vite.

## Project Structure

```text
src/
├── components/
│   ├── layout/          # AppLayout, Sidebar (w-64 + mobile drawer), Header (h-16)
│   └── ui/              # Button, Card, Badge, Modal, Input/Select, Tabs, Skeleton, Toast, ProgressBar, Avatar
├── context/             # AuthContext (optional login/guest), ToastContext
├── features/
│   ├── folders/         # FolderModal (create, rename, delete)
│   ├── notes/           # NoteCard, NotesTabContent, RevisionSheetTab, CheatsheetTab, MindmapTab, LectureQaTab, TranscriptTab, PdfPrintableSheet
│   └── recording/       # LiveWaveform
├── hooks/               # usePollJob (2.4s polling + exponential backoff), useAudioRecorder (MediaRecorder + Web Audio)
├── pages/               # DashboardPage, RecordPage, UploadPage, ProcessingPage, NotesLibraryPage, FoldersPage, NoteDetailPage, AuthPage
├── services/            # api.js (real Express calls), mockApi.js (standalone simulation), mockData.js, index.js
├── types/               # Shared TypeScript interfaces matching backend JSON shapes
└── utils/               # audioValidation, notesFilters, mindmapFormat, pdfExport, echonote.test.ts
```

## Demo Walkthrough for External Examiners

1. **Dashboard (`/`):** Review the Record/Upload hero card, Recent Folders panel, Recent Activity tab filters (`All Notes`, `Recordings`, `Transcripts`), and the active study spotlight.
2. **Upload & Pipeline Polling (`/upload` → `/processing/:jobId`):** Drop or choose an `.mp3`, `.wav`, `.m4a`, or `.webm` audio file (try uploading a `.pdf` first to see format validation). Submit to enter `/processing/:jobId`, where `usePollJob` polls `Uploaded → Noise Reduction → Whisper Transcription → Generating Study Notes → Ready`.
3. **Failed Job Recovery:** From All Notes (`/notes`), open *"Processes, Threads & CPU Scheduling (Corrupted Mic File)"* and click **Retry Processing** to re-queue and complete the job.
4. **Notes Detail & Study Tools (`/notes/:id`):** Open *"Algorithm Complexity & Big O Notation"* and explore all 6 tabs:
   - **Notes:** Executive summary, numbered key points, definition cards, and worked examples.
   - **Revision Sheet:** Interactive self-check list for last-minute exam prep.
   - **Cheatsheet:** Compact two-column formula & concept cards.
   - **Mindmap:** Interactive `markmap` SVG tree with zoom, pan, collapse/expand, and accessible Outline toggle.
   - **Ask the Lecture:** Transcript-grounded Q&A chat with suggested prompts.
   - **Transcript:** Searchable timestamped speaker transcript.
   - Click **Export PDF** to download a multi-page A4 exam study sheet.
5. **Folders & Library (`/folders`, `/notes`):** Create, rename, and delete subject folders, toggle Grid/List views, and search across titles and transcripts.
