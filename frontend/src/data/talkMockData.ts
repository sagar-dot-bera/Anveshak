// Mock data for the Talk to Paper page
// Kept separate from components per Frontend Development Guidelines

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  
  timestamp?: string;
  sourceTag?: {
    label: string; // "p. 4, section 3.2.2"
    link: string;
  };
}

export const mockPdfInfo = {
  filename: 'Attention Is All You Need.pdf',
  status: 'PROCESSING',
  totalPages: 15,
  currentPage: 1,
  title: 'Attention Is All You Need',
  authors: [
    { name: 'Ashish Vaswani*', aff: 'Google Brain' },
    { name: 'Noam Shazeer*', aff: 'Google Brain' },
    { name: 'Niki Parmar*', aff: 'Google Research' },
    { name: 'Jakob Uszkoreit*', aff: 'Google Research' },
    { name: 'Llion Jones*', aff: 'Google Research' },
    { name: 'Aidan N. Gomez*', aff: 'University of Toronto' },
    { name: 'Lukasz Kaiser*', aff: 'Google Brain' },
    { name: 'Illia Polosukhin*', aff: 'Independent' }
  ]
};

export const mockChatHistory: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: `I've analyzed "Attention Is All You Need". I can help you summarize the architecture, explain the Multi-Head Attention mechanism, or find specific benchmarks. What would you like to explore?`
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Can you explain how Multi-Head Attention differs from standard attention in this paper?',
    timestamp: 'SENT 2:14 PM'
  },
  {
    id: 'msg-3',
    sender: 'ai',
    text: `Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. With a single attention head, averaging inhibits this.

Key differences highlighted in the paper:
• Parallel Attention: Instead of performing a single attention function, the paper found it beneficial to linearly project the queries, keys and values.
• Dimensionality: By dividing the total dimension into multiple heads, the model achieves lower computational cost than standard single-head attention.`,
    sourceTag: {
      label: 'p. 4, section 3.2.2',
      link: '#section-3.2.2'
    }
  }
];

export const mockSuggestedQuestions = [
  'Summarize the Transformer architecture',
  'What are the BLEU scores?',
  'Explain self-attention simply'
];

export const mockUsageStats = {
  engine: 'POWERED BY GPT-4O-RESEARCH',
  tokensRemaining: '2,410 tokens remaining today'
};
