import { DAY, HOUR, chileDateKey, fromChileLocal } from "./time";

/**
 * Programación de los avisos de un recordatorio.
 * El paciente elige qué avisos quiere y en qué rango horario recibirlos.
 * La tarea programada corre cada hora, así que el aviso llega dentro del rango.
 */
export type Rango = "manana" | "tarde" | "noche";
export type Aviso = "dos_dias" | "un_dia" | "mismo_dia";
export type TipoMensaje = "confirmacion" | Aviso | "post_cita";

export const RANGOS: Record<Rango, { label: string; hora: string }> = {
  manana: { label: "En la mañana (9:00 a 12:00)", hora: "09:00" },
  tarde: { label: "En la tarde (15:00 a 18:00)", hora: "15:00" },
  noche: { label: "En la noche (19:00 a 21:00)", hora: "19:00" },
};

export const AVISOS: Record<Aviso, string> = {
  dos_dias: "2 días antes",
  un_dia: "1 día antes",
  mismo_dia: "El mismo día, unas 3 horas antes",
};

export interface MensajePlan { tipo: TipoMensaje; enviarEn: Date }

/** Fecha local (Chile) de la cita menos N días, a la hora indicada. */
function enDia(citaEn: Date, diasAntes: number, hora: string) {
  const [y, m, d] = chileDateKey(citaEn).split("-").map(Number);
  const local = new Date(Date.UTC(y, m - 1, d - diasAntes));
  return fromChileLocal(`${local.toISOString().slice(0, 10)}T${hora}`);
}

export function planificar(citaEn: Date, rango: Rango, avisos: Aviso[], ahora = new Date()): MensajePlan[] {
  const plan: MensajePlan[] = [{ tipo: "confirmacion", enviarEn: ahora }];
  const margen = 30 * 60_000;

  if (avisos.includes("dos_dias")) {
    const t = enDia(citaEn, 2, RANGOS[rango].hora);
    if (t.getTime() > ahora.getTime() + margen) plan.push({ tipo: "dos_dias", enviarEn: t });
  }
  if (avisos.includes("un_dia")) {
    const t = enDia(citaEn, 1, RANGOS[rango].hora);
    if (t.getTime() > ahora.getTime() + margen) plan.push({ tipo: "un_dia", enviarEn: t });
  }
  if (avisos.includes("mismo_dia")) {
    // 3 horas antes, pero no antes de las 7:00 del mismo día.
    const temprano = enDia(citaEn, 0, "07:00");
    const t = new Date(Math.max(citaEn.getTime() - 3 * HOUR, temprano.getTime()));
    if (t.getTime() < citaEn.getTime() - 45 * 60_000 && t.getTime() > ahora.getTime() + margen) {
      plan.push({ tipo: "mismo_dia", enviarEn: t });
    }
  }
  // Pregunta "¿Pudo asistir?": 3 horas después; si cae de noche, al día siguiente a las 10:00.
  let post = new Date(citaEn.getTime() + 3 * HOUR);
  const horaLocal = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "America/Santiago", hour: "2-digit", hourCycle: "h23" }).format(post));
  if (horaLocal >= 21 || horaLocal < 8) post = enDia(new Date(citaEn.getTime() + DAY), 0, "10:00");
  plan.push({ tipo: "post_cita", enviarEn: post });
  return plan;
}

/** Celular en formato internacional (+569XXXXXXXX o número extranjero), o null. */
export function normalizarCelular(input: string): string | null {
  const s = input.replace(/[\s\-().]/g, "");
  if (/^9\d{8}$/.test(s)) return `+56${s}`;
  if (/^569\d{8}$/.test(s)) return `+${s}`;
  if (/^\+569\d{8}$/.test(s)) return s;
  if (/^\+(?!56)\d{8,15}$/.test(s)) return s; // número extranjero
  return null;
}

export function normalizarCorreo(input: string): string | null {
  const s = input.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 120 ? s : null;
}

/** Oculta parte del contacto para mostrarlo en pantalla. */
export function ocultarContacto(c: string) {
  if (c.includes("@")) {
    const [u, d] = c.split("@");
    return `${u.slice(0, 2)}${"•".repeat(Math.max(1, u.length - 2))}@${d}`;
  }
  return `${c.slice(0, 4)}${"•".repeat(Math.max(0, c.length - 7))}${c.slice(-3)}`;
}
