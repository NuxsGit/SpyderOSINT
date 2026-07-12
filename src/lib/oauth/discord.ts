// src/lib/oauth/discord.ts
import type { DiscordUser, DiscordTokenResponse } from "./types";

const DISCORD_API_BASE = "https://discord.com/api/v10";

/**
 * Génère l'URL d'autorisation Discord
 */
export function getDiscordAuthUrl(): string {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const scopes = "identify email guilds";
  const responseType = "code";

  if (!clientId || !redirectUri) {
    throw new Error("Discord OAuth credentials not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope: scopes,
    prompt: "consent",
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/**
 * Échange le code d'autorisation contre un token
 */
export async function exchangeCodeForToken(
  code: string
): Promise<DiscordTokenResponse> {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Discord OAuth credentials not configured");
  }

  const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Discord token exchange failed:", error);
    throw new Error("Failed to exchange code for token");
  }

  return response.json();
}

/**
 * Récupère les infos utilisateur Discord
 */
export async function getDiscordUser(
  accessToken: string
): Promise<DiscordUser> {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to fetch Discord user:", error);
    throw new Error("Failed to fetch user data");
  }

  return response.json();
}

/**
 * Récupère l'avatar Discord de l'utilisateur
 */
export function getDiscordAvatarUrl(
  userId: string,
  avatarHash: string | null
): string {
  if (!avatarHash) {
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(userId) % 5}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
}
