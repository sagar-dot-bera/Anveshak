// Extracts text from a PDF entirely in the browser, page by page, so the
// caller can chunk+embed incrementally instead of holding the whole document
// text in memory at once (important for 50+ page papers).
import * as pdfjsLib from 'pdfjs-dist';

// Same CDN worker setup used by PdfViewer.tsx, kept in sync with the
// installed pdfjs-dist version.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

/**
 * Streams extracted page text via `onPage` as each page finishes, releasing
 * each page's PDF.js render objects immediately after so a 50+ page paper
 * never holds more than one page's worth of PDF internals in memory.
 * `onStart` fires once the page count is known, before extraction begins, so
 * callers can render an accurate progress bar.
 */
export async function extractPdfPagesStreaming(
  file: File,
  onPage: (page: ExtractedPage) => void | Promise<void>,
  onStart?: (totalPages: number) => void,
): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const doc = await loadingTask.promise;

  try {
    onStart?.(doc.numPages);
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      try {
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        await onPage({ pageNumber, text });
      } finally {
        page.cleanup();
      }
    }
    return doc.numPages;
  } finally {
    await loadingTask.destroy();
  }
}
