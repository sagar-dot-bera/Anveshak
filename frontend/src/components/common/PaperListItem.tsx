import { FileText } from 'lucide-react';
import type { ResearchPaperResponse } from '@/lib/types';

interface PaperListItemProps {
  paper: ResearchPaperResponse;
}

export default function PaperListItem({ paper }: PaperListItemProps) {
  const formattedDate = new Date(paper.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex items-start gap-4 py-4 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors rounded-lg px-2 -mx-2 cursor-pointer group">
      {/* Thumbnail */}
      <div className="w-10 h-12 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
        <FileText className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-hanken font-semibold text-sm text-slate-800 leading-snug truncate group-hover:text-primary transition-colors">
          {paper.title}
        </p>
        <p className="font-inter text-xs text-slate-400 mt-0.5">
          {paper.authors?.length ? paper.authors.join(', ') : 'Unknown Authors'} &bull; {paper.publicationYear}
        </p>
        {paper.keywords && paper.keywords.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {paper.keywords.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] font-semibold tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Timestamp */}
      <span className="font-inter text-xs text-slate-400 flex-shrink-0 mt-0.5">
        {formattedDate}
      </span>
    </div>
  );
}
