import apiClient from '@/lib/apiClient';
import type {
  ResearchPaperResponse,
  NewPaperRequest,
  UpdatePaperRequest,
  PaperComparisonResponse,
  LiteratureReviewResponse,
  GlobalPaperResponse,
  PaperChunkUpload,
  LocalPaperSearchRequest,
  GlobalPaperSearchRequest,
} from '@/lib/types';
import { embedQuery } from '@/lib/embedding/embedQuery';

/** List all papers for the current user. */
export async function listPapers(): Promise<ResearchPaperResponse[]> {
  const { data } = await apiClient.get<ResearchPaperResponse[]>('/papers');
  return data;
}

/** Get a single paper by ID. */
export async function getPaper(
  paperId: string,
): Promise<ResearchPaperResponse> {
  const { data } = await apiClient.get<ResearchPaperResponse>(
    `/papers/${paperId}`,
  );
  return data;
}

/** Create a new paper with PDF upload (multipart). */
export async function createPaper(
  paper: NewPaperRequest,
  pdfFile: File,
): Promise<ResearchPaperResponse> {
  const formData = new FormData();
  formData.append(
    'paper',
    new Blob([JSON.stringify(paper)], { type: 'application/json' }),
  );
  formData.append('pdfFile', pdfFile);

  const { data } = await apiClient.post<ResearchPaperResponse>(
    '/papers',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

// ── Client-embedded paper upload ────────────────────────────
// Companion to createPaper() above: instead of the backend extracting text,
// chunking and embedding, the browser does that (via ONNX Runtime Web) and
// pushes chunk batches incrementally, which is what makes the upload
// resumable and keeps the server request small.

/** Creates the paper record + uploads the PDF. Chunks come later. */
export async function initPaperUpload(
  paper: NewPaperRequest,
  pdfFile: File,
): Promise<ResearchPaperResponse> {
  const formData = new FormData();
  formData.append(
    'paper',
    new Blob([JSON.stringify(paper)], { type: 'application/json' }),
  );
  formData.append('pdfFile', pdfFile);

  const { data } = await apiClient.post<ResearchPaperResponse>(
    '/papers/upload/init',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

/** Uploads one batch of client-embedded chunks. Retried batches are a no-op for chunks already stored. */
export async function uploadPaperChunksBatch(
  paperId: string,
  chunks: PaperChunkUpload[],
): Promise<void> {
  await apiClient.post(`/papers/upload/${paperId}/chunks`, { chunks });
}

/** Chunk indices already stored for a paper - used to resume an interrupted upload. */
export async function getUploadedChunkIndices(paperId: string): Promise<number[]> {
  const { data } = await apiClient.get<number[]>(`/papers/upload/${paperId}/chunks`);
  return data;
}

/** Call once all chunk batches are uploaded to generate the AI summary and complete the paper. */
export async function finalizePaperUpload(paperId: string): Promise<ResearchPaperResponse> {
  const { data } = await apiClient.post<ResearchPaperResponse>(
    `/papers/upload/${paperId}/finalize`,
  );
  return data;
}

/** Update a paper (with optional PDF replacement). */
export async function updatePaper(
  paperId: string,
  paper: UpdatePaperRequest,
  pdfFile?: File,
): Promise<ResearchPaperResponse> {
  const formData = new FormData();
  formData.append(
    'paper',
    new Blob([JSON.stringify(paper)], { type: 'application/json' }),
  );
  if (pdfFile) {
    formData.append('pdfFile', pdfFile);
  }

  const { data } = await apiClient.patch<ResearchPaperResponse>(
    `/papers/${paperId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

/** Delete a paper. */
export async function deletePaper(paperId: string): Promise<void> {
  await apiClient.delete(`/papers/${paperId}`);
}

/** Semantic search across the user's papers (local). Query embedding is computed client-side. */
export async function searchPapersLocal(
  query: string,
  threshold: number = 0.0,
): Promise<ResearchPaperResponse[]> {
  const embedding = await embedQuery(query);
  const request: LocalPaperSearchRequest = { embedding, threshold };
  const { data } = await apiClient.post<ResearchPaperResponse[]>(
    '/papers/search/local',
    request,
  );
  return data;
}

/** Semantic search across global papers. Query embedding is computed client-side. */
export async function searchPapersGlobal(
  query: string,
  limit: number = 10,
  threshold: number = 0.0,
): Promise<GlobalPaperResponse[]> {
  const embedding = await embedQuery(query);
  const request: GlobalPaperSearchRequest = { embedding, limit, threshold };
  const { data } = await apiClient.post<GlobalPaperResponse[]>(
    '/papers/search/global',
    request,
  );
  return data;
}

/** Import a paper directly into user's library without manual PDF upload. */
export async function importPaperToLibrary(paper: {
  paperId?: string;
  title: string;
  abstractText?: string;
  authors?: string;
  categories?: string;
  pdfUrl?: string;
  paperUrl?: string;
  publicationYear?: number;
}): Promise<ResearchPaperResponse> {
  const { data } = await apiClient.post<ResearchPaperResponse>('/papers/import', paper);
  return data;
}

/** Download a paper's PDF as a Blob. */
export async function downloadPaperPdf(paperId: string): Promise<Blob> {
  const { data } = await apiClient.get(`/papers/${paperId}/pdf`, {
    responseType: 'blob',
  });
  return data;
}

/** Compare multiple papers using AI. */
export async function comparePapers(
  paperIds: string[],
): Promise<PaperComparisonResponse> {
  const { data } = await apiClient.post<PaperComparisonResponse>(
    '/papers/compare',
    { paperIdStrings: paperIds },
  );
  return data;
}

/** Generate a literature review synthesis report. */
export async function generateLiteratureReview(
  paperIds: string[],
): Promise<LiteratureReviewResponse> {
  const { data } = await apiClient.post<LiteratureReviewResponse>(
    '/papers/literature-review',
    { paperIdStrings: paperIds },
  );
  return data;
}
