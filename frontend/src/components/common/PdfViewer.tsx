import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Download,
  Search,
  PanelLeft,
  Loader2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { downloadPaperPdf } from '@/api/papersApi';

// Set up PDF.js worker using jsdelivr CDN matching installed pdfjs-dist version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  paperId: string;
}

interface SearchMatch {
  pageNum: number;
  snippet: string;
}

export default function PdfViewer({ paperId }: PdfViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomMode, setZoomMode] = useState<'fit-width' | 'fit-page' | number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paperBlob, setPaperBlob] = useState<Blob | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF Blob and document
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setPdfDoc(null);
    setCurrentPage(1);

    const loadPdf = async () => {
      try {
        const blob = await downloadPaperPdf(paperId);
        if (!isMounted) return;
        setPaperBlob(blob);

        const arrayBuffer = await blob.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const doc = await loadingTask.promise;

        if (!isMounted) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setIsLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Error loading PDF document:', err);
        const errMsg = err.response?.data?.msg || err.response?.data?.error || err.message || 'Failed to render PDF document.';
        setError(errMsg);
        setIsLoading(false);
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [paperId]);

  // Calculate actual render scale based on zoomMode and viewport width
  const getRenderScale = useCallback(
    (page: pdfjsLib.PDFPageProxy): number => {
      const dpr = window.devicePixelRatio || 1;
      const unscaledViewport = page.getViewport({ scale: 1, rotation });

      if (zoomMode === 'fit-width' && viewportRef.current) {
        const availableWidth = viewportRef.current.clientWidth - 48;
        return (availableWidth / unscaledViewport.width) * dpr;
      }
      if (zoomMode === 'fit-page' && viewportRef.current) {
        const availableHeight = viewportRef.current.clientHeight - 48;
        return (availableHeight / unscaledViewport.height) * dpr;
      }
      if (typeof zoomMode === 'number') {
        return zoomMode * dpr;
      }
      return dpr;
    },
    [zoomMode, rotation]
  );

  // Render current page onto HTML5 canvas and text layer for selection
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || currentPage < 1 || currentPage > numPages) return;

    try {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(currentPage);
      const dpr = window.devicePixelRatio || 1;
      const scale = getRenderScale(page);
      const viewport = page.getViewport({ scale, rotation });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
      canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

      const renderContext = {
        canvasContext: ctx,
        viewport,
        canvas,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      // Render Text Layer for selecting and copying text natively
      if (textLayerRef.current) {
        const textLayerDiv = textLayerRef.current;
        textLayerDiv.innerHTML = '';
        textLayerDiv.style.width = `${Math.floor(viewport.width / dpr)}px`;
        textLayerDiv.style.height = `${Math.floor(viewport.height / dpr)}px`;

        try {
          const cssViewport = page.getViewport({ scale: scale / dpr, rotation });
          const textContent = await page.getTextContent();

          for (const item of textContent.items as any[]) {
            if (!item.str || item.str.trim() === '') continue;

            const tx = pdfjsLib.Util.transform(cssViewport.transform, item.transform);
            const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);

            const span = document.createElement('span');
            span.textContent = item.str;
            span.style.position = 'absolute';
            span.style.left = `${tx[4]}px`;
            span.style.top = `${tx[5] - fontHeight}px`;
            span.style.fontSize = `${fontHeight}px`;
            span.style.fontFamily = item.fontName || 'sans-serif';
            span.style.color = 'transparent';
            span.style.whiteSpace = 'pre';
            span.style.transformOrigin = '0% 0%';
            span.style.lineHeight = '1';
            span.style.userSelect = 'text';
            span.style.webkitUserSelect = 'text';
            span.className = 'select-text';

            textLayerDiv.appendChild(span);
          }
        } catch (e) {
          console.warn('Could not render text selection layer:', e);
        }
      }
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Error rendering page canvas:', err);
      }
    }
  }, [pdfDoc, currentPage, numPages, getRenderScale, rotation]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Handle Ctrl + Wheel / Trackpad pinch zoom
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        setZoomMode((prev) => {
          const currentScale = typeof prev === 'number' ? prev : 1.0;
          return Math.max(0.4, Math.min(4.0, Math.round((currentScale + delta) * 100) / 100));
        });
      }
    };

    vp.addEventListener('wheel', handleWheel, { passive: false });
    return () => vp.removeEventListener('wheel', handleWheel);
  }, []);

  // Handle Resize for responsive fit-width
  useEffect(() => {
    const handleResize = () => {
      if (zoomMode === 'fit-width' || zoomMode === 'fit-page') {
        renderPage();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [zoomMode, renderPage]);

  // Search logic across all pages
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfDoc || !searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setActiveMatchIndex(0);

    const queryLower = searchQuery.trim().toLowerCase();
    const matches: SearchMatch[] = [];

    try {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const fullText = textContent.items
          .map((item: any) => item.str)
          .join(' ');

        if (fullText.toLowerCase().includes(queryLower)) {
          const matchIdx = fullText.toLowerCase().indexOf(queryLower);
          const start = Math.max(0, matchIdx - 30);
          const end = Math.min(fullText.length, matchIdx + queryLower.length + 30);
          const snippet = (start > 0 ? '...' : '') + fullText.substring(start, end) + (end < fullText.length ? '...' : '');
          matches.push({ pageNum: i, snippet });
        }
      }

      setSearchResults(matches);
      if (matches.length > 0) {
        setCurrentPage(matches[0].pageNum);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const nextMatch = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % searchResults.length;
    setActiveMatchIndex(nextIdx);
    setCurrentPage(searchResults[nextIdx].pageNum);
  };

  const prevMatch = () => {
    if (searchResults.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + searchResults.length) % searchResults.length;
    setActiveMatchIndex(prevIdx);
    setCurrentPage(searchResults[prevIdx].pageNum);
  };

  // Page Navigation
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(numPages, prev + 1));

  // Zoom Controls
  const zoomIn = () => {
    setZoomMode((prev) => {
      const currentScale = typeof prev === 'number' ? prev : 1.0;
      return Math.min(4.0, Math.round((currentScale + 0.25) * 100) / 100);
    });
  };

  const zoomOut = () => {
    setZoomMode((prev) => {
      const currentScale = typeof prev === 'number' ? prev : 1.0;
      return Math.max(0.4, Math.round((currentScale - 0.25) * 100) / 100);
    });
  };

  const rotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Download PDF
  const handleDownload = () => {
    if (!paperBlob) return;
    const url = URL.createObjectURL(paperBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paper_${paperId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-950 p-8 rounded-xl border border-slate-800 min-h-[420px]">
        <Loader2 className="h-9 w-9 animate-spin text-primary mb-3" />
        <p className="font-inter text-sm text-slate-300 font-medium animate-pulse">
          Loading document into high-performance PDF reader...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-950 p-8 rounded-xl border border-red-900/50 text-center min-h-[420px]">
        <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
        <p className="font-inter text-sm text-red-300 font-medium mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-deep-indigo hover:bg-primary text-white text-xs font-semibold rounded-lg shadow transition-all cursor-pointer"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col h-full w-full bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800 text-slate-100 font-sans select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      }`}
    >
      {/* ── Top Toolbar (Theme-Matched Deep Indigo & Slate) ──────────── */}
      <header className="h-12 bg-deep-indigo/90 backdrop-blur-md border-b border-indigo-900/60 px-3 flex items-center justify-between flex-shrink-0 z-20">
        
        {/* Left Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          {/* Thumbnails Drawer Toggle */}
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            title="Toggle Thumbnails"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showThumbnails
                ? 'bg-primary text-white'
                : 'text-indigo-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            title="Search text in PDF"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showSearch
                ? 'bg-primary text-white'
                : 'text-indigo-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-indigo-800/80 mx-1" />

          {/* Page Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              title="Previous Page"
              className="p-1 rounded-md text-indigo-200 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 text-xs font-mono text-indigo-200 bg-slate-900/80 border border-indigo-900/60 rounded px-2 py-1">
              <input
                type="number"
                min={1}
                max={numPages}
                value={currentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val >= 1 && val <= numPages) setCurrentPage(val);
                }}
                className="w-8 bg-transparent text-center text-white focus:outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-indigo-400">/ {numPages}</span>
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              title="Next Page"
              className="p-1 rounded-md text-indigo-200 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={zoomOut}
            title="Zoom Out (-)"
            className="p-1.5 rounded-lg text-indigo-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="font-mono text-xs text-indigo-300 bg-slate-900/60 border border-indigo-900/50 rounded px-2.5 py-1 min-w-[52px] text-center select-none">
            {typeof zoomMode === 'number' ? `${Math.round(zoomMode * 100)}%` : zoomMode === 'fit-width' ? 'Width' : 'Page'}
          </span>

          <button
            onClick={zoomIn}
            title="Zoom In (+)"
            className="p-1.5 rounded-lg text-indigo-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={rotateClockwise}
            title="Rotate Clockwise"
            className="p-1.5 rounded-lg text-indigo-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 rounded-lg text-indigo-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <div className="h-4 w-[1px] bg-indigo-800/80 mx-1" />

          <button
            onClick={handleDownload}
            title="Download PDF"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/80 hover:bg-primary text-white font-inter text-xs font-medium transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </header>

      {/* ── Search Bar Drawer ────────────────────────────────────────── */}
      {showSearch && (
        <form
          onSubmit={handleSearch}
          className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-3 text-xs z-10"
        >
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Find in document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md pl-3 pr-8 py-1.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary font-inter"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                <span>
                  {activeMatchIndex + 1} of {searchResults.length} matches
                </span>
                <button
                  type="button"
                  onClick={prevMatch}
                  className="p-1 rounded hover:bg-slate-800 text-slate-300"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={nextMatch}
                  className="p-1 rounded hover:bg-slate-800 text-slate-300"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowSearch(false)}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* ── Main Viewport Split (Thumbnails + Canvas View) ───────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Thumbnails Drawer */}
        {showThumbnails && (
          <aside className="w-48 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto p-3 gap-3 flex-shrink-0 z-10">
            <p className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Page Thumbnails ({numPages})
            </p>
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pgNum) => (
              <div
                key={pgNum}
                onClick={() => setCurrentPage(pgNum)}
                className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg cursor-pointer transition-all border ${
                  currentPage === pgNum
                    ? 'bg-indigo-950/80 border-primary shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-full aspect-[1/1.4] bg-white rounded border border-slate-300 flex items-center justify-center overflow-hidden">
                  <FileText className="w-6 h-6 text-slate-400 group-hover:scale-110 transition-transform" />
                </div>
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    currentPage === pgNum ? 'text-primary' : 'text-slate-400'
                  }`}
                >
                  Page {pgNum}
                </span>
              </div>
            ))}
          </aside>
        )}

        {/* Center Canvas Viewport */}
        <main
          ref={viewportRef}
          className="flex-1 overflow-auto bg-[#0b0f19] flex justify-center items-start p-6 shadow-inner relative"
        >
          <div className="relative flex flex-col items-center select-text">
            <canvas
              ref={canvasRef}
              className="rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-slate-800 transition-all bg-white"
            />
            <div
              ref={textLayerRef}
              className="absolute top-0 left-0 overflow-hidden pointer-events-auto select-text font-sans"
              style={{
                userSelect: 'text',
                WebkitUserSelect: 'text',
              }}
            />
          </div>
        </main>
      </div>

      {/* ── Bottom Status Bar ────────────────────────────────────────── */}
      <footer className="h-7 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between font-mono text-[10px] text-slate-400 flex-shrink-0">
        <span>Anveshak High-Precision Reader</span>
        <span>
          Page {currentPage} of {numPages} • Scale:{' '}
          {typeof zoomMode === 'number' ? `${Math.round(zoomMode * 100)}%` : zoomMode}
        </span>
      </footer>
    </div>
  );
}
