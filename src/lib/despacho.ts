import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { redactar } from "./mensajes";
import { enviar } from "./envio";
import { crearToken } from "./token";
import { appUrl, sitio } from "@/config/sitio";
import type { TipoMensaje } from "./agenda";

/** Redacta y envía un mensaje ya reservado (estado "enviado" provisional) y guarda el resultado. */
export async function despachar(sb: SupabaseClient, m: { id: string; recordatorio_id: string; tipo: TipoMensaje }) {
  const { data: r } = await sb.from("recordatorios").select("*").eq("id", m.recordatorio_id).single();
  if (!r) return;
  const omitir =
    r.anulado_en ||
    (m.tipo !== "post_cita" && m.tipo !== "confirmacion" && (r.no_asistira_en || new Date(r.cita_en) <= new Date())) ||
    (m.tipo === "post_cita" && (r.no_asistira_en || r.asistio !== null));
  if (omitir) {
    await sb.from("mensajes").update({ estado: "omitido" }).eq("id", m.id);
    return "omitido";
  }
  const base = appUrl();
  const { asunto, texto } = redactar(m.tipo, {
    hospital: sitio.hospital, nombre: r.nombre, citaEn: r.cita_en, especialidad: r.especialidad, lugar: r.lugar,
    enlaceGestion: `${base}/r/${crearToken(r.id)}`,
    enlaceTransporte: `${base}/como-llegar${r.origen ? `/${r.origen}` : ""}`,
  });
  const res = await enviar(r.canal, r.contacto, asunto, texto);
  await sb.from("mensajes").update({
    estado: res.estado, cuerpo: texto, error: res.error ?? null, ref_proveedor: res.ref ?? null, enviado_en: new Date().toISOString(),
  }).eq("id", m.id);
  return res.estado;
}
