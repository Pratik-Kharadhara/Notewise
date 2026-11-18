import React, { createContext, useContext, useMemo } from 'react';

/**
 * SessionContext — replaces the removed AuthContext.
 *
 * Per the MVP spec (pages 7 & 14), authentication is explicitly out of scope.
 * Instead we generate a persistent UUID in localStorage as `x-session-id` and
 * pass it in every API request header. No login, no token, no user table.
 */

const SESSION_KEY = 'notewise_session_id';

function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    // Generate a UUID v4-style identifier
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // Fallback: generate a temporary ID if localStorage is unavailable
    return `tmp-${Date.now()}`;
  }
}

interface SessionContextValue {
  sessionId: string;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used inside a SessionProvider.');
  }
  return ctx;
}
