import Link from "next/link";
import { Shell } from "@/components/Shell";
import { BotonesApps, Paraderos } from "@/components/Transporte";
import { ORIGENES, HOSPITAL, CONSEJOS } from "@/data/transporte";

export const metadata = { title: "Cómo llegar" };

export default function Page() {
  const grupos = ["Coquimbo", "La Serena", "Otras comunas"] as const;
  return (
    <Shell back={{ href: "/", label: "Volver" }}>
      <h1 className="text-3xl font-bold tracking-tight">¿Cómo llego al hospital?</h1>
      <p className="mt-2 text-ink-soft">{HOSPITAL.nombre}, {HOSPITAL.direccion}.</p>

      <section className="mt-8">
        <h2 className="mb-3 text-2xl font-bold">¿Desde dónde viaja?</h2>
        {grupos.map((g) => (
          <div key={g} className="mb-6">
            <h3 className="mb-2 font-bold text-ink-soft">{g}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {ORIGENES.filter((o) => o.grupo === g).map((o) => (
                <Link key={o.id} href={`/como-llegar/${o.id}`} className="rounded-xl border-2 border-line bg-white px-4 py-3 font-bold hover:border-pine">
                  {o.nombre}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6">
        <h2 className="mb-1 text-2xl font-bold">La ruta más rápida, ahora</h2>
        <p className="mb-4 text-ink-soft">Estas aplicaciones calculan el recorrido con el tráfico y los horarios del momento.</p>
        <BotonesApps />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-bold">Paraderos cerca del hospital</h2>
        <Paraderos />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-2xl font-bold">Antes de salir</h2>
        <ul className="list-disc space-y-1 pl-6">{CONSEJOS.map((c) => <li key={c}>{c}</li>)}</ul>
      </section>
    </Shell>
  );
}
