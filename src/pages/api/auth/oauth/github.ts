// src/pages/api/auth/oauth/github.ts
import type { APIRoute } from "astro";
import { getGithubAuthUrl } from "@lib/oauth/github";

export const GET: APIRoute = async ({ redirect }) => {
  try {
    const authUrl = getGithubAuthUrl();
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