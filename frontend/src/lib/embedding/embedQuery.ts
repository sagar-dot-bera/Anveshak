// One-off text embedding for search queries and chat messages, computed
// client-side in the same Web Worker the upload pipeline uses. Kept as a
// lazily-created singleton (never terminated) since search/chat repeatedly
// embed short strings across the session, unlike the upload pipeline which
// spins up and tears down a worker per paper.
import { EmbeddingClient } from './embeddingClient';
import { float32ArrayToBase64 } from './base64';

let client: EmbeddingClient | null = null;

function getClient(): EmbeddingClient {
  if (!client) {
    client = new EmbeddingClient();
    client.preload();
  }
  return client;
}

/** Embeds a single query/message and returns it base64-encoded for the wire. */
export async function embedQuery(text: string): Promise<string> {
  const [embedding] = await getClient().embedBatch([text]);
  return float32ArrayToBase64(embedding);
}
