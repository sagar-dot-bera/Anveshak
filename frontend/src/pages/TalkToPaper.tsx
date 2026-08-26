import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Download,
  Send,
  Loader2,
  FileText,
  MessageSquare,
  BookOpen,
  ArrowLeft,
  Calendar,
  User,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { listPapers, downloadPaperPdf } from '@/api/papersApi';
import {
  listChatSessions,
  createChatSession,
  listChatMessages,
  sendMessage,
} from '@/api/chatApi';
import type { ResearchPaperResponse } from '@/lib/types';
import PdfViewer from '@/components/common/PdfViewer';

export default function TalkToPaper() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const paperIdParam = searchParams.get('paperId');
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaperResponse | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pdf' | 'metadata'>('pdf');
  const [inputValue, setInputValue] = useState('');
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch all papers
  const { data: papers, isLoading: isPapersLoading } = useQuery({
    queryKey: ['papers'],
    queryFn: listPapers,
  });

  // Fetch all chat sessions
  const { data: chatSessions, refetch: refetchSessions } = useQuery({
    queryKey: ['chatSessions'],
    queryFn: listChatSessions,
  });

  // Fetch messages if session is active
  const { data: serverMessages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['chatMessages', activeSessionId],
    queryFn: () => listChatMessages(activeSessionId!),
    enabled: !!activeSessionId,
  });

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [serverMessages, pendingUserMessage]);

  // Synchronize paperIdParam from search URL
  useEffect(() => {
    if (papers && paperIdParam) {
      const matchedPaper = papers.find((p) => p.id === paperIdParam);
      if (matchedPaper) {
        if (!selectedPaper || selectedPaper.id !== matchedPaper.id) {
          setSelectedPaper(matchedPaper);
          setActiveTab('pdf'); // reset to default tab when changing paper
          
          // Check if an existing session already exists for this paper
          const existingSession = chatSessions?.find((s) => s.paperId === matchedPaper.id);
          if (existingSession) {
            setActiveSessionId(existingSession.sessionId);
          } else {
            // Start a new session
            startSessionMutation.mutate(matchedPaper.id);
          }
        }
      } else {
        // If the paperId is invalid or not in papers list, reset URL
        setSelectedPaper(null);
        setActiveSessionId(null);
        setSearchParams({});
      }
    } else if (papers && !paperIdParam) {
      // If paperId query parameter is empty/removed, clear selection
      setSelectedPaper(null);
      setActiveSessionId(null);
    }
  }, [papers, paperIdParam, chatSessions]);

  // Mutation to start/create a session
  const startSessionMutation = useMutation({
    mutationFn: (paperId: string) => createChatSession(paperId),
    onSuccess: (data) => {
      refetchSessions();
      setActiveSessionId(data.sessionId);
    },
    onError: (err) => {
      toast.error('Failed to start chat session');
      console.error(err);
    },
  });

  // Mutation to send a message
  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, text }: { sessionId: string; text: string }) =>
      sendMessage(sessionId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', activeSessionId] });
      setPendingUserMessage(null);
    },
    onError: (err) => {
      setPendingUserMessage(null);
      toast.error('Failed to send message');
      console.error(err);
    },
  });

  const handleSelectPaper = (paper: ResearchPaperResponse) => {
    setSearchParams({ paperId: paper.id });
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || !activeSessionId) return;
    setInputValue('');
    setPendingUserMessage(text);
    sendMessageMutation.mutate({
      sessionId: activeSessionId,
      text: text,
    });
  };

  const handleDownload = async () => {
    if (!selectedPaper) return;
    try {
      const blob = await downloadPaperPdf(selectedPaper.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedPaper.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Download started');
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const handleBackToLibrary = () => {
    setSearchParams({});
  };

  // Convert server messages list (ordered by newest first) to ascending order for display
  const displayMessages = serverMessages
    ? [...serverMessages].reverse()
    : [];

  if (isPapersLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#f7f9fb]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-deep-indigo border-t-transparent" />
          <p className="font-inter text-sm text-slate-500 font-medium">Loading your papers...</p>
        </div>
      </div>
    );
  }

  // ── Render Library Selection View ────────────────────────
  if (!selectedPaper) {
    return (
      <div className="p-6 md:p-8 max-w-[1440px] space-y-6 mx-auto h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div>
          <h1 className="font-hanken font-bold text-2xl md:text-3xl text-slate-900 leading-none">
            Talk to Paper
          </h1>
          <p className="font-inter text-sm text-slate-500 mt-2 max-w-xl">
            Select a research paper from your library to start an interactive Q&A session with the AI.
          </p>
        </div>

        {papers && papers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <div
                key={paper.id}
                onClick={() => handleSelectPaper(paper)}
                className="bg-white border border-slate-100 rounded-xl p-5 hover:border-indigo-200 hover:shadow-[0_4px_20px_-4px_rgba(79,70,229,0.08)] cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-primary group-hover:bg-deep-indigo group-hover:text-white transition-colors">
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
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center max-w-lg mx-auto mt-10">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-hanken font-bold text-slate-700 text-lg">No papers in library</h3>
            <p className="font-inter text-sm text-slate-400 mt-1">
              You need to upload at least one research paper to start a conversation.
            </p>
            <Link
              to="/upload"
              className="mt-5 inline-flex items-center gap-2 py-2 px-4 rounded-lg bg-deep-indigo hover:bg-primary text-white font-inter font-semibold text-sm transition-all animate-bounce"
            >
              Upload Paper
            </Link>
          </div>
        )}
      </div>
    );
  }

  // ── Render Chat & Paper Split View ─────────────────────
  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-100/50">
      {/* ── Left Column: Paper overview ───────────────── */}
      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] border-r border-slate-200">
        {/* Toolbar */}
        <div className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between flex-shrink-0 select-none">
          <button
            onClick={handleBackToLibrary}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-inter text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </button>

          {/* Tab Controller */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'pdf'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              PDF Document
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'metadata'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Abstract & Metadata
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-inter text-[11px] font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>

        {/* Paper Content Viewer */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col h-full">
          {activeTab === 'pdf' ? (
            <PdfViewer paperId={selectedPaper.id} />
          ) : (
            <div className="flex justify-center overflow-y-auto flex-1">
              <div className="w-full max-w-[760px] bg-white rounded-lg shadow-[0_4px_24px_-10px_rgba(0,0,0,0.1)] border border-slate-200 p-8 md:p-12 flex flex-col gap-6 text-slate-800">
                <div className="space-y-4">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-vibrant-blue bg-blue-50 border border-blue-100 rounded px-2.5 py-1">
                    PUBLISHED {selectedPaper.publicationYear}
                  </span>
                  <h2 className="text-xl md:text-2xl font-hanken font-bold text-slate-900 leading-snug">
                    {selectedPaper.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 text-xs font-inter text-slate-600">
                    <span className="font-semibold text-slate-700">Authors:</span>
                    <span>{selectedPaper.authors?.join(', ')}</span>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div className="space-y-2">
                  <h3 className="font-hanken font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Abstract / Context
                  </h3>
                  <p className="font-inter text-sm leading-relaxed text-slate-600 text-justify">
                    {selectedPaper.abstractText || 'No abstract text extracted.'}
                  </p>
                </div>

                {selectedPaper.keywords && selectedPaper.keywords.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-hanken font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-4 h-4 text-slate-400" />
                      Keywords
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPaper.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200/60 rounded px-2 py-0.5 uppercase"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Column: AI Chat Panel ─────────────────── */}
      <div className="w-[420px] flex-shrink-0 h-full bg-white border-l border-slate-200 flex flex-col">
        {/* Chat Header */}
        <div className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between flex-shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success-green flex-shrink-0 animate-pulse" />
            <span className="font-mono text-[9px] font-bold tracking-wider text-slate-600 uppercase truncate max-w-[280px]">
              CHAT SESSION
            </span>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isMessagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : displayMessages.length > 0 ? (
            displayMessages.map((msg, idx) => {
              const isAi = msg.role === 'assistant';
              return (
                <div key={idx} className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                  {isAi ? (
                    <div className="w-full space-y-1.5 text-left">
                      <div className="flex items-center gap-1.5 pl-1">
                        <div className="w-4.5 h-4.5 rounded bg-deep-indigo text-white flex items-center justify-center font-bold text-[9px]">
                          A
                        </div>
                        <span className="font-mono text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                          Anveshak AI
                        </span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 max-w-[95%] shadow-[0_1px_4px_-1px_rgba(0,0,0,0.03)] text-slate-800">
                        <div className="font-inter text-sm leading-relaxed prose prose-sm prose-slate max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => <h1 className="text-base font-bold text-slate-900 mt-3 mb-1 first:mt-0">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-sm font-bold text-slate-800 mt-2.5 mb-1 first:mt-0">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-700 mt-2 mb-0.5 first:mt-0">{children}</h3>,
                              p: ({ children }) => <p className="mb-2 last:mb-0 text-slate-800 leading-relaxed">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5 text-slate-700">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5 text-slate-700">{children}</ol>,
                              li: ({ children }) => <li className="text-sm leading-snug">{children}</li>,
                              code: ({ inline, children }: any) =>
                                inline ? (
                                  <code className="bg-indigo-50 text-primary font-mono text-xs px-1 py-0.5 rounded border border-indigo-100">{children}</code>
                                ) : (
                                  <pre className="bg-slate-900 text-slate-100 font-mono text-xs p-3 rounded-lg overflow-x-auto my-2 border border-slate-700"><code>{children}</code></pre>
                                ),
                              strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                              em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
                              blockquote: ({ children }) => <blockquote className="border-l-2 border-indigo-300 pl-3 my-2 text-slate-600 italic">{children}</blockquote>,
                              hr: () => <hr className="border-slate-200 my-3" />,
                              a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{children}</a>,
                            }}
                          >
                            {msg.message}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%] space-y-1">
                      <div className="bg-deep-indigo border border-indigo-600 rounded-xl px-4 py-3 text-white text-left shadow-[0_2px_8px_-2px_rgba(79,70,229,0.06)] font-inter text-sm leading-relaxed">
                        {msg.message}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
              <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
              <p className="font-inter text-sm font-medium">Start conversation</p>
              <p className="font-inter text-xs text-slate-400 mt-1 max-w-[200px]">
                Ask questions about the paper methodology, dataset, or conclusions.
              </p>
            </div>
          )}

          {sendMessageMutation.isPending && (
            <>
              {pendingUserMessage && (
                <div className="flex flex-col items-end">
                  <div className="max-w-[85%] space-y-1">
                    <div className="bg-deep-indigo border border-indigo-600 rounded-xl px-4 py-3 text-white text-left shadow-[0_2px_8px_-2px_rgba(79,70,229,0.06)] font-inter text-sm leading-relaxed">
                      {pendingUserMessage}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col items-start space-y-1.5">
                <div className="flex items-center gap-1.5 pl-1">
                  <div className="w-4.5 h-4.5 rounded bg-deep-indigo text-white flex items-center justify-center font-bold text-[9px]">
                    A
                  </div>
                  <span className="font-mono text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                    Anveshak AI
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-[0_1px_4px_-1px_rgba(0,0,0,0.03)] text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  <span className="font-inter text-xs">Analyzing paper content...</span>
                </div>
              </div>
            </>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
        <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2.5 bg-deep-indigo rounded-xl px-4 py-2.5 shadow-[0_4px_20px_-4px_rgba(49,46,129,0.3)]">
            {/* Input field */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={sendMessageMutation.isPending}
              placeholder="Ask a question about this paper..."
              className="flex-1 bg-transparent font-inter text-sm text-white placeholder:text-indigo-300/70 focus:outline-none min-w-0 disabled:opacity-50"
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={sendMessageMutation.isPending || !inputValue.trim()}
              className="w-7 h-7 rounded-lg bg-white text-deep-indigo hover:bg-indigo-50 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
