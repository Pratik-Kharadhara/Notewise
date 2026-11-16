import React from 'react';

interface LiveWaveformProps {
  levels?: number[];
  active?: boolean;
  paused?: boolean;
  tone?: 'rose' | 'indigo';
  heightClass?: string;
}

const DEFAULT_BARS = [
  0.35, 0.65, 0.45, 0.9, 0.55, 0.78, 0.4, 0.85, 0.6, 0.95, 0.48,
  0.72, 0.52, 0.88, 0.38, 0.68, 0.5, 0.82, 0.44, 0.75, 0.56, 0.4,
];

export function LiveWaveform({
  levels,
  active = false,
  paused = false,
  tone = 'rose',
  heightClass = 'h-20',
}: LiveWaveformProps) {
  const bars = levels && levels.length > 0 ? levels : DEFAULT_BARS;

  return (
    <div
      aria-label="Audio waveform"
      className={`flex items-center justify-center gap-1.5 px-4 ${heightClass} ${
        paused ? 'opacity-45' : ''
      }`}
    >
      {bars.map((val, idx) => {
        const clamped = Math.max(0.16, Math.min(1, val));
        const colorClass =
          tone === 'rose'
            ? idx % 2 === 0
              ? 'bg-rose-400'
              : 'bg-rose-500'
            : idx % 3 === 0
              ? 'bg-indigo-400'
              : idx % 2 === 0
                ? 'bg-indigo-500'
                : 'bg-indigo-600';

        return (
          <span
            key={idx}
            className={`w-1.5 rounded-full transition-[height] duration-75 ${colorClass} ${
              active && !paused && !levels ? 'waveform-bar' : ''
            }`}
            style={{
              height: `${Math.round(clamped * 100)}%`,
            }}
          />
        );
      })}
    </div>
  );
}
