// Mock data for the Semantic Search page
// Kept separate from components per Frontend Development Guidelines

export interface TrendingTopic {
  id: string;
  icon: 'Brain' | 'Leaf' | 'Dna';
  title: string;
  description: string;
  tags: string[];
}

export const mockTrendingTopics: TrendingTopic[] = [
  {
    id: 'topic-1',
    icon: 'Brain',
    title: 'Large Language Models in Healthcare',
    description: 'Exploring patient confidentiality and diagnostic accuracy in transformer architectures.',
    tags: ['NLP', 'BIOMEDICAL'],
  },
  {
    id: 'topic-2',
    icon: 'Leaf',
    title: 'Sustainable Energy Systems',
    description: 'Advances in solid-state battery technology and grid-scale hydrogen storage solutions.',
    tags: ['ENGINEERING', 'CLIMATE'],
  },
  {
    id: 'topic-3',
    icon: 'Dna',
    title: 'CRISPR Gene Editing Therapeutics',
    description: "Latest breakthroughs in in-vivo delivery mechanisms for treating inherited blood disorders.",
    tags: ['GENETICS', 'PHARMA'],
  },
];

export interface SearchResult {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  similarity: number;
  abstract: string;
  tags: string[];
}

export const mockSearchResults: SearchResult[] = [
  {
    id: 'res-1',
    title: 'Hybrid Classical-Quantum Algorithms for Genomics Sequence Analysis',
    authors: 'Gomez, F. et al.',
    journal: 'Bioinformatics & Quantum Computing',
    year: 2024,
    similarity: 0.89,
    abstract: 'We present a novel hybrid sequence alignment pipeline incorporating variational quantum classifiers. The algorithm reduces sequence matching complexity on large genomic databases while keeping alignment error bounds within traditional BLAST tolerances.',
    tags: ['QUANTUM AI', 'GENOMICS'],
  },
  {
    id: 'res-2',
    title: 'Scalability Limitations in Cryogenic Qubit Addressing Architectures',
    authors: 'Zhu, Y. & Patel, K.',
    journal: 'IEEE Transactions on Quantum Engineering',
    year: 2023,
    similarity: 0.81,
    abstract: 'Thermal dissipation constraints within dilution refrigerators present a significant obstacle to scaling control wires for large scale NISQ systems. We provide a thermodynamic analysis of direct coaxial vs multiplexed RF addressing.',
    tags: ['HARDWARE', 'CRYOGENICS'],
  },
  {
    id: 'res-3',
    title: 'Error Mitigation Benchmarks for Superconducting Multi-Qubit Processors',
    authors: 'Silva, L. & Chen, X.',
    journal: 'Physical Review Letters',
    year: 2024,
    similarity: 0.76,
    abstract: 'Applying active zero-noise extrapolation (ZNE) and randomized compiling to 27-qubit superconducting chips yields a 40% reduction in gate error rates, showing feasibility for medium-depth quantum simulation experiments.',
    tags: ['ERROR CORRECTION', 'NISQ'],
  }
];
