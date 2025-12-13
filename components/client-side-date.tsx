'use client';

interface ClientSideDateProps {
  date: string;
  locale?: string;
  className?: string;
}

export function ClientSideDate({ date, locale  , className }: ClientSideDateProps) {
  return (
    <span className={className} suppressHydrationWarning>
      {new Date(date).toLocaleDateString()}
    </span>
  );
}