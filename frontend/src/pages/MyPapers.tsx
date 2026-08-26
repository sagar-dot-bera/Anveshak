import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Search,
  Trash2,
  MessageSquare,
  Plus,
  BookOpen,
  Users,
  Loader2,
  AlertCircle,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { listPapers, deletePaper } from '@/api/papersApi';
import type { ResearchPaperResponse } from '@/lib/types';

export default function MyPapers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [paperToDelete, setPaperToDelete] = useState<ResearchPaperResponse | null>(null);

  const { data: papers, isLoading, isError, refetch } = useQuery({
    queryKey: ['papers'],
    queryFn: listPapers,
  });

  const deleteMutation = useMutation({
    mutationFn: (paperId: string) => deletePaper(paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      toast.success('Paper deleted', {
        description: 'The paper has been removed from your library.',
      });
      setPaperToDelete(null);
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.msg || err.response?.data?.error || 'Failed to delete paper.';
      toast.error('Deletion failed', { description: errMsg });
    },
  });

  // Extract all categories/keywords across papers for filter tabs
  const allCategories = Array.from(
    new Set(
      (papers || [])
        .flatMap((p) => p.keywords || [])
        .filter(Boolean)
        .map((k) => k.toUpperCase())
    )
  );

  // Filter papers based on search and category filter
  const filteredPapers = (papers || []).filter((paper) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors?.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      paper.keywords?.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
      paper.abstractText?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' ||
      paper.keywords?.some((k) => k.toUpperCase() === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#f7f9fb]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-deep-indigo" />
          <p className="font-inter text-sm text-slate-500 font-medium">Loading your paper library...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-hanken font-bold text-slate-900">Failed to load library</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">Could not retrieve your saved papers.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-deep-indigo hover:bg-primary text-white text-xs font-semibold rounded-lg shadow"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1440px] space-y-6">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-deep-indigo">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="font-hanken font-bold text-2xl md:text-3xl text-slate-900 leading-none">
              My Library
            </h1>
          </div>
          <p className="font-inter text-sm text-slate-500 mt-2">
            Manage, read, and chat with all {papers?.length || 0} papers saved in your personal research collection.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-deep-indigo hover:bg-primary text-white font-inter text-xs font-semibold shadow-md transition-all active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Paper</span>
        </Link>
      </div>

      {/* ── Search & Filter Bar ──────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search papers by title, author, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary font-inter"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-deep-indigo text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
            }`}
          >
            All ({papers?.length || 0})
          </button>
          {allCategories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-deep-indigo text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Papers Grid ─────────────────────────────────────────── */}
      {filteredPapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Publication year badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-deep-indigo bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase">
                    {paper.publicationYear || 'N/A'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Added {new Date(paper.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-hanken font-bold text-base text-slate-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {paper.title}
                </h3>

                {/* Authors */}
                {paper.authors && paper.authors.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-inter">
                    <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{paper.authors.join(', ')}</span>
                  </div>
                )}

                {/* Abstract Preview */}
                <p className="font-inter text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {paper.abstractText || 'No abstract text available.'}
                </p>

                {/* Keywords Tags */}
                {paper.keywords && paper.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {paper.keywords.slice(0, 3).map((kw) => (
                      <span
                        key={kw}
                        className="font-mono text-[9px] font-semibold text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded uppercase"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/talk-to-paper?paperId=${paper.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-deep-indigo font-inter text-xs font-semibold transition-colors border border-indigo-100"
                    title="Read & Chat with this paper"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Talk to Paper</span>
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setPaperToDelete(paper)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                  title="Delete paper from library"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-hanken font-bold text-base text-slate-900">
            {searchQuery ? 'No matching papers found' : 'Your library is empty'}
          </h3>
          <p className="font-inter text-xs text-slate-500 mt-1 mb-5">
            {searchQuery
              ? `No papers in your collection matched "${searchQuery}".`
              : 'Upload a PDF or import papers directly from Semantic Search or Research Roadmaps.'}
          </p>
          {!searchQuery && (
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-deep-indigo hover:bg-primary text-white font-inter text-xs font-semibold shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Paper</span>
            </Link>
          )}
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────── */}
      {paperToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-hanken font-bold text-lg text-slate-900">Delete Paper</h3>
                <p className="font-inter text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 font-inter text-xs text-slate-700">
              <p className="font-semibold text-slate-900 mb-1 line-clamp-1">{paperToDelete.title}</p>
              <p className="text-slate-500 text-[11px]">
                Deleting this paper will remove its text chunks, embeddings, AI summaries, and chat history.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaperToDelete(null)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-inter text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(paperToDelete.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-inter text-xs font-semibold shadow transition-all disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
