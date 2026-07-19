// src/lib/oauth/types.ts

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
}

export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  verified: boolean;
  email: string | null;
  flags: number;
  banner: string | null;
  accent_color: number | null;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number;
  public_flags: number;
}

export interface AppUser {
  id: string;
  email: string | null;
  username: string;
  discordId: string | null;
  discordAvatar: string | null;
  githubId: string | null;
  githubAvatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}