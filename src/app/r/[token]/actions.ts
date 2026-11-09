"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/supabase";
import { leerToken } from "@/lib/token";

async function cargar(f: FormData) {
  const token = String(f.get("token") ?? "");
  const id = leerToken(token);
  if (!id) redirect("/");
  return { sb: db(), id, path: `/r/${token}` };
}

export async function noPodreIr(f: FormData) {
  const { sb, id, path } = await cargar(f);
  await sb.from("recordatorios").update({ no_asistira_en: new Date().toISOString() }).eq("id", id).is("no_asistira_en", null);
  redirect(`${path}?aviso=1`);
}

export async function anular(f: FormData) {
  const { sb, id, path } = await cargar(f);
  await sb.from("recordatorios").update({ anulado_en: new Date().toISOString() }).eq("id", id).is("anulado_en", null);
  await sb.from("mensajes").update({ estado: "omitido" }).eq("recordatorio_id", id).eq("estado", "pendiente");
  redirect(`${path}?ok=${encodeURIComponent("Listo, no le enviaremos más avisos para esta hora.")}`);
}

export async function responderAsistencia(f: FormData) {
  const { sb, id, path } = await cargar(f);
  await sb.from("recordatorios").update({ asistio: f.get("asistio") === "1", asistio_respondido_en: new Date().toISOString() })
    .eq("id", id).lte("cita_en", new Date().toISOString());
  redirect(`${path}?ok=${encodeURIComponent("Gracias por responder.")}`);
}
