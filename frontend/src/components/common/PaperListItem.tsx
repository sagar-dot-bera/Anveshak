import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import type { ResearchPaperResponse } from '@/lib/types';

const tagTones = [
  'bg-violet-100 text-violet-700',
  'bg-pink-100 text-pink-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
  'bg-sky-100 text-sky-700',
];

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
    <Link
      to={`/talk-to-paper?paperId=${paper.id}`}
      className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-b-0 hover:bg-gradient-to-r hover:from-violet-50 hover:to-pink-50/60 transition-colors rounded-2xl px-3 -mx-3 cursor-pointer group block decoration-none"
    >
      {/* Thumbnail */}
      <div className="w-11 h-13 rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center flex-shrink-0 text-violet-500 group-hover:from-violet-500 group-hover:to-pink-500 group-hover:text-white group-hover:-rotate-6 transition-all duration-300">
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
          <div className="flex gap-1.5 mt-2 flex-wrap font-normal">
            {paper.keywords.map((tag, i) => (
              <span
                key={tag}
                className={`font-mono text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase ${tagTones[i % tagTones.length]}`}
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
    </Link>
  );
}
