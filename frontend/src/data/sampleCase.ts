// Sample content for the public pages (landing + auth). Every paper is real and
// open access; quotations are verbatim from the cited page of arXiv:1706.03762v7.
// Answers and syntheses are written to show the format and are labelled as samples.

export const samplePaper = {
  title: 'Attention Is All You Need',
  authors: 'Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin',
  venue: 'NIPS 2017',
  arxivId: '1706.03762',
  page: 5,
};

export type PageBlock =
  | { kind: 'text'; text: string }
  | { kind: 'cited'; citeId: string; before?: string; cited: string; after?: string }
  | { kind: 'equation'; text: string }
  | { kind: 'heading'; text: string };

// The top of page 5, as printed.
export const samplePageBlocks: PageBlock[] = [
  {
    kind: 'text',
    text: 'output values. These are concatenated and once again projected, resulting in the final values, as depicted in Figure 2.',
  },
  {
    kind: 'cited',
    citeId: 'subspaces',
    cited:
      'Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. With a single attention head, averaging inhibits this.',
  },
  { kind: 'equation', text: 'MultiHead(Q, K, V) = Concat(head₁, …, headₕ)Wᴼ' },
  {
    kind: 'cited',
    citeId: 'heads',
    cited: 'In this work we employ h = 8 parallel attention layers, or heads.',
    after:
      ' For each of these we use dₖ = dᵥ = d_model/h = 64. Due to the reduced dimension of each head, the total computational cost is similar to that of single-head attention with full dimensionality.',
  },
  { kind: 'heading', text: '3.2.3  Applications of Attention in our Model' },
  { kind: 'text', text: 'The Transformer uses multi-head attention in three different ways:' },
  {
    kind: 'text',
    text: '• In "encoder-decoder attention" layers, the queries come from the previous decoder layer, and the memory keys and values come from the output of the encoder. This allows every position in the decoder to attend over all positions in the input sequence.',
  },
  {
    kind: 'text',
    text: '• The encoder contains self-attention layers. In a self-attention layer all of the keys, values and queries come from the same place, in this case, the output of the previous layer in the encoder.',
  },
];

export type AnswerPart = { kind: 'text'; text: string } | { kind: 'cite'; citeId: string; label: string };

export const sampleQuestion = 'Why use several attention heads instead of one?';

export const sampleAnswer: AnswerPart[] = [
  {
    kind: 'text',
    text: 'Each head attends in its own learned subspace, so the model can look at different positions in different ways at once. With a single head, averaging inhibits this',
  },
  { kind: 'cite', citeId: 'subspaces', label: 'p. 5' },
  {
    kind: 'text',
    text: '. The authors use eight heads, each smaller, so the total cost stays close to one full-size head',
  },
  { kind: 'cite', citeId: 'heads', label: 'p. 5' },
  { kind: 'text', text: '.' },
];

export const searchSample = {
  query: 'letting a model look at every word in a sentence at once',
  results: [
    { arxivId: '1706.03762', title: 'Attention Is All You Need', year: 2017 },
    { arxivId: '1810.04805', title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', year: 2018 },
    { arxivId: '2005.14165', title: 'Language Models are Few-Shot Learners', year: 2020 },
  ],
};

export const compareSample = {
  papers: ['Attention Is All You Need', 'BERT'],
  rows: [
    { label: 'Architecture', values: ['Encoder–decoder', 'Encoder only'] },
    { label: 'Trained on', values: ['WMT 2014 translation pairs', 'Unlabelled text, then fine-tuned per task'] },
    { label: 'Objective', values: ['Predict the translated sentence', 'Masked words + next-sentence prediction'] },
  ],
};

export const reviewSample = {
  text: [
    { kind: 'text' as const, text: 'Self-attention replaced recurrence for sequence transduction' },
    { kind: 'note' as const, n: 1 },
    { kind: 'text' as const, text: '; pre-training a bidirectional encoder on unlabelled text and then fine-tuning carried across tasks' },
    { kind: 'note' as const, n: 2 },
    { kind: 'text' as const, text: '; and scaling an autoregressive model let it perform new tasks from a few examples in the prompt' },
    { kind: 'note' as const, n: 3 },
    { kind: 'text' as const, text: '.' },
  ],
  notes: [
    'Vaswani et al., 2017. arXiv:1706.03762',
    'Devlin et al., 2018. arXiv:1810.04805',
    'Brown et al., 2020. arXiv:2005.14165',
  ],
};

export const roadmapSample = {
  topic: 'How large language models came to follow instructions',
  stops: [
    { arxivId: '1706.03762', title: 'Attention Is All You Need', why: 'The architecture everything after builds on' },
    { arxivId: '1810.04805', title: 'BERT', why: 'Pre-train once, fine-tune for each task' },
    { arxivId: '2005.14165', title: 'Language Models are Few-Shot Learners', why: 'Scale turns prompts into tasks' },
    { arxivId: '2203.02155', title: 'Training language models to follow instructions with human feedback', why: 'Human feedback shapes the behaviour' },
  ],
};
