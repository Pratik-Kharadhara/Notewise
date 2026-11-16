import React, { createContext, useContext, useState } from 'react';
import type { UserProfile } from '../types/echonote';

interface AuthContextValue {
  user: UserProfile;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, major: string, password: string) => Promise<void>;
  signOut: () => void;
}

const STORAGE_KEY = 'echonote_user_v1';

const DEFAULT_STUDENT: UserProfile = {
  id: 'student-default',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@university.edu',
  major: 'Computer Science · B.Tech',
  isGuest: false,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STUDENT;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.name === 'string') return parsed;
  } catch {
    // Ignore storage read errors
  }
  return DEFAULT_STUDENT;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(loadStoredUser);

  const persistUser = (next: UserProfile) => {
    setUser(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage write errors
    }
  };

  const signIn = async (email: string, _password: string) => {
    const nameFromEmail = email
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    persistUser({
      id: `user-${Date.now()}`,
      name: nameFromEmail || 'Student User',
      email: email.trim(),
      major: 'B.Tech Final Year',
      isGuest: false,
    });
  };

  const signUp = async (name: string, email: string, major: string, _password: string) => {
    persistUser({
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      major: major.trim() || 'Undergraduate',
      isGuest: false,
    });
  };

  const signOut = () => {
    persistUser({
      id: 'guest',
      name: 'Guest Student',
      email: '',
      major: 'Guest Session',
      isGuest: true,
    });
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }
  return ctx;
}
