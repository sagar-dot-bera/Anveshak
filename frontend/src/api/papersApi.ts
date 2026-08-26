import apiClient from '@/lib/apiClient';
import type {
  ResearchPaperResponse,
  NewPaperRequest,
  UpdatePaperRequest,
  PaperComparisonResponse,
  LiteratureReviewResponse,
  GlobalPaperResponse,
} from '@/lib/types';

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

/** Semantic search across the user's papers (local). */
export async function searchPapersLocal(
  query: string,
  threshold?: number,
): Promise<ResearchPaperResponse[]> {
  const { data } = await apiClient.get<ResearchPaperResponse[]>(
    '/papers/search/local',
    { params: { query, threshold } },
  );
  return data;
}

/** Semantic search across global papers. */
export async function searchPapersGlobal(
  query: string,
  limit?: number,
  threshold?: number,
): Promise<GlobalPaperResponse[]> {
  const { data } = await apiClient.get<GlobalPaperResponse[]>(
    '/papers/search/global',
    { params: { query, limit, threshold } },
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
