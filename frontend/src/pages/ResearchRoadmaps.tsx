import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Zap,
  Bookmark,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Users,
  Tag,
  Calendar,
  Loader2,
  AlertCircle,
  MapIcon,
  Plus,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAllRoadmaps, getRoadmapById, generateRoadmap } from '@/api/roadmapApi';
import { importPaperToLibrary } from '@/api/papersApi';
import type { RoadmapDTO, RoadmapShort, GlobalPaperDTO } from '@/lib/types';

// ── Sub-component: Paper card inside a stage ─────────────────────────────────

interface StagePaperCardProps {
  paper: GlobalPaperDTO;
}

function StagePaperCard({ paper }: StagePaperCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const authorsPreview = paper.authors
    ? paper.authors.split(',').slice(0, 2).join(', ') +
      (paper.authors.split(',').length > 2 ? ' et al.' : '')
    : 'Unknown authors';

  const importMutation = useMutation({
    mutationFn: () =>
      importPaperToLibrary({
        paperId: paper.paperId,
        title: paper.title,
        authors: paper.authors,
        categories: paper.categories,
        pdfUrl: paper.pdfUrl || paper.paperUrl,
        abstractText: paper.abstractText,
        publicationYear: paper.created ? new Date(paper.created).getFullYear() : undefined,
      }),
    onSuccess: (res) => {
      setIsImported(true);
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      toast.success('Added to Library!', {
        description: `"${res.title}" has been saved to your library.`,
        action: {
          label: 'View Library',
          onClick: () => navigate('/dashboard'),
        },
      });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || err.response?.data?.msg || err.response?.data?.error || 'Failed to import paper.';
      toast.error('Import failed', { description: errMsg });
    },
  });

  return (
    <div className="border border-slate-100 rounded-lg bg-slate-50/60 overflow-hidden">
      {/* Header row */}
      <div className="flex items-start gap-3 p-3">
        <div className="mt-0.5 w-6 h-6 flex-shrink-0 rounded bg-indigo-50 flex items-center justify-center">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-inter font-semibold text-[12px] text-slate-800 leading-snug line-clamp-2">
            {paper.title || 'Untitled Paper'}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {paper.authors && (
              <span className="flex items-center gap-1 font-inter text-[10px] text-slate-400">
                <Users className="w-3 h-3" />
                {authorsPreview}
              </span>
            )}
            {paper.created && (
              <span className="flex items-center gap-1 font-inter text-[10px] text-slate-400">
                <Calendar className="w-3 h-3" />
                {paper.created}
              </span>
            )}
          </div>
          {paper.categories && (
            <div className="mt-1.5 flex items-center gap-1">
              <Tag className="w-2.5 h-2.5 text-slate-300" />
              <span className="font-mono text-[9px] font-bold tracking-wide text-slate-400 uppercase">
                {paper.categories.split(' ')[0]}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Paper URL link (arXiv abstract page or equivalent) */}
          {paper.paperUrl && (
            <a
              href={paper.paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open paper page"
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-inter bg-indigo-50 text-primary hover:bg-indigo-100 transition-colors border border-indigo-100"
            >
              <ExternalLink className="w-3 h-3" />
              View
            </a>
          )}
          {/* DOI fallback if no paperUrl */}
          {!paper.paperUrl && paper.doi && (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Open DOI"
              className="p-1 rounded hover:bg-indigo-50 text-slate-400 hover:text-primary transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {isImported ? (
            <button
              type="button"
              disabled
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-inter bg-emerald-100/70 text-emerald-800 border border-emerald-300 opacity-90 cursor-default"
            >
              <Check className="w-3 h-3 text-emerald-700" />
              In Library
            </button>
          ) : (
            <button
              type="button"
              disabled={importMutation.isPending}
              onClick={() => importMutation.mutate()}
              title="Add paper to library"
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-inter bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200 disabled:opacity-75"
            >
              {importMutation.isPending ? (
                <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />
              ) : (
                <Plus className="w-3 h-3 text-emerald-600" />
              )}
              {importMutation.isPending ? 'Adding...' : 'Add to Library'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded hover:bg-slate-200 text-slate-400 transition-colors"
            aria-label={expanded ? 'Collapse abstract' : 'Expand abstract'}
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable abstract */}
      {expanded && paper.abstractText && (
        <div className="px-3 pb-3 border-t border-slate-100">
          <p className="font-inter text-[11px] text-slate-500 leading-relaxed text-justify mt-2">
            {paper.abstractText}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Sub-component: Stage card ─────────────────────────────────────────────────

interface StageCardProps {
  stage: RoadmapDTO['stages'][number];
  index: number;
  totalStages: number;
}

function StageCard({ stage, index, totalStages }: StageCardProps) {
  const [papersOpen, setPapersOpen] = useState(false);

  const orderLabel =
    index === 0
      ? 'Beginner'
      : index === totalStages - 1
      ? 'Advanced'
      : 'Intermediate';

  const badgeClass =
    orderLabel === 'Beginner'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : orderLabel === 'Intermediate'
      ? 'bg-amber-50 text-amber-700 border-amber-100'
      : 'bg-rose-50 text-rose-700 border-rose-100';

  return (
    <div className="w-full max-w-[640px] bg-white border border-slate-200 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Stage header */}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Stage order bubble */}
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0">
              {stage.order}
            </span>
            <h3 className="font-hanken font-bold text-slate-800 text-sm md:text-base leading-snug">
              {stage.title}
            </h3>
          </div>
          <span
            className={`font-mono text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase border flex-shrink-0 ${badgeClass}`}
          >
            {orderLabel}
          </span>
        </div>

        <p className="font-inter text-xs text-slate-500 leading-relaxed text-justify">
          {stage.description}
        </p>

        {/* Papers toggle */}
        {stage.papers && stage.papers.length > 0 && (
          <button
            type="button"
            onClick={() => setPapersOpen((v) => !v)}
            className="flex items-center gap-1.5 text-primary font-inter text-xs font-semibold hover:underline self-start"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {papersOpen ? 'Hide' : 'Show'} {stage.papers.length} recommended{' '}
            {stage.papers.length === 1 ? 'paper' : 'papers'}
            {papersOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Papers list */}
      {papersOpen && stage.papers && stage.papers.length > 0 && (
        <div className="px-5 pb-5 border-t border-slate-50 pt-4 space-y-2.5">
          <p className="font-mono text-[9px] font-bold tracking-widest text-slate-400 uppercase">
            Relevant Papers
          </p>
          {stage.papers.map((paper) => (
            <StagePaperCard key={paper.paperId} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sub-component: Skeleton loader ───────────────────────────────────────────

function StageSkeleton() {
  return (
    <div className="w-full max-w-[640px] bg-white border border-slate-100 rounded-xl p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-slate-100" />
        <div className="h-4 bg-slate-100 rounded w-48" />
      </div>
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-4/5" />
    </div>
  );
}

// ── Sub-component: Empty state ────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="py-16 flex flex-col items-center gap-3 select-none">
      <MapIcon className="w-10 h-10 text-slate-200" />
      <p className="font-inter font-semibold text-sm text-slate-400 text-center max-w-[260px]">
        Select a roadmap from the sidebar, or generate a new one above.
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type ActiveView =
  | { type: 'selected'; id: string }
  | { type: 'generated'; roadmap: RoadmapDTO }
  | null;

export default function ResearchRoadmaps() {
  const queryClient = useQueryClient();
  const [requestText, setRequestText] = useState('');
  const [activeView, setActiveView] = useState<ActiveView>(null);

  // ── Fetch sidebar list ──────────────────────────────────────
  const {
    data: roadmapList,
    isLoading: isListLoading,
    isError: isListError,
  } = useQuery<RoadmapShort[]>({
    queryKey: ['roadmaps'],
    queryFn: getAllRoadmaps,
  });

  // ── Fetch selected roadmap detail ───────────────────────────
  const selectedId =
    activeView?.type === 'selected' ? activeView.id : undefined;

  const {
    data: selectedRoadmap,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useQuery<RoadmapDTO>({
    queryKey: ['roadmap', selectedId],
    queryFn: () => getRoadmapById(selectedId!),
    enabled: !!selectedId,
  });

  // ── Generate mutation ───────────────────────────────────────
  const generateMutation = useMutation({
    mutationFn: (request: string) => generateRoadmap(request),
    onSuccess: (data) => {
      setActiveView({ type: 'generated', roadmap: data });
      setRequestText('');
      toast.success('Roadmap generated!', {
        description: `"${data.title}" is ready to explore.`,
      });
      // Refresh the sidebar list so the new roadmap appears
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        'Failed to generate roadmap. Please try again.';
      toast.error('Generation failed', { description: msg });
    },
  });

  const handleGenerate = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!requestText.trim()) {
      toast.info('Enter a topic first', {
        description: 'E.g. "Transformer architectures", "Diffusion models"',
      });
      return;
    }
    generateMutation.mutate(requestText.trim());
  };

  const handleSelectRoadmap = (id: string) => {
    setActiveView({ type: 'selected', id });
  };

  // Determine what to show in the main panel
  const displayRoadmap: RoadmapDTO | undefined =
    activeView?.type === 'generated'
      ? activeView.roadmap
      : activeView?.type === 'selected'
      ? selectedRoadmap
      : undefined;

  const isMainLoading =
    generateMutation.isPending ||
    (activeView?.type === 'selected' && isDetailLoading);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-100/50">
      {/* ── Left Column: Main Workspace ────────────────────── */}
      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-y-auto">
        <div className="p-6 md:p-8 max-w-[800px] mx-auto w-full space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-hanken font-bold text-2xl md:text-3xl text-slate-900 leading-none">
              Research Roadmaps
            </h1>
            <p className="font-inter text-xs text-slate-400 mt-1.5">
              Transform complex research topics into structured, AI-generated
              learning journeys — each stage enriched with relevant papers.
            </p>
          </div>

          {/* Generator input */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] space-y-3">
            <p className="font-mono text-[9px] font-bold tracking-widest text-slate-400 uppercase select-none">
              Generate a New Roadmap
            </p>
            <form onSubmit={handleGenerate} className="flex gap-3">
              <div className="relative flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary animate-pulse flex-shrink-0" />
                <input
                  type="text"
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  placeholder="e.g. Retrieval Augmented Generation, Transformer Architectures…"
                  disabled={generateMutation.isPending}
                  className="flex-1 bg-transparent font-inter text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none min-w-0 pr-2 disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={generateMutation.isPending}
                className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-lg bg-deep-indigo hover:bg-primary text-white font-inter font-semibold text-xs md:text-sm transition-all duration-150 shadow active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none flex-shrink-0"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Building…
                  </>
                ) : (
                  <>
                    Build Roadmap
                    <Zap className="w-3.5 h-3.5 fill-white text-white" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active roadmap title banner */}
          {displayRoadmap && (
            <div className="flex items-center gap-4 select-none">
              <div className="h-[1px] bg-slate-200 flex-1" />
              <div className="text-center">
                <h2 className="font-hanken font-bold text-lg text-primary leading-none">
                  {displayRoadmap.title}
                </h2>
                {displayRoadmap.topic && (
                  <span className="font-mono text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                    {displayRoadmap.topic}
                  </span>
                )}
              </div>
              <div className="h-[1px] bg-slate-200 flex-1" />
            </div>
          )}

          {/* Description */}
          {displayRoadmap?.description && (
            <p className="font-inter text-sm text-slate-500 leading-relaxed text-justify -mt-2">
              {displayRoadmap.description}
            </p>
          )}

          {/* ── Main content area ─────────────────────────── */}
          <div className="flex flex-col items-center gap-1">
            {isMainLoading ? (
              /* Loading skeleton */
              <div className="w-full flex flex-col items-center gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-full flex flex-col items-center">
                    <StageSkeleton />
                    {i < 3 && <div className="w-[1.5px] h-8 bg-slate-200 my-1" />}
                  </div>
                ))}
              </div>
            ) : isDetailError ? (
              /* Error state */
              <div className="py-12 flex flex-col items-center gap-3 text-center">
                <AlertCircle className="w-8 h-8 text-rose-300" />
                <p className="font-inter text-sm font-semibold text-slate-400">
                  Failed to load roadmap. Please try again.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: ['roadmap', selectedId],
                    })
                  }
                  className="font-inter text-xs text-primary underline"
                >
                  Retry
                </button>
              </div>
            ) : displayRoadmap?.stages && displayRoadmap.stages.length > 0 ? (
              /* Stage flow */
              displayRoadmap.stages.map((stage, index) => (
                <div key={`${stage.order}-${stage.title}`} className="w-full flex flex-col items-center">
                  <StageCard
                    stage={stage}
                    index={index}
                    totalStages={displayRoadmap.stages.length}
                  />
                  {index < displayRoadmap.stages.length - 1 && (
                    <div className="w-[1.5px] h-8 bg-slate-200 my-1" />
                  )}
                </div>
              ))
            ) : (
              /* Empty / no selection */
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      {/* ── Right Column: Sidebar ─────────────────────────── */}
      <div className="w-[280px] flex-shrink-0 h-full bg-white border-l border-slate-200 flex flex-col overflow-y-auto select-none">
        {/* Section header */}
        <div className="p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-hanken font-bold text-sm text-slate-900 leading-none">
            All Roadmaps
          </h3>
          <p className="font-inter text-[10px] text-slate-400 mt-1">
            Click to view a saved roadmap
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Loading state */}
          {isListLoading && (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-100 p-3 space-y-2 animate-pulse"
                >
                  <div className="h-3 bg-slate-100 rounded w-4/5" />
                  <div className="h-2.5 bg-slate-100 rounded w-3/5" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {isListError && (
            <div className="p-4 text-center">
              <p className="font-inter text-xs text-slate-400">
                Could not load roadmaps.
              </p>
              <button
                type="button"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ['roadmaps'] })
                }
                className="font-inter text-xs text-primary underline mt-1"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty list */}
          {!isListLoading && !isListError && roadmapList?.length === 0 && (
            <div className="p-4 text-center">
              <Bookmark className="w-6 h-6 text-slate-200 mx-auto mb-2" />
              <p className="font-inter text-xs text-slate-400">
                No roadmaps yet. Generate your first one!
              </p>
            </div>
          )}

          {/* Roadmap list */}
          {!isListLoading && !isListError && roadmapList && roadmapList.length > 0 && (
            <div className="p-3 space-y-2">
              {roadmapList.map((rm) => {
                const isActive =
                  (activeView?.type === 'selected' && activeView.id === rm.id) ||
                  (activeView?.type === 'generated' &&
                    activeView.roadmap.title === rm.title);
                return (
                  <button
                    key={rm.id}
                    type="button"
                    onClick={() => handleSelectRoadmap(rm.id)}
                    className={`w-full p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isActive
                        ? 'border-primary bg-indigo-50/30 shadow-sm'
                        : 'border-slate-100 hover:border-indigo-100 hover:bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Bookmark
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          isActive ? 'text-primary fill-primary' : 'text-slate-300'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-hanken font-semibold text-slate-800 text-xs leading-snug truncate">
                          {rm.title}
                        </h4>
                        <span className="font-mono text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                          {rm.topic}
                        </span>
                        {rm.description && (
                          <p className="font-inter text-[10px] text-slate-400 mt-1 line-clamp-2 leading-snug">
                            {rm.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* AI tip footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-3 space-y-1">
            <span className="font-mono text-[8.5px] font-bold tracking-widest text-primary uppercase">
              AI Tip
            </span>
            <p className="font-inter text-[11px] text-slate-600 leading-normal italic">
              "Each stage's papers are semantically matched by the AI — they are
              the most relevant works from the global research database."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
