// Main-thread handle for the embedding Web Worker: turns its message-passing
// protocol into a plain async API, and lets a paper upload warm up the model
// download in the background while the user is still filling in the form.
export type ModelLoadProgress = {
  status: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
};

export class EmbeddingClient {
  private worker: Worker;
  private nextRequestId = 1;
  private pending = new Map<
    number,
    { resolve: (embeddings: Float32Array[]) => void; reject: (err: Error) => void }
  >();
  private onModelProgress?: (progress: ModelLoadProgress) => void;

  constructor(onModelProgress?: (progress: ModelLoadProgress) => void) {
    this.onModelProgress = onModelProgress;
    this.worker = new Worker(new URL('./embeddingWorker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = (event: MessageEvent) => this.handleMessage(event.data);
    this.worker.onerror = (event) => {
      const error = new Error(event.message || 'Embedding worker crashed');
      for (const { reject } of this.pending.values()) reject(error);
      this.pending.clear();
    };
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'model-progress':
        this.onModelProgress?.(message.progress);
        return;
      case 'ready':
        return;
      case 'embed-result': {
        const pending = this.pending.get(message.id);
        if (pending) {
          this.pending.delete(message.id);
          pending.resolve(message.embeddings);
        }
        return;
      }
      case 'embed-error': {
        const pending = this.pending.get(message.id);
        if (pending) {
          this.pending.delete(message.id);
          pending.reject(new Error(message.message));
        }
        return;
      }
    }
  }

  /** Starts downloading/caching the model without blocking on an embed call. */
  preload(): void {
    this.worker.postMessage({ type: 'preload' });
  }

  embedBatch(texts: string[]): Promise<Float32Array[]> {
    if (texts.length === 0) return Promise.resolve([]);
    const id = this.nextRequestId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ type: 'embed', id, texts });
    });
  }

  terminate(): void {
    this.worker.terminate();
    for (const { reject } of this.pending.values()) reject(new Error('Embedding client terminated'));
    this.pending.clear();
  }
}
