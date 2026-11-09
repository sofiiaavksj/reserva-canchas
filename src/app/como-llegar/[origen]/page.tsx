import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { BotonesApps, Paraderos, Ruta } from "@/components/Transporte";
import { CONSEJOS, origenPorId } from "@/data/transporte";
import { db } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ origen: string }> }) {
  const o = origenPorId((await props.params).origen);
  return { title: o ? `Cómo llegar desde ${o.nombre}` : "Cómo llegar" };
}

export default async function Page(props: { params: Promise<{ origen: string }> }) {
  const params = await props.params;
  const o = origenPorId(params.origen);
  if (!o) notFound();
  // Registro anónimo de la consulta (sólo el sector), para los indicadores.
  try { await db().from("consultas_transporte").insert({ origen: o.id }); } catch { /* no bloquea la página */ }
  const textoOrigen = `${o.nombre.split(" /")[0].split(" (")[0]}, ${o.grupo === "Otras comunas" ? o.nombre.split(" /")[0] : o.grupo}, Chile`;

  return (
    <Shell back={{ href: "/como-llegar", label: "Otro sector" }}>
      <h1 className="text-3xl font-bold tracking-tight">Desde {o.nombre}</h1>
      <p className="mt-2 text-ink-soft">Alternativas en transporte público hacia el hospital.</p>

      <div className="mt-6"><BotonesApps origen={textoOrigen} /></div>

      <div className="mt-8 space-y-4">
        {o.opciones.map((op, i) => <Ruta key={i} op={op} origen={o.nombre} />)}
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-bold">Paraderos cerca del hospital</h2>
        <Paraderos />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-bold">Antes de salir</h2>
        <ul className="list-disc space-y-1 pl-6">{CONSEJOS.map((c) => <li key={c}>{c}</li>)}</ul>
      </section>

      <section className="mt-10 rounded-2xl border-2 border-pine bg-white p-5">
        <h2 className="text-xl font-bold">¿Quiere que le recordemos su hora?</h2>
        <p className="mt-1 text-ink-soft">Le avisamos por WhatsApp, SMS o correo, con esta ruta incluida.</p>
        <Link href={`/recordatorio?origen=${o.id}`} className="btn-primary mt-4">Activar recordatorio</Link>
      </section>
    </Shell>
  );
}
