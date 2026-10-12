// Inked marks, drawn with a brush the way cel line art is: a tick for done,
// a circle for "you are here", a strike for ruled out, an arrow for direction.

type MarkProps = { className?: string; title?: string };

function MarkSvg({ className, title, children }: MarkProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'w-5 h-5'}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {children}
    </svg>
  );
}

export function TickMark(props: MarkProps) {
  return (
    <MarkSvg {...props}>
      <path d="M4.2 12.8c1.6 1.2 3 2.6 4.3 4.6 2.6-5.2 6.4-9.4 11.3-12.6" />
    </MarkSvg>
  );
}

export function StrikeMark(props: MarkProps) {
  return (
    <MarkSvg {...props}>
      <path d="M5.5 5.8c4.3 3.9 8.6 8.2 12.9 12.6M18.3 5.4C13.9 9.6 9.8 13.9 5.9 18.6" />
    </MarkSvg>
  );
}

export function CircleMark(props: MarkProps) {
  return (
    <MarkSvg {...props}>
      <path d="M13.6 4.2c-5-.9-9.5 2.2-9.6 7.2-.1 4.7 3.6 8.4 8.3 8.4 4.6 0 8-3.4 7.8-7.9-.2-4-3.5-7.1-7.6-7.4" />
    </MarkSvg>
  );
}

export function ArrowMark(props: MarkProps) {
  return (
    <MarkSvg {...props}>
      <path d="M4 12.4c4.9-.6 10-.5 15.4.1M14.6 7.4c1.7 1.8 3.3 3.3 5 5-1.8 1.6-3.4 3.2-5 5" />
    </MarkSvg>
  );
}
