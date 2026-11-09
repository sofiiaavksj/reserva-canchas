/** Fechas en hora de Chile, independientemente de dónde corra el servidor. */
export const TZ = "America/Santiago";
export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-CL", { timeZone: TZ, ...opts });

export function formatDateLong(d: Date | string) {
  return fmt({ weekday: "long", day: "numeric", month: "long" }).format(new Date(d));
}
export function formatDateShort(d: Date | string) {
  return fmt({ weekday: "short", day: "numeric", month: "short" }).format(new Date(d));
}
export function formatDateNumeric(d: Date | string) {
  return fmt({ day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d));
}
export function formatTime(d: Date | string) {
  return fmt({ hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(d));
}
export function formatDateTime(d: Date | string) {
  return `${formatDateShort(d)}, ${formatTime(d)}`;
}

/** Partes de fecha/hora en Chile. */
export function chileParts(d: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    }).formatToParts(d).map((p) => [p.type, p.value])
  );
  return {
    year: Number(parts.year), month: Number(parts.month), day: Number(parts.day),
    hour: Number(parts.hour) % 24, minute: Number(parts.minute), second: Number(parts.second),
  };
}

/** "YYYY-MM-DD" del día en Chile. */
export function chileDateKey(d: Date) {
  const p = chileParts(d);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

function offsetMs(d: Date) {
  const p = chileParts(d);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(d.getTime() / 1000) * 1000;
}

/** Convierte una fecha/hora local de Chile ("2026-11-05T09:30") a Date (UTC). */
export function fromChileLocal(local: string): Date {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/);
  if (!m) throw new Error("Fecha inválida");
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0));
  let t = guess - offsetMs(new Date(guess));
  t = guess - offsetMs(new Date(t)); // segunda pasada por cambios de horario
  return new Date(t);
}

/** Inicio del día (00:00 en Chile) que contiene a d, desplazado n días. */
export function startOfChileDay(d: Date, addDays = 0): Date {
  const key = chileDateKey(new Date(d.getTime() + addDays * DAY));
  return fromChileLocal(key);
}

export function isMorning(d: Date | string) {
  return chileParts(new Date(d)).hour < 13;
}

export function hoursBetween(a: Date | string, b: Date | string) {
  return (new Date(b).getTime() - new Date(a).getTime()) / HOUR;
}

export function relativeDays(target: Date | string, now = new Date()) {
  const a = startOfChileDay(now).getTime();
  const b = startOfChileDay(new Date(target)).getTime();
  const days = Math.round((b - a) / DAY);
  if (days === 0) return "hoy";
  if (days === 1) return "mañana";
  if (days === -1) return "ayer";
  if (days > 1) return `en ${days} días`;
  return `hace ${-days} días`;
}
