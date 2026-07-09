import apiClient from '@/lib/apiClient';
import type {
  ResearchCollectionResponse,
  ResearchPaperResponse,
} from '@/lib/types';

/** List all collections for the current user. */
export async function listCollections(): Promise<
  ResearchCollectionResponse[]
> {
  const { data } =
    await apiClient.get<ResearchCollectionResponse[]>('/collections');
  return data;
}

/** Get a single collection by ID. */
export async function getCollection(
  collectionId: string,
): Promise<ResearchCollectionResponse> {
  const { data } = await apiClient.get<ResearchCollectionResponse>(
    `/collections/${collectionId}`,
  );
  return data;
}

/** Create a new collection. */
export async function createCollection(
  name: string,
): Promise<ResearchCollectionResponse> {
  const { data } = await apiClient.post<ResearchCollectionResponse>(
    '/collections',
    { name },
  );
  return data;
}

/** Update a collection's name. */
export async function updateCollection(
  collectionId: string,
  name: string,
): Promise<ResearchCollectionResponse> {
  const { data } = await apiClient.patch<ResearchCollectionResponse>(
    `/collections/${collectionId}`,
    { name },
  );
  return data;
}

/** Delete a collection. */
export async function deleteCollection(collectionId: string): Promise<void> {
  await apiClient.delete(`/collections/${collectionId}`);
}

/** Add a paper to a collection. */
export async function addPaperToCollection(
  collectionId: string,
  paperId: string,
): Promise<ResearchCollectionResponse> {
  const { data } = await apiClient.post<ResearchCollectionResponse>(
    `/collections/${collectionId}/papers/${paperId}`,
  );
  return data;
}

/** Remove a paper from a collection. */
export async function removePaperFromCollection(
  collectionId: string,
  paperId: string,
): Promise<ResearchCollectionResponse> {
  const { data } = await apiClient.delete<ResearchCollectionResponse>(
    `/collections/${collectionId}/papers/${paperId}`,
  );
  return data;
}

/** List all papers in a collection. */
export async function listCollectionPapers(
  collectionId: string,
): Promise<ResearchPaperResponse[]> {
  const { data } = await apiClient.get<ResearchPaperResponse[]>(
    `/collections/${collectionId}/papers`,
  );
  return data;
}
