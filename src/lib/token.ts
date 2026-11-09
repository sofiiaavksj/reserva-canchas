import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Enlace personal de cada recordatorio: id + firma HMAC.
 * No se guarda en la base: se recalcula con TOKEN_SECRET. Sin la clave
 * nadie puede fabricar un enlace válido para otro recordatorio.
 */
function secret() {
  const s = process.env.TOKEN_SECRET;
  if (!s || s.length < 32) throw new Error("Configure TOKEN_SECRET (32 caracteres o más)");
  return s;
}

const sign = (id: string) => createHmac("sha256", secret()).update(`recordatorio:${id}`).digest("base64url").slice(0, 32);

export function crearToken(id: string) {
  return `${id}.${sign(id)}`;
}

export function leerToken(token: string): string | null {
  const m = token.match(/^([0-9a-f-]{36})\.([A-Za-z0-9_-]{32})$/);
  if (!m) return null;
  const a = Buffer.from(m[2]), b = Buffer.from(sign(m[1]));
  return a.length === b.length && timingSafeEqual(a, b) ? m[1] : null;
}

/** Hash de la IP para limitar abusos sin guardar la IP. */
export function hashIp(ip: string) {
  return createHmac("sha256", secret()).update(`ip:${ip}`).digest("hex").slice(0, 24);
}
