// Orchestrates a fully client-side paper upload:
//   1. extract PDF text + chunk it (pdfExtractor + chunker)
//   2. embed chunks in batches, in a Web Worker (embeddingClient)
//   3. upload each batch as soon as it's embedded (retried on failure)
//   4. finalize once every chunk has been stored
//
// The upload is resumable: the in-progress paperId is remembered in
// localStorage against the exact file (name/size/lastModified), and any
// chunk indices the server already has are skipped, so re-running this for
// the same file after a dropped connection or reload only redoes the
// remaining work instead of starting over.
import type { NewPaperRequest, PaperChunkUpload, ResearchPaperResponse } from '@/lib/types';
import {
  initPaperUpload,
  uploadPaperChunksBatch,
  getUploadedChunkIndices,
  finalizePaperUpload,
} from '@/api/papersApi';
import { extractPdfPagesStreaming } from './pdfExtractor';
import { chunkPageText, type PendingChunk } from './chunker';
import { float32ArrayToBase64 } from './base64';
import { EmbeddingClient, type ModelLoadProgress } from './embeddingClient';

const EMBED_BATCH_SIZE = 8;
const MAX_UPLOAD_RETRIES = 5;
const RETRY_BASE_DELAY_MS = 1000;

const PENDING_UPLOAD_KEY = 'anveshak:pendingPaperUpload';

interface PendingUploadRecord {
  paperId: string;
  fileName: string;
  fileSize: number;
  fileLastModified: number;
}

function loadPendingUpload(file: File): PendingUploadRecord | null {
  try {
    const raw = localStorage.getItem(PENDING_UPLOAD_KEY);
    if (!raw) return null;
    const record: PendingUploadRecord = JSON.parse(raw);
    if (
      record.fileName === file.name &&
      record.fileSize === file.size &&
      record.fileLastModified === file.lastModified
    ) {
      return record;
    }
    return null;
  } catch {
    return null;
  }
}

function savePendingUpload(record: PendingUploadRecord): void {
  try {
    localStorage.setItem(PENDING_UPLOAD_KEY, JSON.stringify(record));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) - resumability is
    // best-effort, the upload itself still works.
  }
}

function clearPendingUpload(): void {
  try {
    localStorage.removeItem(PENDING_UPLOAD_KEY);
  } catch {
    // ignore
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadBatchWithRetry(paperId: string, chunks: PaperChunkUpload[]): Promise<void> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await uploadPaperChunksBatch(paperId, chunks);
      return;
    } catch (err) {
      attempt++;
      if (attempt >= MAX_UPLOAD_RETRIES) throw err;
      await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
    }
  }
}

export type UploadStage = 'extracting' | 'embedding' | 'finalizing';

export interface UploadProgressState {
  stage: UploadStage;
  pagesProcessed: number;
  pagesTotal: number;
  chunksProcessed: number;
  chunksTotal: number;
  modelProgress: ModelLoadProgress | null;
}

export async function runClientSidePaperUpload(
  paper: NewPaperRequest,
  pdfFile: File,
  onProgress: (state: UploadProgressState) => void,
): Promise<ResearchPaperResponse> {
  const state: UploadProgressState = {
    stage: 'extracting',
    pagesProcessed: 0,
    pagesTotal: 0,
    chunksProcessed: 0,
    chunksTotal: 0,
    modelProgress: null,
  };
  const emit = () => onProgress({ ...state });

  const embeddingClient = new EmbeddingClient((modelProgress) => {
    state.modelProgress = modelProgress;
    emit();
  });
  // Kick off the model download/cache lookup immediately - it overlaps with
  // PDF text extraction below instead of only starting once embedding begins.
  embeddingClient.preload();

  try {
    let paperId: string;
    let alreadyUploaded: Set<number>;

    const pending = loadPendingUpload(pdfFile);
    if (pending) {
      paperId = pending.paperId;
      try {
        alreadyUploaded = new Set(await getUploadedChunkIndices(paperId));
      } catch {
        alreadyUploaded = new Set();
      }
    } else {
      const created = await initPaperUpload(paper, pdfFile);
      paperId = created.id;
      alreadyUploaded = new Set();
      savePendingUpload({
        paperId,
        fileName: pdfFile.name,
        fileSize: pdfFile.size,
        fileLastModified: pdfFile.lastModified,
      });
    }

    // ── Phase 1: extract + chunk (cheap - just text, no embeddings yet) ──
    const allChunks: PendingChunk[] = [];
    let nextChunkIndex = 0;

    await extractPdfPagesStreaming(
      pdfFile,
      (page) => {
        const pageChunks = chunkPageText(page.pageNumber, page.text, nextChunkIndex);
        nextChunkIndex += pageChunks.length;
        allChunks.push(...pageChunks);

        state.pagesProcessed = page.pageNumber;
        emit();
      },
      (totalPages) => {
        state.pagesTotal = totalPages;
        emit();
      },
    );

    state.stage = 'embedding';
    state.chunksTotal = allChunks.length;
    emit();

    // A PDF with no extractable text (e.g. scanned images) yields zero
    // chunks here - finalizePaperUpload has its own server-side fallback for
    // that case, so this loop simply doesn't run and we go straight there.
    for (let i = 0; i < allChunks.length; i += EMBED_BATCH_SIZE) {
      const batch = allChunks.slice(i, i + EMBED_BATCH_SIZE).filter((c) => !alreadyUploaded.has(c.chunkIndex));
      if (batch.length === 0) {
        state.chunksProcessed = Math.min(i + EMBED_BATCH_SIZE, allChunks.length);
        emit();
        continue;
      }

      const embeddings = await embeddingClient.embedBatch(batch.map((c) => c.content));
      const uploads: PaperChunkUpload[] = batch.map((chunk, idx) => ({
        content: chunk.content,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        embedding: float32ArrayToBase64(embeddings[idx]),
      }));

      await uploadBatchWithRetry(paperId, uploads);
      for (const c of batch) alreadyUploaded.add(c.chunkIndex);

      state.chunksProcessed = Math.min(i + EMBED_BATCH_SIZE, allChunks.length);
      emit();
    }

    state.stage = 'finalizing';
    emit();

    const finalized = await finalizePaperUpload(paperId);
    clearPendingUpload();
    return finalized;
  } finally {
    embeddingClient.terminate();
  }
}
