"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/supabase";
import { planificar, normalizarCelular, normalizarCorreo, RANGOS, AVISOS, type Aviso, type Rango } from "@/lib/agenda";
import { fromChileLocal, DAY } from "@/lib/time";
import { crearToken, hashIp } from "@/lib/token";
import { despachar } from "@/lib/despacho";
import { origenPorId } from "@/data/transporte";

export interface Estado { error?: string; campo?: string }

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function crearRecordatorio(_: Estado, f: FormData): Promise<Estado> {
  if (s(f, "sitio_web")) return { error: "No se pudo registrar." }; // trampa para robots

  // Fecha y hora de la cita
  let citaEn: Date;
  try { citaEn = fromChileLocal(`${s(f, "fecha")}T${s(f, "hora")}`); }
  catch { return { error: "Indique la fecha y la hora de su cita.", campo: "fecha" }; }
  const ahora = Date.now();
  if (citaEn.getTime() < ahora + 60 * 60_000) return { error: "La cita debe ser al menos en una hora más.", campo: "fecha" };
  if (citaEn.getTime() > ahora + 180 * DAY) return { error: "Sólo registramos citas dentro de los próximos 6 meses.", campo: "fecha" };

  // Canal y contacto
  const canal = s(f, "canal");
  if (!["whatsapp", "sms", "email"].includes(canal)) return { error: "Elija cómo quiere recibir el aviso.", campo: "canal" };
  const contacto = canal === "email" ? normalizarCorreo(s(f, "contacto")) : normalizarCelular(s(f, "contacto"));
  if (!contacto) {
    return {
      error: canal === "email" ? "Revise el correo electrónico." : "Revise el celular. Ejemplo: 9 1234 5678, o con código de país si es extranjero (+58…).",
      campo: "contacto",
    };
  }

  const avisos = f.getAll("avisos").map(String).filter((a): a is Aviso => a in AVISOS);
  if (avisos.length === 0) return { error: "Elija al menos un aviso.", campo: "avisos" };
  const rango = s(f, "rango") as Rango;
  if (!(rango in RANGOS)) return { error: "Elija el horario para recibir los avisos.", campo: "rango" };
  if (f.get("consentimiento") !== "on") return { error: "Para enviarle avisos necesitamos su autorización.", campo: "consentimiento" };

  const origen = s(f, "origen");
  const sb = db();

  // Límites contra abuso
  const ip = ((await headers()).get("x-forwarded-for") ?? "").split(",")[0].trim() || "desconocida";
  const ipHash = hashIp(ip);
  const haceUnaHora = new Date(ahora - 60 * 60_000).toISOString();
  const { count: porIp } = await sb.from("recordatorios").select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash).gte("creado_en", haceUnaHora);
  if ((porIp ?? 0) >= 10) return { error: "Se registraron muchos recordatorios desde esta conexión. Intente más tarde." };
  const { count: porContacto } = await sb.from("recordatorios").select("id", { count: "exact", head: true })
    .eq("contacto", contacto).is("anulado_en", null).gt("cita_en", new Date().toISOString());
  if ((porContacto ?? 0) >= 5) return { error: "Este contacto ya tiene 5 recordatorios activos. Anule alguno desde el enlace que recibió." };

  const { data: r, error } = await sb.from("recordatorios").insert({
    nombre: s(f, "nombre").slice(0, 80) || null,
    canal, contacto,
    cita_en: citaEn.toISOString(),
    especialidad: s(f, "especialidad").slice(0, 80) || null,
    lugar: s(f, "lugar").slice(0, 120) || null,
    origen: origenPorId(origen) ? origen : null,
    rango, ip_hash: ipHash, consentimiento_en: new Date().toISOString(),
  }).select("id").single();
  if (error || !r) return { error: "No se pudo registrar. Intente nuevamente." };

  const plan = planificar(citaEn, rango, avisos);
  await sb.from("mensajes").insert(plan.map((p) => ({
    recordatorio_id: r.id, tipo: p.tipo, enviar_en: p.enviarEn.toISOString(),
    // La confirmación se envía ahora mismo: se reserva como "enviado" para que la tarea no la repita.
    estado: p.tipo === "confirmacion" ? "enviado" : "pendiente",
  })));
  const { data: conf } = await sb.from("mensajes").select("id, recordatorio_id, tipo").eq("recordatorio_id", r.id).eq("tipo", "confirmacion").single();
  if (conf) await despachar(sb, conf);

  redirect(`/r/${crearToken(r.id)}?nuevo=1`);
}
