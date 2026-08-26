import apiClient from '@/lib/apiClient';
import type { RoadmapShort, RoadmapDTO, RoadmapRequest } from '@/lib/types';

/**
 * Fetch a short summary list of all roadmaps.
 * GET /roadmaps/roadmaps
 */
export async function getAllRoadmaps(): Promise<RoadmapShort[]> {
  const { data } = await apiClient.get<RoadmapShort[]>('/roadmaps/roadmaps');
  return data;
}

/**
 * Fetch full roadmap detail including ordered stages and their papers.
 * GET /roadmaps/{roadmapId}
 */
export async function getRoadmapById(roadmapId: string): Promise<RoadmapDTO> {
  const { data } = await apiClient.get<RoadmapDTO>(`/roadmaps/${roadmapId}`);
  return data;
}

/**
 * Ask the AI to generate a new research roadmap for the given request string.
 * POST /roadmaps/generate
 */
export async function generateRoadmap(request: string): Promise<RoadmapDTO> {
  const body: RoadmapRequest = { request };
  const { data } = await apiClient.post<RoadmapDTO>('/roadmaps/generate', body);
  return data;
}
