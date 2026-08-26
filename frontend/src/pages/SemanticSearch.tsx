import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  TrendingUp,
  Brain,
  Leaf,
  Dna,
  FileText,
  Sliders,
  Database,
  Globe,
  ExternalLink,
  Plus,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { searchPapersLocal, searchPapersGlobal, importPaperToLibrary } from '@/api/papersApi';
import type { ResearchPaperResponse, GlobalPaperResponse } from '@/lib/types';
import {
  mockTrendingTopics,
} from '@/data/semanticSearchMockData';

const iconMap = {
  Brain,
  Leaf,
  Dna,
};

const iconColorMap = {
  Brain: 'bg-purple-100 text-purple-600',
  Leaf: 'bg-emerald-100 text-emerald-600',
  Dna: 'bg-blue-100 text-blue-600',
};

export default function SemanticSearch() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [similarity, setSimilarity] = useState(0.20);
  const [topK, setTopK] = useState(20);
  const [dataSource, setDataSource] = useState<'Library' | 'Global'>('Library');
  const [results, setResults] = useState<
    | { type: 'Library'; data: ResearchPaperResponse[] }
    | { type: 'Global'; data: GlobalPaperResponse[] }
    | null
  >(null);
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});
  const [importedPapers, setImportedPapers] = useState<Record<string, boolean>>({});
  const [loadingPaperId, setLoadingPaperId] = useState<string | null>(null);

  const importMutation = useMutation({
    mutationFn: (paper: any) => importPaperToLibrary(paper),
    onSuccess: (res, variables) => {
      setImportedPapers((prev) => ({ ...prev, [variables.paperId || variables.title]: true }));
      setLoadingPaperId(null);
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
      setLoadingPaperId(null);
      const errMsg = err.response?.data?.message || err.response?.data?.msg || err.response?.data?.error || 'Failed to import paper.';
      toast.error('Import failed', { description: errMsg });
    },
  });

  const toggleAbstract = (paperId: string) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [paperId]: !prev[paperId],
    }));
  };

  const searchMutation = useMutation({
    mutationFn: async ({ query, source }: { query: string; source: 'Library' | 'Global' }) => {
      if (source === 'Global') {
        const data = await searchPapersGlobal(query, topK, similarity);
        return { type: 'Global' as const, data };
      } else {
        const data = await searchPapersLocal(query, similarity);
        return { type: 'Library' as const, data };
      }
    },
    onSuccess: (res) => {
      setResults(res);
      toast.success('Semantic Search Completed', {
        description: `Found ${res.data.length} concepts in ${
          res.type === 'Global' ? 'global index' : 'library'
        } matching query.`,
      });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.msg || err.response?.data?.error || 'Semantic search failed.';
      toast.error('Search failed', { description: errMsg });
    },
  });

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      toast.info('Describe a research concept first!', {
        description: 'E.g., "Genomics sequence analysis on hybrid hardware"',
      });
      return;
    }

    searchMutation.mutate({ query: searchQuery, source: dataSource });
  };

  const handleTopicClick = (topicTitle: string) => {
    setSearchQuery(topicTitle);
    searchMutation.mutate({ query: topicTitle, source: dataSource });
  };

  return (
    <div className="px-6 md:px-8 pt-8 pb-12 max-w-[1200px] mx-auto space-y-8">
      
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="text-center space-y-2">
        <h1 className="font-hanken font-bold text-3xl md:text-4xl text-slate-900 tracking-tight leading-none">
          Semantic Search
        </h1>
        <p className="font-inter text-slate-500 text-sm max-w-lg mx-auto">
          Discover papers based on conceptual meaning, not just keywords.
        </p>
      </div>

      {/* ── Search Form ──────────────────────────────────────── */}
      <form onSubmit={handleSearch} className="space-y-5">
        
        {/* Input Bar */}
        <div className="relative bg-white border border-slate-200 rounded-2xl shadow-[0_4px_30px_-5px_rgba(0,0,0,0.05)] p-2.5 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0 ml-3 animate-pulse" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Describe the concept or research area you're exploring..."
            className="flex-1 bg-transparent font-inter text-sm md:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none min-w-0 pr-4"
          />
          <button
            type="submit"
            disabled={searchMutation.isPending}
            className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-deep-indigo hover:bg-primary text-white font-inter font-semibold text-sm transition-all duration-200 shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex-shrink-0"
          >
            {searchMutation.isPending ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Filters & Parameters Row */}
        <div className="bg-white border border-slate-100 rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)] select-none">
          
          {/* Similarity Threshold Slider */}
          <div className="flex items-center gap-4 flex-1 min-w-[240px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Sliders className="w-4 h-4 text-slate-400" />
              <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
                Similarity Threshold
              </span>
            </div>
            <div className="flex items-center gap-3 flex-1">
              <input
                type="range"
                min="0.00"
                max="0.80"
                step="0.05"
                value={similarity}
                onChange={(e) => setSimilarity(parseFloat(e.target.value))}
                className="flex-1 accent-deep-indigo h-1 bg-slate-100 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-xs font-semibold text-vibrant-blue bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5 min-w-[40px] text-center">
                {similarity.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Top-K Results */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Sliders className="w-4 h-4 text-slate-400" />
              <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
                Top-K Results
              </span>
            </div>
            <div className="flex items-center bg-slate-100/80 border border-slate-200/50 rounded-lg p-0.5">
              {[20, 50, 100].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTopK(k)}
                  className={`px-3 py-1 font-mono text-xs font-semibold rounded-md transition-all ${
                    topK === k
                      ? 'bg-white text-deep-indigo shadow-sm'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Data Source Toggle Switch */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-4 h-4 text-slate-400" />
              <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
                Data Source
              </span>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
              <span className={`font-inter text-xs font-semibold transition-colors ${
                dataSource === 'Library' ? 'text-deep-indigo' : 'text-slate-400'
              }`}>
                My Library
              </span>
              
              {/* Switch */}
              <button
                type="button"
                onClick={() => setDataSource((s) => s === 'Library' ? 'Global' : 'Library')}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                  dataSource === 'Global' ? 'bg-deep-indigo' : 'bg-slate-300'
                }`}
                aria-label="Toggle Data Source"
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
                  dataSource === 'Global' ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>

              <span className={`font-inter text-xs font-semibold transition-colors ${
                dataSource === 'Global' ? 'text-deep-indigo' : 'text-slate-400'
              }`}>
                Global Research
              </span>
            </div>
          </div>

        </div>
      </form>

      {/* ── Search Results Section ─────────────────────────── */}
      {results && (
        <div className="space-y-4 text-left animate-fadeIn">
          <h2 className="font-hanken font-semibold text-lg text-slate-900 px-1">
            Search Results
          </h2>
          <div className="space-y-4">
            {results.data.length > 0 ? (
              results.type === 'Library' ? (
                (results.data as ResearchPaperResponse[]).map((res) => (
                  <div
                    key={res.id}
                    className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow flex flex-col gap-3 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-11 bg-slate-50 border border-slate-200 rounded flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                          <FileText className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h3 className="font-hanken font-semibold text-slate-800 text-sm md:text-base leading-snug group-hover:text-primary transition-colors">
                            {res.title}
                          </h3>
                          <p className="font-inter text-xs text-slate-400 mt-1">
                            {res.authors?.join(', ')} &bull; Published {res.publicationYear}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="font-inter text-xs leading-relaxed text-slate-500 text-justify line-clamp-3">
                      {res.abstractText || 'No abstract text available.'}
                    </p>

                    {res.keywords && res.keywords.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap pt-1 border-t border-slate-50 mt-1">
                        {res.keywords.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[9px] font-semibold tracking-wider text-slate-500 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-full uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                (results.data as GlobalPaperResponse[]).map((res) => {
                  const categoriesList = res.categories
                    ? res.categories.split(/[\s,]+/).filter(Boolean)
                    : [];
                  return (
                    <div
                      key={res.paperId}
                      className="relative bg-white border border-slate-100 rounded-xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-md hover:border-blue-200/60 transition-all flex flex-col gap-3 group overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-500"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-11 bg-blue-50/50 border border-blue-100/60 rounded flex items-center justify-center text-blue-500 group-hover:bg-blue-100/40 group-hover:border-blue-200 transition-colors flex-shrink-0">
                            <Globe className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h3 className="font-hanken font-semibold text-slate-800 text-sm md:text-base leading-snug group-hover:text-blue-600 transition-colors">
                              {res.title}
                            </h3>
                            <p className="font-inter text-xs text-slate-400 mt-1">
                              {res.authors} &bull; Published {res.created ? new Date(res.created).getFullYear() : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 animate-fadeIn">
                          <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-200/50 rounded px-1.5 py-0.5">
                            arXiv:{res.paperId}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`font-inter text-xs leading-relaxed text-slate-500 text-justify cursor-pointer hover:text-slate-700 transition-colors ${
                          expandedAbstracts[res.paperId] ? '' : 'line-clamp-3'
                        }`}
                        onClick={() => toggleAbstract(res.paperId)}
                        title="Click to toggle abstract expansion"
                      >
                        {res.abstractText || 'No abstract text available.'}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-50 mt-1">
                        {/* Tags / Categories */}
                        <div className="flex gap-1.5 flex-wrap">
                          {res.category && (
                            <span className="font-mono text-[9px] font-bold tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase">
                              {res.category}
                            </span>
                          )}
                          {categoriesList.map((tag) => (
                            <span
                              key={tag}
                              className="font-mono text-[9px] font-semibold tracking-wider text-slate-500 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-full uppercase"
                            >
                              {tag}
                            </span>
                          ))}
                          {res.license && (
                            <span className="font-mono text-[9px] font-semibold tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
                              {res.license.replace(/https?:\/\/creativecommons.org\/licenses\//, 'CC ').replace(/\/$/, '')}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {res.doi && (
                            <a
                              href={`https://doi.org/${res.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-blue-50/50 border border-slate-200/50 px-2 py-0.5 rounded"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>DOI: {res.doi}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors px-2.5 py-1 rounded border ${
                              expandedAbstracts[res.paperId]
                                ? 'text-deep-indigo bg-indigo-50 border-indigo-200'
                                : 'text-slate-500 bg-slate-50 border-slate-200/60 hover:bg-slate-100 hover:text-slate-700'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAbstract(res.paperId);
                            }}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{expandedAbstracts[res.paperId] ? 'Hide Abstract' : 'Abstract'}</span>
                          </button>
                          {(res.paperUrl || res.paperId) && (
                            <a
                              href={res.paperUrl || `https://arxiv.org/abs/${res.paperId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors px-2.5 py-1 rounded bg-slate-50 border border-slate-200/60 hover:bg-slate-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Globe className="w-3.5 h-3.5 text-slate-400" />
                              <span>Paper Page</span>
                            </a>
                          )}
                          <a
                            href={`https://arxiv.org/pdf/${res.paperId}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors px-2.5 py-1 rounded bg-blue-50/50 hover:bg-blue-100/50 border border-blue-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span>PDF</span>
                          </a>
                          {(() => {
                            const isImported = importedPapers[res.paperId || res.title];
                            const isLoading = loadingPaperId === (res.paperId || res.title);

                            if (isImported) {
                              return (
                                <button
                                  type="button"
                                  disabled
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded opacity-90 cursor-default"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>In Library</span>
                                </button>
                              );
                            }

                            return (
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const pId = res.paperId || res.title;
                                  setLoadingPaperId(pId);
                                  importMutation.mutate({
                                    paperId: res.paperId,
                                    title: res.title,
                                    authors: res.authors,
                                    categories: res.categories || res.category,
                                    pdfUrl: res.paperUrl,
                                    abstractText: res.abstractText,
                                    publicationYear: res.created ? new Date(res.created).getFullYear() : undefined,
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 shadow-sm disabled:opacity-75"
                                title="Add this paper to your library"
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                                    <span>Adding...</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Add to Library</span>
                                  </>
                                )}
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              <div className="bg-white border border-slate-100 rounded-xl p-10 text-center text-slate-400">
                <p className="font-inter text-sm">
                  {results.type === 'Library'
                    ? 'No conceptual matches found in library.'
                    : 'No conceptual matches found in global index.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Trending Section ────────────────────────────────── */}
      <div className="space-y-4 text-left pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-900" />
            <h2 className="font-hanken font-semibold text-lg text-slate-900">
              Trending Research Topics
            </h2>
          </div>
          <button
            onClick={() => toast.info('View all semantic clusters — coming soon.')}
            className="font-inter text-xs font-semibold text-vibrant-blue hover:text-primary transition-colors"
          >
            View all clusters
          </button>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {mockTrendingTopics.map((topic) => {
            const Icon = iconMap[topic.icon];
            const iconBg = iconColorMap[topic.icon];
            return (
              <div
                key={topic.id}
                onClick={() => handleTopicClick(topic.title)}
                className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-md hover:border-indigo-200/50 transition-all cursor-pointer flex flex-col justify-between min-h-[190px] group"
              >
                <div className="space-y-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-hanken font-semibold text-slate-800 text-sm md:text-base leading-snug group-hover:text-primary transition-colors">
                    {topic.title}
                  </h3>
                  <p className="font-inter text-xs text-slate-400 leading-normal line-clamp-3">
                    {topic.description}
                  </p>
                </div>

                <div className="flex gap-1.5 flex-wrap pt-3 mt-2 border-t border-slate-50">
                  {topic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[9px] font-semibold tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
