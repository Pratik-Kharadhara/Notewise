import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { RecordPage } from './pages/RecordPage';
import { UploadPage } from './pages/UploadPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { NotesLibraryPage } from './pages/NotesLibraryPage';
import { FoldersPage } from './pages/FoldersPage';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { AuthPage } from './pages/AuthPage';

function WithShell({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />

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

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
