import apiClient from '@/lib/apiClient';
import type { CitationResponse, NewCitationRequest } from '@/lib/types';

/** Create a new citation for a paper. */
export async function createCitation(
  paperId: string,
  citedPaperId: string,
): Promise<CitationResponse> {
  const request: NewCitationRequest = { citedPaperId };
  const { data } = await apiClient.post<CitationResponse>(
    `/papers/${paperId}/citations`,
    request,
  );
  return data;
}

/** List all citations for a specific paper. */
export async function listCitations(
  paperId: string,
): Promise<CitationResponse[]> {
  const { data } = await apiClient.get<CitationResponse[]>(
    `/papers/${paperId}/citations`,
  );
  return data;
}

/** Delete a specific citation. */
export async function deleteCitation(
  paperId: string,
  citationId: string,
): Promise<void> {
  await apiClient.delete(`/papers/${paperId}/citations/${citationId}`);
}
