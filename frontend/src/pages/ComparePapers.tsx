import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  FileText,
  Sparkles,
  ArrowLeft,
  Loader2,
  Calendar,
  User,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { listPapers, comparePapers } from '@/api/papersApi';
import type { PaperComparison } from '@/lib/types';

export default function ComparePapers() {
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [comparisonResults, setComparisonResults] = useState<PaperComparison[] | null>(null);

  // Fetch all papers
  const { data: papers, isLoading: isPapersLoading } = useQuery({
    queryKey: ['papers'],
    queryFn: listPapers,
  });

  // Mutation to compare papers
  const compareMutation = useMutation({
    mutationFn: (ids: string[]) => comparePapers(ids),
    onSuccess: (data) => {
      setComparisonResults(data.papers);
      toast.success('Paper comparison complete!', {
        description: 'AI has synthesized findings across selected documents.',
      });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.msg || err.response?.data?.error || 'Failed to compare papers.';
      toast.error('Comparison failed', { description: errMsg });
    },
  });

  const handleTogglePaper = (id: string) => {
    setSelectedPaperIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((paperId) => paperId !== id);
      }
      if (prev.length >= 4) {
        toast.warning('Maximum Limit Reached', {
          description: 'You can compare a maximum of 4 papers at once.',
        });
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selectedPaperIds.length < 2) {
      toast.info('Select papers first', {
        description: 'Please select at least 2 papers to perform a comparison.',
      });
      return;
    }
    compareMutation.mutate(selectedPaperIds);
  };

  const handleBackToSelector = () => {
    setComparisonResults(null);
  };

  if (isPapersLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#f7f9fb]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-deep-indigo border-t-transparent" />
          <p className="font-inter text-sm text-slate-500 font-medium">Loading papers for comparison...</p>
        </div>
      </div>
    );
  }

  // ── Render Comparison Results ───────────────────────────
  if (comparisonResults) {
    const rows = [
      { key: 'objective', label: 'Objective' },
      { key: 'methodology', label: 'Methodology' },
      { key: 'dataset', label: 'Dataset / Tools' },
      { key: 'results', label: 'Key Results' },
      { key: 'strengths', label: 'Strengths' },
      { key: 'weaknesses', label: 'Limitations' },
      { key: 'futureWork', label: 'Future Work' },
    ];

    return (
      <div className="px-6 md:px-8 pt-6 pb-20 max-w-[1440px] space-y-6 mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-xs font-inter text-slate-400">
              <Link to="/dashboard" className="hover:text-slate-600 transition-colors">
                Library
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-500 font-medium">Comparison Results</span>
            </nav>
            <h1 className="font-hanken font-bold text-2xl text-slate-900 mt-1 leading-none">
              Compare Papers
            </h1>
          </div>

          <button
            onClick={handleBackToSelector}
            className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 font-inter text-xs font-semibold text-slate-600 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Modify Selection
          </button>
        </div>

        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none translate-x-8 -translate-y-8" />
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-hanken font-semibold text-sm text-primary mb-1">
                AI Synthesis Summary
              </p>
              <p className="font-inter text-sm text-slate-700 leading-relaxed">
                We have analyzed the {comparisonResults.length} selected papers. Here is a matrix-level comparison mapping their objectives, methodologies, and outcomes side-by-side to assist in your literature review.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-5 text-left w-[200px] bg-slate-50/50">
                    <span className="font-mono text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                      Criteria
                    </span>
                  </th>
                  {comparisonResults.map((paper, i) => (
                    <th key={i} className="py-4 px-5 text-left border-l border-slate-100 bg-slate-50/50 min-w-[250px]">
                      <span className="font-hanken font-semibold text-sm text-vibrant-blue line-clamp-2">
                        {paper.title}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-b border-slate-100 last:border-b-0 align-top hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-5 font-hanken font-semibold text-sm text-slate-800 bg-slate-50/20">
                      {row.label}
                    </td>
                    {comparisonResults.map((paper, i) => {
                      const value = paper[row.key as keyof PaperComparison] || 'N/A';
                      return (
                        <td key={i} className="py-5 px-5 border-l border-slate-100 font-inter text-sm text-slate-600 leading-relaxed text-justify">
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Paper Selection View ────────────────────────
  return (
    <div className="px-6 md:px-8 pt-6 pb-20 max-w-[1440px] space-y-6 mx-auto h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs font-inter text-slate-400">
            <Link to="/dashboard" className="hover:text-slate-600 transition-colors">
              Library
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-500 font-medium">Compare Papers</span>
          </nav>
          <h1 className="font-hanken font-bold text-2xl text-slate-900 mt-1 leading-none">
            Compare Papers
          </h1>
          <p className="font-inter text-sm text-slate-500 mt-2">
            Select 2 to 4 papers to map their contents and results side-by-side using AI.
          </p>
        </div>

        <button
          onClick={handleCompare}
          disabled={selectedPaperIds.length < 2 || compareMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-deep-indigo hover:bg-primary text-white font-inter text-sm font-semibold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {compareMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing Papers...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Compare ({selectedPaperIds.length})
            </>
          )}
        </button>
      </div>

      {papers && papers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => {
            const isSelected = selectedPaperIds.includes(paper.id);
            return (
              <div
                key={paper.id}
                onClick={() => handleTogglePaper(paper.id)}
                className={`bg-white border rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between group select-none relative
                  ${isSelected
                    ? 'border-deep-indigo shadow-[0_4px_20px_-4px_rgba(79,70,229,0.12)]'
                    : 'border-slate-100 hover:border-indigo-200 hover:shadow-sm'
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-deep-indigo text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </div>
                )}

                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-deep-indigo text-white' : 'bg-indigo-50 text-primary group-hover:bg-deep-indigo group-hover:text-white'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-hanken font-semibold text-base text-slate-900 group-hover:text-primary leading-snug transition-colors line-clamp-2">
                    {paper.title}
                  </h3>
                  <p className="font-inter text-xs text-slate-500 line-clamp-3">
                    {paper.abstractText || 'No abstract text available.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between font-inter text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {paper.authors?.length ? paper.authors[0] : 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {paper.publicationYear}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center max-w-lg mx-auto mt-10">
          <h3 className="font-hanken font-bold text-slate-700 text-lg">No papers in library</h3>
          <p className="font-inter text-sm text-slate-400 mt-1">
            You need to upload research papers before you can compare them.
          </p>
          <Link
            to="/upload"
            className="mt-5 inline-flex items-center gap-2 py-2 px-4 rounded-lg bg-deep-indigo hover:bg-primary text-white font-inter font-semibold text-sm transition-all"
          >
            Upload Papers
          </Link>
        </div>
      )}
    </div>
  );
}
