// Mock data for the Research Roadmaps page
// Kept separate from components per Frontend Development Guidelines

export interface RoadmapNode {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  duration: string;
  completed: boolean;
}

export interface Roadmap {
  id: string;
  title: string;
  percentComplete: number;
  nodesCount: number;
  completedNodes: number;
  active: boolean;
  nodes: RoadmapNode[];
}

export const mockRoadmaps: Roadmap[] = [
  {
    id: 'rm-1',
    title: 'Retrieval Augmented Generation',
    percentComplete: 75,
    nodesCount: 4,
    completedNodes: 3,
    active: true,
    nodes: [
      {
        id: 'node-1',
        title: 'Dense Vector Embeddings',
        difficulty: 'Beginner',
        description: 'Understanding how text is transformed into mathematical vectors for high-dimensional semantic search.',
        duration: '2.5 Hours',
        completed: true,
      },
      {
        id: 'node-2',
        title: 'Vector Databases',
        difficulty: 'Intermediate',
        description: 'Optimization strategies for indexing and retrieving billions of embedding vectors efficiently using Pinecone, Milvus, or FAISS.',
        duration: '4 Hours',
        completed: false,
      },
      {
        id: 'node-3',
        title: 'RAG Tuning & Prompt Alignment',
        difficulty: 'Advanced',
        description: 'Context compression, query transformation, and alignment techniques to guarantee factual correctness in answers.',
        duration: '5 Hours',
        completed: false,
      }
    ],
  },
  {
    id: 'rm-2',
    title: 'Transformer Mechanics',
    percentComplete: 10,
    nodesCount: 12,
    completedNodes: 1,
    active: false,
    nodes: [],
  },
  {
    id: 'rm-3',
    title: 'Graph Neural Networks',
    percentComplete: 0,
    nodesCount: 8,
    completedNodes: 0,
    active: false,
    nodes: [],
  },
];

export const mockAiTip = {
  text: "You've shown strong progress in Retrieval logic. Consider looking at 'Query Expansion' next to improve your vector hit-rate.",
};
