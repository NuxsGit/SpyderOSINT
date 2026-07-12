// src/pages/api/stream/discord.ts
import type { APIRoute } from 'astro';
import { encodeSSE } from '../../../lib/utils/sseHelpers';
import { decodeSnowflake } from '../../../lib/modules/discord/snowflake';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q') ?? '';

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: object) => {
        controller.enqueue(encodeSSE(event, data));
      };

      try {
        // Étape 1 : Décoder le Snowflake
        send('module:start', { module: 'snowflake_decode', label: 'Décodage Snowflake ID…' });
        const snowflake = decodeSnowflake(query);
        send('module:result', { module: 'snowflake_decode', data: snowflake });

        // Étape 2 : Lookup API publique Discord
        send('module:start', { module: 'discord_lookup', label: 'Requête DiscordLookup API…' });
        const res = await fetch(`https://discordlookup.mesalytic.moe/v1/user/${query}`);
        if (res.ok) {
          const profile = await res.json();
          send('module:result', { module: 'discord_lookup', data: profile });
        } else {
          send('module:error', { module: 'discord_lookup', error: `HTTP ${res.status}` });
        }

        send('stream:done', { total_modules: 2 });
      } catch (err) {
        send('stream:error', { message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Désactive le buffering Nginx
    },
  });
};
