import {
  Flag,
  FlaskConical,
  Database,
  BarChart2,
  Zap,
  AlertCircle,
  Rocket,
} from 'lucide-react';
import type { ComparisonCriteria, CellContent } from '@/data/compareMockData';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flag,
  FlaskConical,
  Database,
  BarChart2,
  Zap,
  AlertCircle,
  Rocket,
};

function CellValue({ content }: { content: CellContent }) {
  if (Array.isArray(content)) {
    return (
      <ul className="space-y-1.5 list-none">
        {content.map((item, i) => (
          <li key={i} className="flex items-start gap-2 font-inter text-sm text-slate-700 leading-snug">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="font-inter text-sm text-slate-700 leading-relaxed">
      {content}
    </p>
  );
}

interface ComparisonRowProps {
  row: ComparisonCriteria;
}

export default function ComparisonRow({ row }: ComparisonRowProps) {
  const Icon = iconMap[row.icon] ?? Flag;

  return (
    <tr className="border-b border-slate-100 last:border-b-0 align-top hover:bg-slate-50/50 transition-colors">
      {/* Criteria label */}
      <td className="py-5 px-5 w-[160px] min-w-[140px]">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-vibrant-blue flex-shrink-0" />
          <span className="font-hanken font-semibold text-sm text-vibrant-blue">
            {row.label}
          </span>
        </div>
      </td>

      {/* Paper A */}
      <td className="py-5 px-4 border-l border-slate-100">
        <CellValue content={row.paperA} />
      </td>

      {/* Paper B */}
      <td className="py-5 px-4 border-l border-slate-100">
        <CellValue content={row.paperB} />
      </td>

      {/* Paper C */}
      <td className="py-5 px-4 border-l border-slate-100">
        <CellValue content={row.paperC} />
      </td>
    </tr>
  );
}
