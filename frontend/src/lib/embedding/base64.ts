// Encodes a Float32Array as base64 little-endian bytes - the wire format the
// backend's PaperChunkUploadDTO expects. This is ~47% smaller than a JSON
// array of 384 decimal numbers, which matters once you're uploading hundreds
// of chunks for a large paper.
export function float32ArrayToBase64(vector: Float32Array): string {
  const bytes = new Uint8Array(vector.buffer, vector.byteOffset, vector.byteLength);

  // Build the binary string in chunks to avoid blowing the call-stack limit
  // that String.fromCharCode(...bytes) hits on large arrays.
  const CHUNK_SIZE = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
  }
  return btoa(binary);
}
