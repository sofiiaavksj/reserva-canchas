import { db } from "@/lib/supabase";
import { leerToken } from "@/lib/token";
import { sitio } from "@/config/sitio";
import { HOSPITAL } from "@/data/transporte";

export const dynamic = "force-dynamic";

const ics = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

/** Evento .ics con alarmas 1 día y 2 horas antes, para el calendario del celular. */
export async function GET(_: Request, ctx: { params: Promise<{ token: string }> }) {
  const params = await ctx.params;
  const id = leerToken(params.token);
  if (!id) return new Response("No encontrado", { status: 404 });
  const { data: r } = await db().from("recordatorios").select("id, cita_en, especialidad, lugar").eq("id", id).maybeSingle();
  if (!r) return new Response("No encontrado", { status: 404 });
  const start = new Date(r.cita_en);
  const end = new Date(start.getTime() + 60 * 60_000);
  const titulo = `Hora médica${r.especialidad ? `: ${r.especialidad}` : ""}`;
  const body = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Agenda virtual//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${r.id}@agenda`, `DTSTAMP:${ics(new Date())}`, `DTSTART:${ics(start)}`, `DTEND:${ics(end)}`,
    `SUMMARY:${esc(titulo)}`,
    `LOCATION:${esc(`${sitio.hospital}, ${HOSPITAL.direccion}${r.lugar ? `. ${r.lugar}` : ""}`)}`,
    `DESCRIPTION:${esc("Lleve su cédula de identidad y llegue 20 minutos antes.")}`,
    "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${esc(titulo)} mañana`, "END:VALARM",
    "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", `DESCRIPTION:${esc(titulo)} en 2 horas`, "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return new Response(body, {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'attachment; filename="hora-medica.ics"', "Cache-Control": "no-store" },
  });
}
