import { Sparkles, Users, BookOpen } from 'lucide-react';
import type { ActivityEntry } from '@/data/dashboardMockData';

const iconMap = {
  ai: Sparkles,
  share: Users,
  review: BookOpen,
};

const iconBgMap = {
  ai: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-[0_6px_14px_-6px_rgba(16,185,129,0.8)]',
  share: 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_6px_14px_-6px_rgba(79,70,229,0.7)]',
  review: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_6px_14px_-6px_rgba(245,158,11,0.7)]',
};

interface ActivityItemProps {
  item: ActivityEntry;
}

export default function ActivityItem({ item }: ActivityItemProps) {
  const Icon = iconMap[item.type];
  const bgClass = iconBgMap[item.type];

  return (
    <div className="relative flex items-start gap-3 py-3 border-b border-slate-100 last:border-b-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-inter text-xs font-bold text-slate-800 leading-snug">
          {item.title}
        </p>
        <p className="font-inter text-xs text-slate-500 leading-snug mt-0.5 truncate">
          {item.description}
        </p>
        <p className="font-mono text-[9px] font-semibold tracking-widest text-violet-400 mt-1 uppercase">
          {item.timeAgo}
        </p>
      </div>
    </div>
  );
}
