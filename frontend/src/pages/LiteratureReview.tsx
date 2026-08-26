import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Sparkles,
  Check,
  BookOpen,
  Info,
  Layers,
  Star,
  TrendingUp,
  X,
  Copy,
  Search,
  FlaskConical,
} from 'lucide-react';
import { toast } from 'sonner';
import { listPapers, generateLiteratureReview } from '@/api/papersApi';
import type { InnerPaperSummaryDTO } from '@/lib/types';

export default function LiteratureReview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [synthesisReport, setSynthesisReport] = useState<InnerPaperSummaryDTO[] | null>(null);

  // Fetch real papers list
  const { data: papers, isLoading: isPapersLoading } = useQuery({
    queryKey: ['papers'],
    queryFn: listPapers,
  });

  // Mutation to generate review
  const reviewMutation = useMutation({
    mutationFn: (ids: string[]) => generateLiteratureReview(ids),
    onSuccess: (data, variables) => {
      setSynthesisReport(data.literatureReviews);
      toast.success('Literature Review Synthesized', {
        description: `Successfully analyzed ${variables.length} papers.`,
      });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.msg || err.response?.data?.error || 'Failed to synthesize literature review.';
      toast.error('Synthesis failed', { description: errMsg });
    },
  });

  const togglePaperSelection = (id: string) => {
    setSelectedPaperIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((paperId) => paperId !== id);
      }
      return [...prev, id];
    });
  };

  const handleGenerate = () => {
    if (selectedPaperIds.length === 0) {
      toast.error('No papers selected', {
        description: 'Please select at least one paper in the Paper Library first.',
      });
      return;
    }
    reviewMutation.mutate(selectedPaperIds);
  };

  const handleCopyClipboard = () => {
    if (!synthesisReport) return;
    navigator.clipboard.writeText(JSON.stringify(synthesisReport, null, 2));
    toast.success('Copied to clipboard', {
      description: 'The synthesized review JSON has been copied to your clipboard.',
    });
  };

  const filteredPapers = papers?.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const selectedPapersList = papers?.filter((p) => selectedPaperIds.includes(p.id)) || [];

  if (isPapersLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#f7f9fb]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-deep-indigo border-t-transparent" />
          <p className="font-inter text-sm text-slate-500 font-medium">Loading research papers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-100/50">
      
      {/* ── Left Column: Synthesis Pipeline Workspace ── */}
      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
        
        {/* Synthesis Control Area */}
        <div className="p-5 border-b border-slate-200 bg-white space-y-4 flex-shrink-0 select-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-hanken font-bold text-lg text-slate-900 leading-none">
                Synthesis Pipeline
              </h2>
              <p className="font-inter text-xs text-slate-400 mt-1.5">
                Reviewing {selectedPaperIds.length} selected papers from your library.
              </p>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={reviewMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-deep-indigo hover:bg-primary text-white font-inter text-xs font-semibold transition-all shadow-sm active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
            >
              {reviewMutation.isPending ? (
                <>Synthesizing...</>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Literature Review
                </>
              )}
            </button>
          </div>

          {/* Selected Papers Tags */}
          <div className="flex flex-wrap gap-1.5">
            {selectedPapersList.map((paper) => (
              <span
                key={paper.id}
                className="inline-flex items-center gap-1.5 font-inter text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded"
              >
                <span className="truncate max-w-[120px]">{paper.title}</span>
                <button
                  onClick={() => togglePaperSelection(paper.id)}
                  className="text-slate-400 hover:text-error-red transition-colors"
                  aria-label={`Remove ${paper.title}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedPapersList.length === 0 && (
              <span className="font-inter text-xs italic text-slate-400">
                No papers selected. Select papers from the Library sidebar on the right.
              </span>
            )}
          </div>
        </div>

        {/* Report Preview Document Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/60">
          {reviewMutation.isPending ? (
            /* Loading State */
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-primary animate-spin" />
              <p className="font-inter text-sm font-semibold text-slate-500">
                Synthesizing literature models...
              </p>
            </div>
          ) : synthesisReport && selectedPaperIds.length > 0 ? (
            /* Report Render Area */
            <div className="max-w-[800px] mx-auto space-y-4">
              
              {/* Document Header Controls */}
              <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
                  <span className="font-inter text-xs text-slate-500 font-medium">
                    Review Generated Successfully
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyClipboard}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-deep-indigo hover:bg-primary text-white font-inter text-[10px] font-semibold transition-all active:scale-[0.98]"
                  >
                    <Copy className="w-3 h-3" />
                    Copy to Clipboard
                  </button>
                </div>
              </div>

              {/* Document Sheet */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_4px_24px_-10px_rgba(0,0,0,0.1)] p-10 md:p-12 space-y-8 text-slate-800 text-left font-serif leading-relaxed">
                
                {/* Title */}
                <div className="text-center space-y-3 pb-4 border-b border-slate-100">
                  <h1 className="font-hanken font-bold text-2xl md:text-3xl text-slate-900 leading-snug">
                    Synthesized Literature Review
                  </h1>
                  <p className="font-sans text-xs text-slate-400 font-medium">
                    COMPILER: ANVESHAK AI &bull; {selectedPaperIds.length} DOCUMENTS
                  </p>
                </div>

                {/* Section 1: Intro */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 font-sans font-bold text-sm text-slate-900 tracking-wide uppercase">
                    <Info className="w-4.5 h-4.5 text-primary" />
                    <span>1. Executive Summary</span>
                  </div>
                  <p className="text-sm text-slate-700 text-justify font-inter">
                    This report compiles the individual objectives, research methodologies, and outcomes across the {selectedPaperIds.length} selected research paper(s).
                  </p>
                </div>

                {/* Section 2: Detailed Review per Paper */}
                <div className="space-y-6 pt-2">
                  <div className="flex items-center gap-2 font-sans font-bold text-sm text-slate-900 tracking-wide uppercase">
                    <Layers className="w-4.5 h-4.5 text-primary" />
                    <span>2. Individual Synthesis Records</span>
                  </div>

                  <div className="space-y-8">
                    {synthesisReport.map((review, i) => {
                      const paperTitle = selectedPapersList[i]?.title || `Document #${i + 1}`;
                      return (
                        <div key={i} className="border border-slate-100 rounded-xl p-6 bg-slate-50/50 space-y-4 font-sans text-sm">
                          <h3 className="font-hanken font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                            {paperTitle}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <FlaskConical className="w-3.5 h-3.5" /> Objective
                              </span>
                              <p className="text-slate-600 text-xs text-justify leading-relaxed">{review.objective || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Info className="w-3.5 h-3.5" /> Methodology
                              </span>
                              <p className="text-slate-600 text-xs text-justify leading-relaxed">{review.methodology || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5" /> Dataset
                              </span>
                              <p className="text-slate-600 text-xs text-justify leading-relaxed">{review.dataset || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Star className="w-3.5 h-3.5" /> Key Findings
                              </span>
                              <p className="text-slate-600 text-xs text-justify leading-relaxed">{review.keyFindings || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <X className="w-3.5 h-3.5" /> Limitations
                              </span>
                              <p className="text-slate-600 text-xs text-justify leading-relaxed">{review.limitations || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5" /> Future Work
                              </span>
                              <p className="text-slate-600 text-xs text-justify leading-relaxed">{review.futureWork || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 select-none py-20">
              <BookOpen className="w-12 h-12 text-slate-300" />
              <p className="font-inter text-sm font-semibold text-slate-500">
                Select papers from the library checklist on the right.
              </p>
              <p className="font-inter text-xs text-slate-400">
                Then click "Generate Literature Review" to compile your synthesis report.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ── Right Column: Paper Library Sidebar ────────── */}
      <div className="w-[300px] flex-shrink-0 h-full bg-white border-l border-slate-200 flex flex-col justify-between select-none">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-hanken font-bold text-sm text-slate-900 leading-none">
              Paper Library
            </h3>
            <span className="font-mono text-[9px] font-bold tracking-widest text-slate-400 bg-slate-100 border border-slate-200 rounded px-2 py-0.5 uppercase">
              {papers?.length || 0} Total
            </span>
          </div>

          {/* Filter Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-inter text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-vibrant-blue focus:border-vibrant-blue transition-all"
            />
          </div>
        </div>

        {/* Papers List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredPapers.map((paper) => {
            const isChecked = selectedPaperIds.includes(paper.id);
            return (
              <div
                key={paper.id}
                onClick={() => togglePaperSelection(paper.id)}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  isChecked
                    ? 'border-primary bg-indigo-50/20 shadow-sm'
                    : 'border-slate-200 hover:border-indigo-100 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex gap-2.5 items-start">
                  <div className={`mt-0.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isChecked
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-hanken font-semibold text-slate-800 text-xs md:text-sm leading-snug truncate">
                      {paper.title}
                    </h4>
                    <p className="font-inter text-[10.5px] text-slate-400 mt-1">
                      {paper.authors?.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions info notice */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 text-[10px] text-center text-slate-400 font-mono leading-relaxed">
          Select papers and generate review reports instantly using Gemini LLM summaries.
        </div>

      </div>

    </div>
  );
}
