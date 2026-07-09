// Mock data for the Upload Paper page

export const mockLanguages = [
  'English',
  'French',
  'German',
  'Spanish',
  'Chinese',
  'Japanese',
  'Arabic',
  'Portuguese',
];

export interface AnalysisStep {
  id: string;
  label: string;
  description: string;
  status: 'completed' | 'in-progress' | 'waiting';
}

export const mockAnalysisSteps: AnalysisStep[] = [
  {
    id: 'extraction',
    label: 'Extraction',
    description: 'Text, figures, and bibliographic data identified.',
    status: 'completed',
  },
  {
    id: 'embedding',
    label: 'Embedding',
    description: 'Vectorizing content for semantic search capabilities.',
    status: 'in-progress',
  },
  {
    id: 'completion',
    label: 'Completion',
    description: 'Finalizing document in your personal library.',
    status: 'waiting',
  },
];

export const mockAnalysisProgress = 65; // percent

export interface InfoCard {
  id: string;
  icon: string; // lucide icon name
  title: string;
  description: string;
}

export const mockInfoCards: InfoCard[] = [
  {
    id: 'pro-tip',
    icon: 'Lightbulb',
    title: 'Pro Tip',
    description:
      'Uploading multiple papers at once? Use the Batch Upload tool in your Settings.',
  },
  {
    id: 'ai-summarization',
    icon: 'Sparkles',
    title: 'AI Summarization',
    description:
      'Once uploaded, click "Summarize" in the Paper View to get a 100-word digest instantly.',
  },
  {
    id: 'private',
    icon: 'ShieldCheck',
    title: 'Private by Default',
    description:
      'Your papers are encrypted and only accessible by you. We never train models on user data.',
  },
];
