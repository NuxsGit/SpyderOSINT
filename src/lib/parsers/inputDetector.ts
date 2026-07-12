// src/lib/parsers/inputDetector.ts

export type InputType = 'email' | 'ip' | 'discord_id' | 'address' | 'username';

export interface DetectionResult {
  type: InputType;
  confidence: 'high' | 'medium' | 'low';
  modules: string[];
  raw: string;
}

// ─── Patterns Regex ────────────────────────────────────────────────────────────

const PATTERNS: Record<InputType, RegExp> = {
  // RFC 5322 simplifié — couvre 99.9% des emails réels
  email: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,

  // IPv4 + IPv6 basique
  ip: /^((\d{1,3}\.){3}\d{1,3}|([\da-fA-F]{1,4}:){2,7}[\da-fA-F]{1,4}|::[\da-fA-F]+)$/,

  // Discord Snowflake : entier 17-19 chiffres
  discord_id: /^\d{17,19}$/,

  // Adresse physique : contient un numéro + mots + indicateurs de voirie
  address: /\b\d{1,5}\b.{3,}.?(rue|avenue|boulevard|impasse|route|chemin|allée|place|square|street|road|ave|blvd|lane|dr|ct)\b/i,

  // Username : dernière chance — alphanumérique + tirets/underscores, 2-50 chars
  username: /^[a-zA-Z0-9._\-]{2,50}$/,
};

const MODULE_MAP: Record<InputType, string[]> = {
  email:      ['hibp', 'holehe', 'google_profile', 'gravatar'],
  ip:         ['geolocation', 'shodan', 'reverse_dns', 'abuse_check'],
  discord_id: ['snowflake_decode', 'discord_lookup', 'avatar_history'],
  address:    ['nominatim_map', 'street_view', 'local_dork'],
  username:   ['platform_scan', 'google_dork', 'social_graph'],
};

// ─── Logique de détection (ordre = priorité) ──────────────────────────────────

export function detectInputType(input: string): DetectionResult {
  const s = input.trim();

  // 1. Email — pattern très distinctif, haute confiance
  if (PATTERNS.email.test(s)) {
    return result('email', 'high', s);
  }

  // 2. IP — numérique et structuré, haute confiance
  if (PATTERNS.ip.test(s) && isValidIp(s)) {
    return result('ip', 'high', s);
  }

  // 3. Discord ID — uniquement des chiffres sur 17-19 digits
  if (PATTERNS.discord_id.test(s)) {
    return result('discord_id', 'high', s);
  }

  // 4. Adresse physique — détection par mots-clés de voirie
  if (PATTERNS.address.test(s)) {
    return result('address', 'medium', s);
  }

  // 5. Fallback : Username (catch-all)
  if (PATTERNS.username.test(s)) {
    return result('username', s.length > 4 ? 'medium' : 'low', s);
  }

  // Fallback ultime (espaces, caractères spéciaux → traité comme adresse ou requête)
  return result('address', 'low', s);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function result(type: InputType, confidence: DetectionResult['confidence'], raw: string): DetectionResult {
  return { type, confidence, modules: MODULE_MAP[type], raw };
}

function isValidIp(ip: string): boolean {
  if (!ip.includes(':')) {
    // Valide chaque octet IPv4
    return ip.split('.').every(part => {
      const n = parseInt(part, 10);
      return n >= 0 && n <= 255;
    });
  }
  return true; // IPv6 — regex suffit
}
