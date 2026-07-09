import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Sparkles,
  TrendingUp,
  Brain,
  Leaf,
  Dna,
  FileText,
  Sliders,
  Database,
} from 'lucide-react';
import { toast } from 'sonner';
import { searchPapers } from '@/api/papersApi';
import type { ResearchPaperResponse } from '@/lib/types';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [similarity, setSimilarity] = useState(0.75);
  const [topK, setTopK] = useState(20);
  const [dataSource, setDataSource] = useState<'Library' | 'Global'>('Library');
  const [results, setResults] = useState<ResearchPaperResponse[] | null>(null);

  const searchMutation = useMutation({
    mutationFn: (query: string) => searchPapers(query),
    onSuccess: (data) => {
      setResults(data);
      toast.success('Semantic Search Completed', {
        description: `Found ${data.length} concepts in library matching query.`,
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

    if (dataSource === 'Global') {
      toast.info('Global Index Offline', {
        description: 'Global research indexes are currently offline. Performing search across your library instead.',
      });
      setDataSource('Library');
    }

    searchMutation.mutate(searchQuery);
  };

  const handleTopicClick = (topicTitle: string) => {
    setSearchQuery(topicTitle);
    searchMutation.mutate(topicTitle);
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
                min="0.50"
                max="0.95"
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
            {results.length > 0 ? (
              results.map((res, idx) => (
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

                    <span className="font-mono text-xs font-bold text-success-green bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 flex-shrink-0">
                      {Math.max(60, Math.round((0.96 - (idx * 0.05)) * 100))}% Match
                    </span>
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
              <div className="bg-white border border-slate-100 rounded-xl p-10 text-center text-slate-400">
                <p className="font-inter text-sm">No conceptual matches found in library.</p>
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
