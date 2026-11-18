import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Mic2,
  LayoutDashboard,
  Mic,
  UploadCloud,
  FileText,
  FolderClosed,
  Calendar,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, onCloseMobile]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 ${
      isActive
        ? 'text-indigo-600 bg-indigo-50 font-semibold'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  const sidebarContent = (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-6 flex items-center justify-between gap-3">
        <Link
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 rounded-xl"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <Mic2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Notewise
          </span>
        </Link>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="md:hidden p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto scrollbar-hide">
        <NavLink to="/" end onClick={onCloseMobile} className={navLinkClass}>
          {({ isActive }) => (
            <>
              <LayoutDashboard
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
                aria-hidden="true"
              />
              <span>Dashboard</span>
            </>
          )}
        </NavLink>

        <NavLink to="/record" onClick={onCloseMobile} className={navLinkClass}>
          {({ isActive }) => (
            <>
              <Mic
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
                aria-hidden="true"
              />
              <span>Record Session</span>
            </>
          )}
        </NavLink>

        <NavLink to="/upload" onClick={onCloseMobile} className={navLinkClass}>
          {({ isActive }) => (
            <>
              <UploadCloud
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
                aria-hidden="true"
              />
              <span>Upload Lecture</span>
            </>
          )}
        </NavLink>

        <NavLink to="/notes" onClick={onCloseMobile} className={navLinkClass}>
          {({ isActive }) => (
            <>
              <FileText
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
                aria-hidden="true"
              />
              <span>All Notes</span>
            </>
          )}
        </NavLink>

        <NavLink to="/folders" onClick={onCloseMobile} className={navLinkClass}>
          {({ isActive }) => (
            <>
              <FolderClosed
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
                aria-hidden="true"
              />
              <span>Folders</span>
            </>
          )}
        </NavLink>

        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Calendar integration coming soon"
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed opacity-75"
        >
          <span className="flex items-center gap-3">
            <Calendar className="w-5 h-5 shrink-0 text-slate-300" aria-hidden="true" />
            <span>Calendar</span>
          </span>
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
            Soon
          </span>
        </button>

        <div className="pt-6 pb-2">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            AI Study Tools
          </p>
        </div>

        <NavLink to="/notes" onClick={onCloseMobile} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group">
          <Sparkles
            className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-slate-600"
            aria-hidden="true"
          />
          <span>Smart Summaries</span>
        </NavLink>

        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Spaced-repetition flashcards coming soon"
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed opacity-75"
        >
          <span className="flex items-center gap-3">
            <Layers className="w-5 h-5 shrink-0 text-slate-300" aria-hidden="true" />
            <span>Flashcards</span>
          </span>
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
            Soon
          </span>
        </button>
      </nav>

      {/* Kept intact from design reference as disabled Coming Soon preview */}
      <div className="p-4 mt-auto border-t border-slate-100">
        <div className="bg-indigo-600 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold opacity-95">Pro Plan</p>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">
                Coming soon
              </span>
            </div>
            <p className="text-xs mt-1.5 opacity-80 leading-relaxed">
              Unlimited transcriptions &amp; AI study tools
            </p>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="mt-3 w-full py-2 bg-white/90 text-indigo-600 rounded-lg text-xs font-bold opacity-80 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden md:flex shrink-0 z-30">{sidebarContent}</aside>

      {/* Mobile drawer sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 h-full shadow-2xl">{sidebarContent}</aside>
        </div>
      )}
    </>
  );
}
