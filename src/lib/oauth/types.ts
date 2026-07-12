// src/lib/oauth/types.ts

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
  discordId: string;
  discordAvatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}
