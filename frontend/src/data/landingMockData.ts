// Mock data for the Public Landing page
// Kept separate from components per Frontend Development Guidelines

export const landingStats = {
  activeResearchers: '10,000+',
  version: 'v2.0.4',
  lastUpdated: 'v2.0 is now live',
};

export const landingTrustedBy = [
  { name: 'MIT', url: '#' },
  { name: 'Stanford', url: '#' },
  { name: 'Oxford', url: '#' },
  { name: 'ETH Zurich', url: '#' },
];

export interface LandingFeature {
  id: string;
  icon: 'Search' | 'MessageSquare' | 'BookOpen' | 'Map';
  title: string;
  description: string;
  linkText?: string;
  linkUrl?: string;
}

export const landingFeatures: LandingFeature[] = [
  {
    id: 'feat-1',
    icon: 'Search',
    title: 'Semantic Search',
    description: 'Our neural engine understands scientific context. Search by concepts, hypotheses, or theoretical frameworks instead of just matching keywords.',
  },
  {
    id: 'feat-2',
    icon: 'MessageSquare',
    title: 'Talk to Paper',
    description: 'Directly interrogate any PDF. Get citations, methodology deep-dives, and instant clarifications.',
  },
  {
    id: 'feat-3',
    icon: 'BookOpen',
    title: 'Literature Reviews',
    description: 'AI-powered synthesis across dozens of papers. Identify consensus, gaps, and contradictions in minutes.',
  },
  {
    id: 'feat-4',
    icon: 'Map',
    title: 'Research Roadmaps',
    description: 'New topic? Generate a structured learning path with foundational papers and prerequisite concepts mapped out.',
    linkText: 'Explore Roadmaps',
    linkUrl: '/signup',
  },
];

export const landingProcess = [
  {
    step: '1',
    title: 'Upload',
    description: 'Import your PDF library from Zotero, Mendeley, or your local drive. Anveshak OCRs and indexes everything instantly.',
  },
  {
    step: '2',
    title: 'Analyze',
    description: 'Ask questions, generate summaries, and map connections between papers using our high-context AI models.',
  },
  {
    step: '3',
    title: 'Synthesize',
    description: 'Export literature reviews, bibliographies, and structured notes directly to Word, LaTeX, or Notion.',
  },
];

export const landingTestimonial = {
  quote: "Anveshak has completely changed the way I approach my literature review. What used to take three weeks of manual reading and note-taking now takes three days. The 'Talk to Paper' feature is like having the author sitting next to me.",
  author: 'Dr. Julian Richter',
  role: 'POSTDOC FELLOW @ STANFORD UNIVERSITY',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256',
};
