import type { ReactNode } from 'react';

export type StatTone = 'indigo' | 'violet' | 'sky' | 'teal';

const toneStyles: Record<StatTone, { card: string; chip: string; glow: string }> = {
  indigo: {
    card: 'from-indigo-500 to-indigo-700',
    chip: 'bg-white/20',
    glow: 'shadow-[0_18px_40px_-20px_rgba(79,70,229,0.75)]',
  },
  violet: {
    card: 'from-violet-500 to-purple-700',
    chip: 'bg-white/20',
    glow: 'shadow-[0_18px_40px_-20px_rgba(124,58,237,0.75)]',
  },
  sky: {
    card: 'from-sky-500 to-blue-600',
    chip: 'bg-white/20',
    glow: 'shadow-[0_18px_40px_-20px_rgba(14,165,233,0.75)]',
  },
  teal: {
    card: 'from-teal-500 to-emerald-600',
    chip: 'bg-white/20',
    glow: 'shadow-[0_18px_40px_-20px_rgba(20,184,166,0.75)]',
  },
};

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  badge?: ReactNode;
  tone?: StatTone;
}

export default function StatCard({ icon, label, value, badge, tone = 'indigo' }: StatCardProps) {
  const t = toneStyles[tone];
  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-5 flex flex-col gap-4 text-white bg-gradient-to-br ${t.card} ${t.glow} hover:-translate-y-1 transition-transform duration-300`}
    >
      {/* Decorative rings */}
      <div className="pointer-events-none absolute -right-8 -top-8 w-32 h-32 rounded-full border-[14px] border-white/15" />
      <div className="pointer-events-none absolute right-10 -bottom-10 w-20 h-20 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl ${t.chip} backdrop-blur flex items-center justify-center`}>
          {icon}
        </div>
        {badge && (
          <span className="font-inter text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors [&_a]:text-white [&_a]:no-underline">
            {badge}
          </span>
        )}
      </div>
      <div className="relative">
        <p className="font-hanken font-extrabold text-4xl leading-none tracking-tight">
          {value}
        </p>
        <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-white/80 uppercase mt-2">
          {label}
        </p>
      </div>
    </div>
  );
}
