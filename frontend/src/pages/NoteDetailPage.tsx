import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  Download,
  BookOpen,
  BookmarkCheck,
  Layers,
  Network,
  MessageCircleQuestion,
  MessageSquareText,
  Clock,
  AlertCircle,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { api } from '../services/index.js';
import type { Recording, StructuredNotes } from '../types/echonote';
import { normalizeNotes } from '../utils/normalizeNotes';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, type TabOption } from '../components/ui/Tabs';
import { Skeleton } from '../components/ui/Skeleton';
import { NotesTabContent } from '../features/notes/NotesTabContent';
import { RevisionSheetTab } from '../features/notes/RevisionSheetTab';
import { CheatsheetTab } from '../features/notes/CheatsheetTab';
import { MindmapTab } from '../features/notes/MindmapTab';
import { LectureQaTab } from '../features/notes/LectureQaTab';
import { TranscriptTab } from '../features/notes/TranscriptTab';
import { PdfPrintableSheet } from '../features/notes/PdfPrintableSheet';
import { exportElementToPdf } from '../utils/pdfExport';
import { formatDurationLabel, formatRelativeTime } from '../utils/audioValidation';

type DetailTabId =
  | 'notes'
  | 'revision'
  | 'cheatsheet'
  | 'mindmap'
  | 'qa'
  | 'transcript';

const DETAIL_TABS: TabOption<DetailTabId>[] = [
  { id: 'notes', label: 'Notes', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'revision', label: 'Revision Sheet', icon: <BookmarkCheck className="w-4 h-4" /> },
  { id: 'cheatsheet', label: 'Cheatsheet', icon: <Layers className="w-4 h-4" /> },
  { id: 'mindmap', label: 'Mindmap', icon: <Network className="w-4 h-4" /> },
  { id: 'qa', label: 'Ask the Lecture', icon: <MessageCircleQuestion className="w-4 h-4" /> },
  { id: 'transcript', label: 'Transcript', icon: <MessageSquareText className="w-4 h-4" /> },
];

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTabId>('notes');
  const [exporting, setExporting] = useState(false);

  const printableRef = useRef<HTMLDivElement | null>(null);

  const loadNote = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const rec = await api.getRecordingById(id);
      // Normalize snake_case → camelCase note fields from backend
      if (rec?.notes) {
        rec.notes = normalizeNotes(rec.notes);
      }
      setRecording(rec);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load lecture note.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const handleExportPdf = useCallback(async () => {
    if (!recording?.notes || !printableRef.current) return;
    setExporting(true);
    try {
      await exportElementToPdf(printableRef.current, recording.title);
      showToast('PDF study sheet downloaded.', 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'PDF export failed. Try Print instead.',
        'error'
      );
    } finally {
      setExporting(false);
    }
  }, [recording, showToast]);

  useEffect(() => {
    if (searchParams.get('export') === '1' && recording?.notes && !exporting) {
      // Clear query trigger after opening
      navigate(`/notes/${recording.id}`, { replace: true });
      handleExportPdf();
    }
  }, [searchParams, recording, exporting, navigate, handleExportPdf]);

  if (loading) {
    return (
      <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-28 w-full rounded-3xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !recording) {
    return (
      <div className="p-5 md:p-8 max-w-3xl mx-auto">
        <Card padding="lg" className="text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-slate-900">Lecture note not found</h1>
          <p className="text-sm text-slate-500 mt-1">
            {error || 'This recording may have been deleted.'}
          </p>
          <Button onClick={() => navigate('/notes')} className="mt-5">
            Back to All Notes
          </Button>
        </Card>
      </div>
    );
  }

  if (recording.status !== 'done' || !recording.notes) {
    return (
      <div className="p-5 md:p-8 max-w-3xl mx-auto">
        <Card highlighted padding="lg" className="text-center space-y-4">
          <Badge variant={recording.status === 'failed' ? 'failed' : 'processing'}>
            {recording.status === 'failed' ? 'Processing Failed' : 'Processing in Progress'}
          </Badge>
          <h1 className="text-2xl font-bold text-slate-900">{recording.title}</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {recording.status === 'failed'
              ? recording.error || 'This audio job encountered an error during processing.'
              : 'Study notes, cheatsheets, and mindmaps will appear here as soon as the pipeline finishes.'}
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button
              onClick={() => navigate(`/processing/${recording.jobId}`)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {recording.status === 'failed' ? 'Open & Retry Job' : 'View Pipeline Status'}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/notes')}>
              All Notes
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 no-print">
          <Link to="/" className="hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/notes" className="hover:text-indigo-600 transition-colors">
            All Notes
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-700 font-medium truncate">{recording.title}</span>
        </nav>

        {/* Lecture Header */}
        <Card padding="lg" className="no-print">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <Badge variant="indigo">{recording.subjectLabel}</Badge>
                <Badge variant="transcribed">Transcribed</Badge>
                <Badge variant="ai">AI Generated</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                {recording.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-2">
                <span>{recording.lecturer}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {formatDurationLabel(recording.durationSeconds)}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {formatRelativeTime(recording.updatedAt)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                variant="secondary"
                onClick={() => window.print()}
                icon={<Printer className="w-4 h-4" />}
              >
                Print
              </Button>
              <Button
                onClick={handleExportPdf}
                loading={exporting}
                icon={<Download className="w-4 h-4" />}
              >
                Export PDF
              </Button>
            </div>
          </div>
        </Card>

        {/* 6 Study Tabs */}
        <div className="no-print">
          <Tabs
            tabs={DETAIL_TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            ariaLabel="Study material views"
          />
        </div>

        {/* Active Tab Panel */}
        <section role="tabpanel" aria-label={activeTab} className="no-print">
          {activeTab === 'notes' && <NotesTabContent notes={recording.notes} />}

          {activeTab === 'revision' && <RevisionSheetTab notes={recording.notes} />}

          {activeTab === 'cheatsheet' && recording.cheatsheet && (
            <CheatsheetTab cheatsheet={recording.cheatsheet} />
          )}

          {activeTab === 'mindmap' && recording.mindmap && (
            <MindmapTab mindmap={recording.mindmap} />
          )}

          {activeTab === 'qa' && <LectureQaTab recording={recording} />}

          {activeTab === 'transcript' && (
            <TranscriptTab segments={recording.transcript} />
          )}
        </section>

        {/* Offscreen printable layout for jsPDF + html2canvas (also visible in @media print) */}
        <div className="fixed -left-[9999px] top-0 print:static print:left-0">
          <PdfPrintableSheet ref={printableRef} recording={recording} />
        </div>
      </div>
    </div>
  );
}
