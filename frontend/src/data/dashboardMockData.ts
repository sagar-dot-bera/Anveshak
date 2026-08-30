// Mock data for the Dashboard page
// Kept separate from components per Frontend Development Guidelines

export const mockUser = {
  name: 'Dr. Aris',
  greeting: 'Good Morning',
  avatarInitials: 'DA',
  continuingProject: 'Deep Learning in Genomics',
};

export const mockStats = {
  totalPapers: { value: '1,248', badge: '+12%', trend: 'up' },
  aiConversations: { value: '42', badge: 'Last 30d' },
  litReviews: { value: '08', badge: '4 Active' },
  roadmaps: { value: '15', badge: 'View All' },
};

export const mockCollaborators = [
  { initials: 'JD', color: 'bg-indigo-400' },
  { initials: 'AL', color: 'bg-teal-400' },
  { initials: 'MK', color: 'bg-amber-500' },
];

export interface Paper {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  tags: string[];
  timeAgo: string;
}

export const mockRecentPapers: Paper[] = [
  {
    id: '1',
    title: 'Quantum Neural Networks for Financial Portfolio Optimization',
    authors: 'Chen, L. et al.',
    journal: 'Nature Computational Science',
    year: 2023,
    tags: ['QUANTUM AI', 'FINANCE'],
    timeAgo: '2h ago',
  },
  {
    id: '2',
    title: 'Attention Mechanisms in Vision Transformers: A Survey',
    authors: 'Vaswani, A.',
    journal: 'Computer Vision Review',
    year: 2024,
    tags: ['CV', 'TRANSFORMERS'],
    timeAgo: 'Yesterday',
  },
  {
    id: '3',
    title: 'Ethics of Large Language Models in Academic Writing',
    authors: 'Smit, J.',
    journal: 'Journal of Digital Ethics',
    year: 2024,
    tags: ['ETHICS', 'NLP'],
    timeAgo: '2d ago',
  },
];

export interface ActivityEntry {
  id: string;
  type: 'ai' | 'share' | 'review';
  title: string;
  description: string;
  timeAgo: string;
}

export const mockRecentActivity: ActivityEntry[] = [
  {
    id: '1',
    type: 'ai',
    title: 'AI Summary Generated',
    description: '"Quantum Neural Networks..." summary is ready.',
    timeAgo: '15 MINS AGO',
  },
  {
    id: '2',
    type: 'share',
    title: 'Project Shared',
    description: 'Collaborated with Dr. Lee on "Genetics V2".',
    timeAgo: '2 HOURS AGO',
  },
  {
    id: '3',
    type: 'review',
    title: 'New Lit Review',
    description: 'Started "Transformers in Healthcare".',
    timeAgo: '5 HOURS AGO',
  },
];

export const navItems = [
  { label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
  { label: 'My Papers', icon: 'FileText', path: '/my-papers' },
  { label: 'Upload', icon: 'Upload', path: '/upload' },
  { label: 'Semantic Search', icon: 'Search', path: '/semantic-search' },
  { label: 'Talk to Paper', icon: 'MessageSquare', path: '/talk-to-paper' },
  { label: 'Compare', icon: 'GitCompare', path: '/compare' },
  { label: 'Literature Reviews', icon: 'BookOpen', path: '/literature-reviews' },
  { label: 'Research Roadmaps', icon: 'Map', path: '/research-roadmaps' },
];
