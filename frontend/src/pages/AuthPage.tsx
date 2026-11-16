import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [major, setMajor] = useState('Computer Science · B.Tech');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  const validate = () => {
    const next: Record<string, string> = {};
    if (isSignup && name.trim().length < 2) {
      next.name = 'Please enter your full name.';
    }
    if (!email.trim() || !email.includes('@')) {
      next.email = 'Please enter a valid student email address.';
    }
    if (password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isSignup) {
        await signUp(name, email, major, password);
        showToast('Welcome to EchoNote! Account ready.', 'success');
      } else {
        await signIn(email, password);
        showToast('Signed in successfully.', 'success');
      }
      navigate('/');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Mic2 className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              EchoNote
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {isSignup ? 'Create your student account' : 'Sign in to EchoNote'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isSignup
              ? 'Sync your lecture recordings, study notes, and mindmaps.'
              : 'Access your classroom recordings and exam revision sheets.'}
          </p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <Input
                  label="Full name"
                  placeholder="e.g. Priya Nair"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                />
                <Input
                  label="Course / Major"
                  placeholder="e.g. Computer Science · B.Tech"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </>
            )}

            <Input
              label="Email address"
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              {isSignup ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col gap-3 text-center text-sm">
            <p className="text-slate-500">
              {isSignup ? 'Already have an account?' : 'New to EchoNote?'}{' '}
              <Link
                to={isSignup ? '/login' : '/signup'}
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                {isSignup ? 'Sign in' : 'Create one'}
              </Link>
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Continue to workspace without signing in
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
