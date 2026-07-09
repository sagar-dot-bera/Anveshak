// Mock data for the Compare Papers page
// Kept separate from components per Frontend Development Guidelines

export interface ComparedPaper {
  id: string;
  label: string;      // "Paper A", "Paper B", etc.
  shortLabel: string; // "Attention", "GPT-3", "EfficientNet"
  title: string;
  authors: string;
  year: number;
  status: 'ANALYZED' | 'PROCESSING';
}

export const mockProject = {
  name: 'LLM Architecture Analysis',
  path: 'Projects',
};

export const mockComparedPapers: ComparedPaper[] = [
  {
    id: '1',
    label: 'Paper A',
    shortLabel: 'Attention',
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al.',
    year: 2017,
    status: 'ANALYZED',
  },
  {
    id: '2',
    label: 'Paper B',
    shortLabel: 'GPT-3',
    title: 'Language Models are Few-Shot Learners',
    authors: 'Brown et al.',
    year: 2020,
    status: 'ANALYZED',
  },
  {
    id: '3',
    label: 'Paper C',
    shortLabel: 'EfficientNet',
    title: 'EfficientNet: Rethinking Model Scaling',
    authors: 'Tan et al.',
    year: 2019,
    status: 'ANALYZED',
  },
];

export const maxPapers = 5;

export type CellContent = string | string[]; // string = paragraph, string[] = bullet list

export interface ComparisonCriteria {
  id: string;
  label: string;
  icon: string; // lucide icon name
  paperA: CellContent;
  paperB: CellContent;
  paperC: CellContent;
}

export const mockComparisonRows: ComparisonCriteria[] = [
  {
    id: 'objective',
    label: 'Objective',
    icon: 'Flag',
    paperA:
      'Propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions.',
    paperB:
      'Demonstrate that scaling up language models greatly improves task-agnostic, few-shot performance on a wide range of NLP benchmarks.',
    paperC:
      'Systematically study model scaling and identify that balancing network depth, width, and resolution can lead to better performance.',
  },
  {
    id: 'methodology',
    label: 'Methodology',
    icon: 'FlaskConical',
    paperA:
      'Stacked self-attention and point-wise, fully connected layers for both the encoder and decoder. Use of positional encoding for sequence order.',
    paperB:
      'Autoregressive language model with 175 billion parameters. Evaluation performed under few-shot, one-shot, and zero-shot settings.',
    paperC:
      'Compound Scaling Method: scales width/depth/resolution with a fixed set of scaling coefficients. Uses neural architecture search.',
  },
  {
    id: 'dataset',
    label: 'Dataset',
    icon: 'Database',
    paperA:
      'WMT 2014 English-to-German and English-to-French translation datasets.',
    paperB:
      'Common Crawl, WebText2, Books1, Books2, and Wikipedia (filtered and weighted).',
    paperC:
      'ImageNet-1K for classification; Transfer learning on CIFAR-100, Flowers, etc.',
  },
  {
    id: 'results',
    label: 'Results',
    icon: 'BarChart2',
    paperA:
      'State-of-the-art 28.4 BLEU on English-to-German; significantly more parallelizable.',
    paperB:
      'Strong performance on translation, QA, and cloze tasks; near human-level on some benchmarks.',
    paperC:
      '8.4x smaller and 6.1x faster than existing SOTA at the time with 84.3% top-1 accuracy.',
  },
  {
    id: 'strengths',
    label: 'Strengths',
    icon: 'Zap',
    paperA: [
      'Parallel training possible',
      'Reduced training time',
      'Captures long-range dependencies',
    ],
    paperB: [
      'Exceptional adaptability',
      'No fine-tuning required',
      'High coherence in generation',
    ],
    paperC: [
      'Highly resource efficient',
      'Mathematically grounded scaling',
      'Superior mobile performance',
    ],
  },
  {
    id: 'limitations',
    label: 'Limitations',
    icon: 'AlertCircle',
    paperA:
      'Quadratic complexity with sequence length (O(n²)); fixed-length context windows.',
    paperB:
      'Huge environmental/compute cost; potential for bias; difficulty with logical reasoning.',
    paperC:
      'Requires specific base-model (EfficientNet-B0) to scale; complexity in NAS implementation.',
  },
  {
    id: 'future-work',
    label: 'Future Work',
    icon: 'Rocket',
    paperA:
      'Applying attention to modalities other than text (Images/Audio).',
    paperB:
      'Pre-training for multi-modal tasks; improving data quality over quantity.',
    paperC:
      'Applying compound scaling to other CV architectures like Detection and Segmentation.',
  },
];

export const mockPagination = {
  currentPage: 1,
  rowsPerPage: 8,
  totalRows: 12,
};

export const mockAiSummary = {
  heading: 'AI Summary of Strategic Differences',
  text: [
    { type: 'normal' as const, content: 'While ' },
    { type: 'link' as const, content: 'Vaswani et al.' },
    {
      type: 'normal' as const,
      content:
        ' focuses on the structural innovation of the Transformer architecture itself, ',
    },
    { type: 'link' as const, content: 'Brown et al.' },
    {
      type: 'normal' as const,
      content:
        ' explores the emergent properties of massive scale in pre-training. Conversely, ',
    },
    { type: 'link' as const, content: 'EfficientNet' },
    {
      type: 'normal' as const,
      content:
        ' shifts the paradigm from pure scale to principled optimization of parameters. The primary tension lies between architectural simplicity (Transformers) and computational efficiency (EfficientNet).',
    },
  ],
};
