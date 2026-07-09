import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  badge?: ReactNode;
}

export default function StatCard({ icon, label, value, badge }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col gap-3 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-shadow">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-[#f0f0ff] flex items-center justify-center text-primary">
          {icon}
        </div>
        {badge && (
          <span className="font-mono text-[10px] tracking-wide text-slate-500">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="font-mono text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-1">
          {label}
        </p>
        <p className="font-hanken font-bold text-3xl text-slate-900 leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}
