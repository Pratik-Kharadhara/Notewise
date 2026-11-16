import React from 'react';

interface ProgressBarProps {
  value: number;
  tone?: 'indigo' | 'amber' | 'emerald' | 'rose';
  label?: string;
  showPercent?: boolean;
  className?: string;
}

const BAR_COLORS = {
  indigo: 'bg-indigo-600',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
};

export function ProgressBar({
  value,
  tone = 'indigo',
  label,
  showPercent = false,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          {label && <span className="text-slate-700">{label}</span>}
          {showPercent && (
            <span className="font-mono tabular-nums text-slate-600">{clamped}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${BAR_COLORS[tone]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
