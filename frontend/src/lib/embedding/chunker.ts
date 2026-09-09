// Mirrors the backend's PdfService.extractChucks splitting (fixed-size
// substrings of each page's text), but assigns a globally-incrementing
// chunkIndex across the whole document instead of restarting per page - the
// server relies on chunkIndex being unique within a paper to dedupe retried
// upload batches.
export interface PendingChunk {
  content: string;
  pageNumber: number;
  chunkIndex: number;
}

export const DEFAULT_CHUNK_SIZE = 2000;

export function chunkPageText(
  pageNumber: number,
  pageText: string,
  nextChunkIndex: number,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
): PendingChunk[] {
  if (!pageText) return [];

  const chunks: PendingChunk[] = [];
  let chunkIndex = nextChunkIndex;
  for (let i = 0; i < pageText.length; i += chunkSize) {
    const content = pageText.slice(i, i + chunkSize);
    chunks.push({ content, pageNumber, chunkIndex: chunkIndex++ });
  }
  return chunks;
}
