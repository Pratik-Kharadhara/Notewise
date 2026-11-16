import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/index.js';
import type { JobStatusResponse } from '../types/echonote';

interface UsePollJobOptions {
  intervalMs?: number;
  maxBackoffMs?: number;
}

/**
 * Polls GET /api/jobs/:jobId every 2–3 seconds.
 * - Stops automatically when status reaches "done" or "failed" or on unmount.
 * - Uses exponential backoff if network requests fail.
 * - Smoothly animates displayProgress without jumping backwards.
 */
export function usePollJob(jobId: string | undefined, options: UsePollJobOptions = {}) {
  const baseInterval = options.intervalMs ?? 2400;
  const maxBackoff = options.maxBackoffMs ?? 20000;

  const [job, setJob] = useState<JobStatusResponse | null>(null);
  const [displayProgress, setDisplayProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const failureCountRef = useRef<number>(0);
  const activeRef = useRef<boolean>(true);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const pollOnce = useCallback(async () => {
    if (!jobId || !activeRef.current) return;

    try {
      const next = await api.getJobStatus(jobId);
      if (!activeRef.current) return;

      failureCountRef.current = 0;
      setError(null);
      setJob(next);
      setLoading(false);

      // Keep progress monotonic so UI never flickers backwards
      setDisplayProgress((prev) =>
        next.status === 'done' ? 100 : Math.max(prev, next.progress)
      );

      if (next.status !== 'done' && next.status !== 'failed') {
        timerRef.current = window.setTimeout(pollOnce, baseInterval);
      }
    } catch (err) {
      if (!activeRef.current) return;
      failureCountRef.current += 1;
      const message =
        err instanceof Error ? err.message : 'Unable to reach processing service.';
      setError(message);
      setLoading(false);

      // Exponential backoff on transient errors
      const backoff = Math.min(
        maxBackoff,
        baseInterval * Math.pow(2, failureCountRef.current)
      );
      timerRef.current = window.setTimeout(pollOnce, backoff);
    }
  }, [jobId, baseInterval, maxBackoff]);

  useEffect(() => {
    activeRef.current = true;
    setLoading(true);
    setError(null);
    setJob(null);
    setDisplayProgress(0);
    failureCountRef.current = 0;

    if (jobId) {
      pollOnce();
    } else {
      setLoading(false);
    }

    return () => {
      activeRef.current = false;
      clearTimer();
    };
  }, [jobId, pollOnce]);

  const retry = useCallback(async () => {
    if (!jobId) return;
    clearTimer();
    setIsRetrying(true);
    setError(null);
    failureCountRef.current = 0;

    try {
      const restarted = await api.retryJob(jobId);
      if (!activeRef.current) return;
      setJob(restarted);
      setDisplayProgress(restarted.progress);
      timerRef.current = window.setTimeout(pollOnce, baseInterval);
    } catch (err) {
      if (!activeRef.current) return;
      setError(err instanceof Error ? err.message : 'Retry failed. Please try again.');
    } finally {
      if (activeRef.current) setIsRetrying(false);
    }
  }, [jobId, baseInterval, pollOnce]);

  return {
    job,
    displayProgress,
    loading,
    error,
    isRetrying,
    retry,
  };
}
