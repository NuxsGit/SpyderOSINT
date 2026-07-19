// src/lib/modules/discord/snowflake.ts

/**
 * Décodage d'un Snowflake Discord
 * Un Snowflake contient : timestamp, epoch Discord, worker ID, process ID, increment
 */
export function decodeSnowflake(snowflake: string): {
  timestamp: string;
  unixTimestamp: number;
  snowflake: string;
  binary: string;
} {
  const id = BigInt(snowflake);
  
  // Discord epoch : 2021-01-01 (en ms depuis epoch Unix)
  const discordEpoch = 1420070400000n;
  
  // Extraire le timestamp (22 bits de gauche)
  const timestamp = (id >> 22n) + discordEpoch;
  
  // Convertir en date lisible
  const date = new Date(Number(timestamp));
  
  return {
    timestamp: date.toISOString(),
    unixTimestamp: Number(timestamp),
    snowflake,
    binary: id.toString(2).padStart(64, '0'),
  };
}