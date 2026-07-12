// src/lib/utils/sseHelpers.ts
const encoder = new TextEncoder();

export function encodeSSE(event: string, data: object): Uint8Array {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  return encoder.encode(payload);
}
