import React from 'react';
import { getInitials } from '../../utils/audioValidation';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'indigo' | 'slate' | 'amber';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
};

const TONE_CLASSES = {
  indigo: 'bg-indigo-100 text-indigo-700',
  slate: 'bg-slate-200 text-slate-700',
  amber: 'bg-amber-100 text-amber-800',
};

export function Avatar({
  name,
  size = 'md',
  tone = 'indigo',
  className = '',
}: AvatarProps) {
  return (
    <div
      aria-label={name}
      className={`rounded-full font-bold flex items-center justify-center shrink-0 select-none ${SIZE_CLASSES[size]} ${TONE_CLASSES[tone]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
