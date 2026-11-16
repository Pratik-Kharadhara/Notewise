import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  highlighted?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING_CLASSES = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  highlighted = false,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const surface = highlighted
    ? 'bg-white rounded-3xl border-2 border-indigo-100 shadow-md ring-4 ring-indigo-50/70'
    : 'bg-white rounded-3xl border border-slate-200 shadow-sm';

  return (
    <div className={`${surface} ${PADDING_CLASSES[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
}
