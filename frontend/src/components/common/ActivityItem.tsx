import { Sparkles, Users, BookOpen } from 'lucide-react';
import type { ActivityEntry } from '@/data/dashboardMockData';

const iconMap = {
  ai: Sparkles,
  share: Users,
  review: BookOpen,
};

const iconBgMap = {
  ai: 'bg-indigo-100 text-indigo-600',
  share: 'bg-blue-100 text-blue-600',
  review: 'bg-slate-100 text-slate-600',
};

interface ActivityItemProps {
  item: ActivityEntry;
}

export default function ActivityItem({ item }: ActivityItemProps) {
  const Icon = iconMap[item.type];
  const bgClass = iconBgMap[item.type];

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-b-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bgClass}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-inter text-xs font-semibold text-slate-800 leading-snug">
          {item.title}
        </p>
        <p className="font-inter text-xs text-slate-500 leading-snug mt-0.5">
          {item.description}
        </p>
        <p className="font-mono text-[9px] font-semibold tracking-widest text-slate-400 mt-1 uppercase">
          {item.timeAgo}
        </p>
      </div>
    </div>
  );
}
