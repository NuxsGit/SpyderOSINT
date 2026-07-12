// src/pages/api/auth/oauth/discord.ts
import type { APIRoute } from "astro";
import { getDiscordAuthUrl } from "@lib/oauth/discord";

export const GET: APIRoute = async ({ redirect }) => {
  try {
    const authUrl = getDiscordAuthUrl();
    return redirect(authUrl);
  } catch (error) {
    console.error("OAuth redirect error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to initiate OAuth flow" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
