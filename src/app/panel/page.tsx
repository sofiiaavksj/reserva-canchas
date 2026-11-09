import { db } from "@/lib/supabase";
import { ORIGENES } from "@/data/transporte";
import { ocultarContacto } from "@/lib/agenda";
import { formatDateTime } from "@/lib/time";

export const metadata = { title: "Indicadores", robots: { index: false } };
export const dynamic = "force-dynamic";

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : "Sin datos");
const CANAL: Record<string, string> = { whatsapp: "WhatsApp", sms: "SMS", email: "Correo" };
const RANGO: Record<string, string> = { manana: "Mañana", tarde: "Tarde", noche: "Noche" };
const ESTADO: Record<string, string> = { enviado: "Enviado", simulado: "Simulado", fallido: "Falló", omitido: "Omitido", pendiente: "Pendiente" };

function Barras({ items }: { items: { label: string; n: number }[] }) {
  const total = items.reduce((s, i) => s + i.n, 0);
  const max = Math.max(1, ...items.map((i) => i.n));
  if (!total) return <p className="text-ink-soft">Sin registros aún.</p>;
  return (
    <ul className="space-y-2">
      {[...items].sort((a, b) => b.n - a.n).map((i) => (
        <li key={i.label} className="grid grid-cols-[minmax(7rem,12rem)_1fr_4rem] items-center gap-3 text-base">
          <span>{i.label}</span>
          <span className="h-3 rounded-full bg-mist"><span className="block h-3 rounded-full bg-pine" style={{ width: `${(i.n / max) * 100}%` }} /></span>
          <span className="text-right font-bold">{i.n}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function Panel(props: { searchParams: Promise<{ dias?: string }> }) {
  const searchParams = await props.searchParams;
  const dias = [7, 30, 90].includes(Number(searchParams.dias)) ? Number(searchParams.dias) : 30;
  const desde = new Date(Date.now() - dias * 86_400_000).toISOString();
  const sb = db();
  const [{ data: recs }, { data: msgs }, { data: consultas }, { data: visitas }, { data: ultimos }] = await Promise.all([
    sb.from("recordatorios").select("canal, rango, anulado_en, no_asistira_en, asistio, cita_en, origen").gte("creado_en", desde),
    sb.from("mensajes").select("estado, tipo").gte("enviar_en", desde).lte("enviar_en", new Date().toISOString()),
    sb.from("consultas_transporte").select("origen").gte("creado_en", desde),
    sb.from("visitas").select("fuente").gte("creado_en", desde),
    sb.from("mensajes").select("tipo, estado, cuerpo, error, enviado_en, recordatorio:recordatorios(canal, contacto)").neq("estado", "pendiente").order("enviado_en", { ascending: false }).limit(25),
  ]);
  const r = recs ?? [];
  const respondieron = r.filter((x) => x.asistio !== null);
  const asistieron = respondieron.filter((x) => x.asistio).length;
  const m = msgs ?? [];
  const contar = <T,>(arr: T[], key: (x: T) => string, labels?: Record<string, string>) =>
    Object.entries(arr.reduce<Record<string, number>>((acc, x) => ((acc[key(x)] = (acc[key(x)] ?? 0) + 1), acc), {}))
      .map(([k, n]) => ({ label: labels?.[k] ?? k, n }));
  const nombreOrigen = Object.fromEntries(ORIGENES.map((o) => [o.id, o.nombre]));

  const kpis = [
    { t: "Recordatorios creados", v: String(r.length), d: `${r.filter((x) => x.anulado_en).length} anulados` },
    { t: "Asistió (según el paciente)", v: pct(asistieron, respondieron.length), d: `${asistieron} de ${respondieron.length} respuestas` },
    { t: "Avisaron que no irían", v: String(r.filter((x) => x.no_asistira_en).length), d: "Se les indicó llamar a SOME" },
    { t: "Consultas de transporte", v: String((consultas ?? []).length), d: `Visitas desde el hospital: ${(visitas ?? []).filter((v) => v.fuente === "sitio-hospital").length}; desde QR: ${(visitas ?? []).filter((v) => v.fuente === "qr").length}` },
  ];

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 text-base">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Indicadores</h1>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <a key={d} href={`/panel?dias=${d}`} className={`rounded-full px-4 py-1.5 font-bold ${d === dias ? "bg-pine text-white" : "bg-white ring-1 ring-line"}`}>{d} días</a>
          ))}
        </div>
      </div>
      <dl className="mb-8 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.t} className="bg-white p-5">
            <dt className="font-bold">{k.t}</dt>
            <dd className="mt-1 text-3xl font-bold text-pine">{k.v}</dd>
            <dd className="text-sm text-ink-soft">{k.d}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-5"><h2 className="mb-4 text-lg font-bold">Medio elegido</h2><Barras items={contar(r, (x) => x.canal, CANAL)} /></section>
        <section className="panel p-5"><h2 className="mb-4 text-lg font-bold">Horario elegido</h2><Barras items={contar(r, (x) => x.rango, RANGO)} /></section>
        <section className="panel p-5"><h2 className="mb-4 text-lg font-bold">Sectores consultados en la guía</h2><Barras items={contar(consultas ?? [], (x) => x.origen, nombreOrigen)} /></section>
        <section className="panel p-5"><h2 className="mb-4 text-lg font-bold">Estado de los avisos</h2><Barras items={contar(m, (x) => x.estado, ESTADO)} /></section>
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Últimos mensajes</h2>
        {process.env.NOTIFY_PROVIDER !== "twilio" && <p className="mb-3 rounded-lg bg-marigold-soft px-4 py-2">Modo simulado: WhatsApp y SMS se registran aquí pero no se envían.</p>}
        <ul className="space-y-2">
          {(ultimos ?? []).map((x: any, i: number) => (
            <li key={i} className="rounded-xl border border-line bg-white p-3">
              <p className="text-sm text-ink-soft">{x.tipo} por {CANAL[x.recordatorio?.canal] ?? "?"} a {x.recordatorio ? ocultarContacto(x.recordatorio.contacto) : "?"}, {x.enviado_en ? formatDateTime(x.enviado_en) : ""}: <strong>{ESTADO[x.estado]}</strong>{x.error ? ` (${x.error})` : ""}</p>
              {x.cuerpo && <p className="mt-1 whitespace-pre-line text-sm">{x.cuerpo.replace(/\/r\/[^\s]+/g, "/r/…")}</p>}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
