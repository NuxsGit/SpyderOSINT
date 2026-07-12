// src/pages/api/search.ts
import type { APIRoute } from 'astro';
import { detectInputType, type InputType } from '../../lib/parsers/inputDetector';

export const prerender = false; // SSR obligatoire

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const raw: string = body?.query?.trim() ?? '';

  if (!raw || raw.length < 2) {
    return new Response(
      JSON.stringify({ error: 'Input trop court ou invalide.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const detection = detectInputType(raw);

  return new Response(
    JSON.stringify({
      input: raw,
      type: detection.type,
      confidence: detection.confidence,
      streamUrl: `/api/stream/${detection.type}?q=${encodeURIComponent(raw)}`,
      modules: detection.modules,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
