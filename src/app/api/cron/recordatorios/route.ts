import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/supabase";
import { despachar } from "@/lib/despacho";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function autorizado(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const a = Buffer.from(req.headers.get("authorization") ?? ""), b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Tarea programada (cada hora): envía los avisos vencidos y borra los datos
 * de citas con más de 30 días. Toma los mensajes de forma atómica, por lo que
 * dos ejecuciones simultáneas no duplican envíos.
 */
export async function GET(req: NextRequest) {
  if (!autorizado(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const sb = db();
  const resumen: Record<string, number> = {};

  const { data: lote, error } = await sb.rpc("tomar_mensajes_pendientes", { p_limite: 200 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  for (const m of (lote ?? []) as { id: string; recordatorio_id: string; tipo: any }[]) {
    const estado = await despachar(sb, m).catch(async (e) => {
      await sb.from("mensajes").update({ estado: "fallido", error: String(e) }).eq("id", m.id);
      return "fallido";
    });
    resumen[estado ?? "omitido"] = (resumen[estado ?? "omitido"] ?? 0) + 1;
  }

  const limite = new Date(Date.now() - 30 * 24 * 3_600_000).toISOString();
  const { count: borrados } = await sb.from("recordatorios").delete({ count: "exact" }).lt("cita_en", limite);
  await sb.from("consultas_transporte").delete().lt("creado_en", new Date(Date.now() - 365 * 24 * 3_600_000).toISOString());

  return NextResponse.json({ ok: true, procesados: (lote ?? []).length, resumen, borrados: borrados ?? 0 });
}
