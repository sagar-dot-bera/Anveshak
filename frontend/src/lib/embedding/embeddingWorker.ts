/// <reference lib="webworker" />
// Runs the quantized all-MiniLM-L6-v2 ONNX model (via ONNX Runtime Web,
// through transformers.js) off the main thread so tokenizing and embedding a
// large paper doesn't freeze the UI. The model + tokenizer are fetched once
// from the Hugging Face Hub CDN and cached by the browser (Cache Storage),
// so subsequent papers/sessions load from disk instead of the network.
import { pipeline, env, type FeatureExtractionPipeline } from '@huggingface/transformers';

// This is the ONNX export (with quantized weights) of the same
// sentence-transformers/all-MiniLM-L6-v2 checkpoint the backend embedding
// service uses, published for transformers.js consumption.
const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';

env.allowRemoteModels = true;
env.useBrowserCache = true;
// The multi-threaded WASM backend needs cross-origin isolation (COOP/COEP
// response headers) for SharedArrayBuffer, which this app's server doesn't
// set up. Force single-threaded so it works reliably everywhere instead of
// silently degrading (or failing) on hosts without those headers.
if (env.backends.onnx.wasm) {
  env.backends.onnx.wasm.numThreads = 1;
}

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline('feature-extraction', MODEL_ID, {
      dtype: 'q8',
      progress_callback: (progress: any) => {
        post({ type: 'model-progress', progress });
      },
    }) as Promise<FeatureExtractionPipeline>;
  }
  return extractorPromise;
}

type InboundMessage =
  | { type: 'preload' }
  | { type: 'embed'; id: number; texts: string[] };

type OutboundMessage =
  | { type: 'model-progress'; progress: unknown }
  | { type: 'ready' }
  | { type: 'embed-result'; id: number; embeddings: Float32Array[] }
  | { type: 'embed-error'; id: number; message: string };

function post(message: OutboundMessage, transfer: Transferable[] = []) {
  (self as unknown as Worker).postMessage(message, transfer as any);
}

self.onmessage = async (event: MessageEvent<InboundMessage>) => {
  const message = event.data;

  if (message.type === 'preload') {
    try {
      await getExtractor();
      post({ type: 'ready' });
    } catch (err) {
      post({ type: 'embed-error', id: -1, message: err instanceof Error ? err.message : String(err) });
    }
    return;
  }

  if (message.type === 'embed') {
    try {
      const extractor = await getExtractor();
      const output = await extractor(message.texts, { pooling: 'mean', normalize: true });

      // output.data is a flat Float32Array of [batch * 384]; slice per chunk.
      const dims = output.dims as number[];
      const hiddenSize = dims[dims.length - 1];
      const flat = output.data as Float32Array;

      const embeddings: Float32Array[] = [];
      for (let i = 0; i < message.texts.length; i++) {
        embeddings.push(flat.slice(i * hiddenSize, (i + 1) * hiddenSize));
      }

      post(
        { type: 'embed-result', id: message.id, embeddings },
        embeddings.map((e) => e.buffer),
      );
    } catch (err) {
      post({ type: 'embed-error', id: message.id, message: err instanceof Error ? err.message : String(err) });
    }
  }
};
