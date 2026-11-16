import React from 'react';

export type BadgeVariant =
  | 'transcribed'
  | 'ai'
  | 'processing'
  | 'failed'
  | 'neutral'
  | 'blue'
  | 'rose'
  | 'amber'
  | 'indigo';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  transcribed: 'bg-emerald-100 text-emerald-800',
  ai: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-amber-100 text-amber-800',
  failed: 'bg-rose-100 text-rose-700',
  neutral: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-100 text-blue-700',
  rose: 'bg-rose-100 text-rose-700',
  amber: 'bg-amber-100 text-amber-800',
  indigo: 'bg-indigo-50 text-indigo-700',
};

export function Badge({
  variant = 'neutral',
  children,
  icon,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide whitespace-nowrap shrink-0 ${BADGE_CLASSES[variant]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
