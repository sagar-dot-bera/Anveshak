// Mock data for the Public Landing page
// Kept separate from components per Frontend Development Guidelines

export const landingHero = {
  title: 'Bring Your Papers to Life.',
  highlight: 'Papers',
  subtitle:
    "An AI-powered research companion designed for academic rigor. Accelerate your literature review, synthesize complex findings, and discover connections across your entire library with unprecedented clarity.",
};

export interface LandingHighlight {
  id: string;
  icon: 'PenTool' | 'Waypoints' | 'ShieldCheck';
  title: string;
  description: string;
}

export const landingHighlights: LandingHighlight[] = [
  {
    id: 'highlight-1',
    icon: 'PenTool',
    title: 'Synthesize Faster',
    description: 'Instantly extract key findings and methodologies across dozens of papers simultaneously.',
  },
  {
    id: 'highlight-2',
    icon: 'Waypoints',
    title: 'Discover Hidden Connections',
    description: 'Uncover subtle links between disparate fields that traditional search engines miss.',
  },
  {
    id: 'highlight-3',
    icon: 'ShieldCheck',
    title: 'Ensure Academic Rigor',
    description: 'Every insight is fully cited and traceable back to the original source text.',
  },
];

export interface LandingFeature {
  id: string;
  icon: 'Search' | 'Map' | 'GitCompare' | 'BookOpen';
  title: string;
  description: string;
}

export const landingFeatures: LandingFeature[] = [
  {
    id: 'feat-1',
    icon: 'Search',
    title: 'Semantic Search',
    description: 'Go beyond keywords. Find concepts, methodologies, and specific findings across hundreds of PDFs instantly.',
  },
  {
    id: 'feat-2',
    icon: 'Map',
    title: 'Research Roadmaps',
    description: 'Visualize your learning path. Map out complex topics, track your progress, and hit academic milestones with structured pathways.',
  },
  {
    id: 'feat-3',
    icon: 'GitCompare',
    title: 'Paper Comparison',
    description: 'Automatically contrast methodologies, datasets, and conclusions side-by-side.',
  },
  {
    id: 'feat-4',
    icon: 'BookOpen',
    title: 'Lit Review Generation',
    description: 'Synthesize selected papers into a coherent, fully cited draft. Perfect for jumpstarting your writing process.',
  },
];

export const landingRoadmapPreview = {
  query: 'Methodologies for evaluating LLM hallucination rates in academic texts',
  resultCount: 14,
  stages: [
    { title: 'Foundations & Score Matching', status: 'completed' as const },
    { title: 'Latent Diffusion & Guidance', status: 'in-progress' as const },
    { title: 'Controllable Generation & Ablations', status: 'pending' as const },
  ],
  litReviewCitations: ['Smith et al. 2023', 'Jones 2024'],
};

export interface LandingRigorPoint {
  id: string;
  title: string;
  description: string;
}

export const landingRigorPoints: LandingRigorPoint[] = [
  {
    id: 'rigor-1',
    title: 'Organized Library',
    description: 'Keep thousands of PDFs perfectly categorized and instantly accessible across all your devices.',
  },
  {
    id: 'rigor-2',
    title: 'Unmatched Productivity',
    description: 'Save hundreds of hours reading and summarizing. Focus on high-level synthesis and novel ideas.',
  },
  {
    id: 'rigor-3',
    title: 'Built for Graduates',
    description: 'Designed specifically for the heavy lifting required in PhD and Master’s programs.',
  },
];

export const landingRigorRoadmap = {
  title: 'Research Roadmap: LLM Alignment',
  progress: '75% Complete',
  stages: [
    {
      title: 'RLHF Foundations',
      meta: 'Core reward modeling & proximal policy optimization.',
      status: 'completed' as const,
    },
    {
      title: 'Direct Preference Optimization (DPO)',
      meta: 'Implicit reward formulations without actor-critic overhead.',
      badge: '5 Key Syntheses',
      status: 'active' as const,
    },
    {
      title: 'KTO & Constitutional AI',
      meta: 'Next Milestone',
      status: 'pending' as const,
    },
  ],
  synthesis: {
    title: 'Paper Reader Synthesis',
    citations: '28 Citations Verified',
    quote: 'DPO eliminates complex reinforcement learning loops while maintaining comparable alignment fidelity across standard benchmarks...',
  },
};

export const landingFooterLinks = ['Privacy Policy', 'Terms of Service', 'Research Ethics', 'Contact Support'];
