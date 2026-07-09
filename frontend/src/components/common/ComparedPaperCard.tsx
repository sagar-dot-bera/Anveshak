import { Plus } from 'lucide-react';
import type { ComparedPaper } from '@/data/compareMockData';

interface ComparedPaperCardProps {
  paper: ComparedPaper;
}

interface AddPaperSlotProps {
  current: number;
  max: number;
}

export function ComparedPaperCard({ paper }: ComparedPaperCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group">
      <span className="font-mono text-[9px] font-bold tracking-widest text-success-green uppercase">
        {paper.status}
      </span>
      <div>
        <p className="font-hanken font-semibold text-sm text-vibrant-blue group-hover:text-primary leading-snug transition-colors line-clamp-2">
          {paper.title}
        </p>
        <p className="font-inter text-xs text-slate-400 mt-1">
          {paper.authors} ({paper.year})
        </p>
      </div>
    </div>
  );
}

export function AddPaperSlot({ current, max }: AddPaperSlotProps) {
  return (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer group min-h-[96px]">
      <div className="w-7 h-7 rounded-full border-2 border-slate-300 flex items-center justify-center group-hover:border-indigo-400 transition-colors">
        <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
      </div>
      <p className="font-inter text-xs text-slate-400 group-hover:text-indigo-500 transition-colors">
        Add Paper ({current}/{max})
      </p>
    </div>
  );
}
