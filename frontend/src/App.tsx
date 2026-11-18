import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { RecordPage } from './pages/RecordPage';
import { UploadPage } from './pages/UploadPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { NotesLibraryPage } from './pages/NotesLibraryPage';
import { FoldersPage } from './pages/FoldersPage';
import { NoteDetailPage } from './pages/NoteDetailPage';

/**
 * Authentication is explicitly out of scope for the MVP (spec pages 7 & 14).
 * Sessions are identified by a persistent UUID (x-session-id) stored in
 * localStorage. The /login and /signup routes have been removed.
 */

function WithShell({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <ToastProvider>
          <Routes>
            <Route
              path="/"
              element={
                <WithShell>
                  <DashboardPage />
                </WithShell>
              }
            />
            <Route
              path="/record"
              element={
                <WithShell>
                  <RecordPage />
                </WithShell>
              }
            />
            <Route
              path="/upload"
              element={
                <WithShell>
                  <UploadPage />
                </WithShell>
              }
            />
            <Route
              path="/processing/:jobId"
              element={
                <WithShell>
                  <ProcessingPage />
                </WithShell>
              }
            />
            <Route
              path="/notes"
              element={
                <WithShell>
                  <NotesLibraryPage />
                </WithShell>
              }
            />
            <Route
              path="/folders"
              element={
                <WithShell>
                  <FoldersPage />
                </WithShell>
              }
            />
            <Route
              path="/notes/:id"
              element={
                <WithShell>
                  <NoteDetailPage />
                </WithShell>
              }
            />

            {/* Redirect legacy auth routes to dashboard */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}
