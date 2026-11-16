import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, LogIn, LogOut, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { api } from '../../services/index.js';
import type { Recording } from '../../types/echonote';
import { formatRelativeTime } from '../../utils/audioValidation';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [recentJobs, setRecentJobs] = useState<Recording[]>([]);
  const [hasActiveOrFailed, setHasActiveOrFailed] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    api
      .getRecordings()
      .then((list) => {
        if (!active) return;
        setHasActiveOrFailed(
          list.some((r) => r.status === 'processing' || r.status === 'failed')
        );
        const prioritized = [...list].sort((a, b) => {
          const score = (s: Recording['status']) =>
            s === 'failed' ? 0 : s === 'processing' ? 1 : 2;
          return score(a.status) - score(b.status);
        });
        setRecentJobs(prioritized.slice(0, 5));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [notifOpen]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    navigate(trimmed ? `/notes?q=${encodeURIComponent(trimmed)}` : '/notes');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between gap-4 px-4 md:px-8 shrink-0 z-20 no-print">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="flex-1 relative" role="search">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" aria-hidden="true" />
          </span>
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search notes, classes, or transcriptions..."
            aria-label="Search notes, classes, or transcriptions"
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all"
          />
        </form>
      </div>

      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {/* Notifications dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            aria-label="Processing activity notifications"
            aria-expanded={notifOpen}
            className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg relative transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
          >
            <Bell className="w-5 h-5" />
            {hasActiveOrFailed && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50">
              <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recent Pipeline Activity
                </p>
                <Link
                  to="/notes"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentJobs.length === 0 ? (
                  <p className="text-xs text-slate-500 p-3 text-center">
                    No lecture activity yet.
                  </p>
                ) : (
                  recentJobs.map((item) => {
                    const target =
                      item.status === 'done'
                        ? `/notes/${item.id}`
                        : `/processing/${item.jobId}`;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          navigate(target);
                        }}
                        className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        {item.status === 'done' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        ) : item.status === 'failed' ? (
                          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.status === 'done'
                              ? 'Notes & mindmap ready'
                              : item.status === 'failed'
                                ? 'Processing failed — click to retry'
                                : `Processing (${item.progress}%)`}
                            {' · '}
                            {formatRelativeTime(item.updatedAt)}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-7 w-px bg-slate-200 hidden sm:block" aria-hidden="true" />

        {/* Profile menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotifOpen(false);
            }}
            aria-label="Account menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-3 rounded-xl p-1 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-tight">
                {user.name}
              </p>
              <p className="text-xs text-slate-500">{user.major}</p>
            </div>
            <Avatar name={user.name} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {user.email || 'Optional guest session'}
                </p>
              </div>
              {user.isGuest ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <LogIn className="w-4 h-4 text-indigo-600" />
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <LogIn className="w-4 h-4 text-slate-400" />
                    Create account
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <LogIn className="w-4 h-4 text-indigo-600" />
                    Switch account
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out (Guest mode)
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
