import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell, Notice } from "@/components/Shell";
import { SubmitButton } from "@/components/SubmitButton";
import { db } from "@/lib/supabase";
import { leerToken } from "@/lib/token";
import { ocultarContacto, RANGOS, type Rango } from "@/lib/agenda";
import { formatDateLong, formatTime, formatDateTime, relativeDays } from "@/lib/time";
import { origenPorId } from "@/data/transporte";
import { sitio } from "@/config/sitio";
import { anular, noPodreIr, responderAsistencia } from "./actions";

export const metadata = { title: "Mi recordatorio", referrer: "no-referrer", robots: { index: false } };
export const dynamic = "force-dynamic";

const TIPO: Record<string, string> = {
  confirmacion: "Confirmación de registro", dos_dias: "Aviso 2 días antes", un_dia: "Aviso 1 día antes",
  mismo_dia: "Aviso el mismo día", post_cita: "Pregunta: ¿pudo asistir?",
};
const CANAL: Record<string, string> = { whatsapp: "WhatsApp", sms: "mensaje de texto", email: "correo" };

export default async function Page(props: { params: Promise<{ token: string }>; searchParams: Promise<{ nuevo?: string; aviso?: string; ok?: string }> }) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const id = leerToken(params.token);
  if (!id) notFound();
  const sb = db();
  const [{ data: r }, { data: msgs }] = await Promise.all([
    sb.from("recordatorios").select("*").eq("id", id).maybeSingle(),
    sb.from("mensajes").select("tipo, enviar_en, estado").eq("recordatorio_id", id).order("enviar_en"),
  ]);
  if (!r) {
    return <Shell><h1 className="text-2xl font-bold">Este recordatorio ya no existe</h1><p className="mt-2 text-ink-soft">Los datos se borran 30 días después de la cita.</p><Link href="/recordatorio" className="btn-primary mt-6">Crear un recordatorio</Link></Shell>;
  }
  const pasada = new Date(r.cita_en) <= new Date();
  const origen = r.origen ? origenPorId(r.origen) : undefined;
  const hidden = <input type="hidden" name="token" value={params.token} />;

  return (
    <Shell>
      {searchParams.nuevo && (
        <Notice ok={`Listo. Le enviamos una confirmación por ${CANAL[r.canal]} a ${ocultarContacto(r.contacto)}. Guarde ese mensaje: trae el enlace a esta página.`} />
      )}
      <Notice ok={searchParams.ok} />

      <div className="flex overflow-hidden rounded-2xl border border-line bg-white">
        <div className="min-w-0 flex-1 p-5 sm:p-7">
          <p className="text-lg font-bold text-pine">{r.especialidad ?? "Hora médica"}</p>
          <p className="mt-3 text-xl first-letter:uppercase">{formatDateLong(r.cita_en)}</p>
          <p className="text-6xl font-bold leading-none tracking-tight sm:text-7xl">{formatTime(r.cita_en)}</p>
          <p className="mt-4 text-ink-soft">{sitio.hospital}{r.lugar && <><br />{r.lugar}</>}</p>
        </div>
        <div className={`flex w-28 shrink-0 flex-col items-center justify-center gap-1 border-l-2 border-dashed border-line p-3 text-center sm:w-36 ${
          r.anulado_en || r.no_asistira_en ? "bg-zinc-100 text-zinc-600" : "bg-pine-soft text-pine"}`}>
          <span className="text-lg font-bold leading-tight">{r.anulado_en ? "Avisos anulados" : r.no_asistira_en ? "No asistirá" : pasada ? "Cita pasada" : "Avisos activos"}</span>
          {!pasada && <span className="text-base first-letter:uppercase">{relativeDays(r.cita_en)}</span>}
        </div>
      </div>

      {/* Después de la cita */}
      {pasada && !r.no_asistira_en && (
        <section className="mt-8 rounded-2xl border-2 border-pine bg-white p-5">
          {r.asistio === null ? (
            <>
              <h2 className="text-2xl font-bold">¿Pudo asistir a su hora?</h2>
              <div className="mt-4 flex gap-3">
                <form action={responderAsistencia} className="flex-1">{hidden}<input type="hidden" name="asistio" value="1" /><SubmitButton className="btn-primary w-full py-4 text-lg">Sí, asistí</SubmitButton></form>
                <form action={responderAsistencia} className="flex-1">{hidden}<input type="hidden" name="asistio" value="0" /><SubmitButton className="btn-secondary w-full py-4 text-lg">No pude ir</SubmitButton></form>
              </div>
            </>
          ) : (
            <p className="text-lg font-bold">Gracias. Registramos que {r.asistio ? "asistió" : "no pudo asistir"}.</p>
          )}
        </section>
      )}

      {/* "No podré ir": la plataforma no puede liberar la hora; orienta a avisar a SOME. */}
      {(searchParams.aviso || r.no_asistira_en) && !pasada && (
        <section className="mt-8 rounded-2xl border-2 border-marigold bg-marigold-soft p-5">
          <h2 className="text-2xl font-bold">Avise al hospital para liberar su hora</h2>
          <p className="mt-2">Ya no le enviaremos recordatorios. Para que otro paciente pueda usar su hora, comuníquese con SOME{sitio.horarioSome ? ` (${sitio.horarioSome})` : ""}.</p>
          {sitio.telefonoSome && <a href={`tel:${sitio.telefonoSome.replace(/\s/g, "")}`} className="btn-primary mt-4 w-full py-4 text-lg sm:w-auto">Llamar a SOME: {sitio.telefonoSome}</a>}
        </section>
      )}

      {!pasada && !r.anulado_en && !r.no_asistira_en && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a href={`/r/${params.token}/calendario`} className="btn-secondary py-4">Agregar a mi calendario</a>
          <Link href={origen ? `/como-llegar/${origen.id}` : "/como-llegar"} className="btn-secondary py-4">Cómo llegar{origen ? ` desde ${origen.nombre}` : ""}</Link>
        </div>
      )}

      {/* Avisos programados */}
      {!r.anulado_en && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold">Avisos por {CANAL[r.canal]} a {ocultarContacto(r.contacto)}</h2>
          <ul className="divide-y divide-line rounded-xl border border-line bg-white">
            {(msgs ?? []).map((m: any) => (
              <li key={m.tipo} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span>{TIPO[m.tipo]}</span>
                <span className="text-base text-ink-soft">
                  {m.estado === "pendiente" ? `Programado: ${formatDateTime(m.enviar_en)}` : m.estado === "omitido" ? "No se enviará" : m.estado === "fallido" ? "No se pudo enviar" : "Enviado"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-base text-ink-soft">Horario elegido: {RANGOS[r.rango as Rango].label.toLowerCase()}.</p>
        </section>
      )}

      {!pasada && !r.anulado_en && (
        <section className="mt-10 space-y-3">
          {!r.no_asistira_en && (
            <form action={noPodreIr}>{hidden}<SubmitButton className="btn-secondary w-full py-4 text-lg">No podré ir a esta hora</SubmitButton></form>
          )}
          <details className="rounded-xl border border-line bg-white">
            <summary className="cursor-pointer list-none px-5 py-4 font-bold">Anular los avisos</summary>
            <form action={anular} className="border-t border-line px-5 py-4">
              {hidden}
              <p className="mb-3 text-ink-soft">No le enviaremos más mensajes sobre esta hora. Esto no cancela su hora en el hospital.</p>
              <SubmitButton className="btn-danger">Anular avisos</SubmitButton>
            </form>
          </details>
          <p className="pt-2 text-base text-ink-soft">¿Cambió la fecha de su hora? Anule estos avisos y <Link href="/recordatorio" className="link">cree un recordatorio nuevo</Link>.</p>
        </section>
      )}
    </Shell>
  );
}
