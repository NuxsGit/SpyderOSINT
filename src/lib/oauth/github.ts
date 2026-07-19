// src/lib/oauth/github.ts
import type { GitHubUser, GitHubTokenResponse, GitHubEmail } from "./types";

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Génère l'URL d'autorisation GitHub
 */
export function getGithubAuthUrl(): string {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  const scopes = "read:user user:email";

  if (!clientId || !redirectUri) {
    throw new Error("GitHub OAuth credentials not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    allow_signup: "true",
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Échange le code d'autorisation contre un token
 */
export async function exchangeCodeForToken(
  code: string
): Promise<GitHubTokenResponse> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GitHub OAuth credentials not configured");
  }

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("GitHub token exchange failed:", error);
    throw new Error("Failed to exchange code for token");
  }

  return response.json();
}

/**
 * Récupère les infos utilisateur GitHub
 */
export async function getGithubUser(
  accessToken: string
): Promise<GitHubUser> {
  const response = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Accept": "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to fetch GitHub user:", error);
    throw new Error("Failed to fetch user data");
  }

  return response.json();
}

/**
 * Récupère l'email principal de l'utilisateur GitHub
 */
export async function getGithubPrimaryEmail(
  accessToken: string
): Promise<string | null> {
  const response = await fetch(`${GITHUB_API_BASE}/user/emails`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Accept": "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch GitHub emails");
    return null;
  }

  const emails: GitHubEmail[] = await response.json();
  const primaryEmail = emails.find((e) => e.primary && e.verified);
  return primaryEmail?.email ?? null;
}