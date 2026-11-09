import { MODO_LABEL, type Opcion, PARADEROS, HOSPITAL, mapsUrl } from "@/data/transporte";

/** Letrero de línea, como el que llevan las micros en el parabrisas. */
export function Linea({ texto }: { texto: string }) {
  const [num, ...resto] = texto.split(" ");
  return (
    <span className="inline-flex items-stretch overflow-hidden rounded-md border-2 border-ink text-base font-bold">
      <span className="bg-ink px-2 text-white">{num}</span>
      {resto.length > 0 && <span className="bg-marigold-soft px-2">{resto.join(" ")}</span>}
    </span>
  );
}

export function PorVerificar({ ok }: { ok: boolean }) {
  return ok ? null : (
    <span className="rounded-full bg-marigold-soft px-2.5 py-0.5 text-sm font-bold text-[#7A5410]">Por verificar</span>
  );
}

/** Una alternativa de viaje como recorrido paso a paso. */
export function Ruta({ op, origen }: { op: Opcion; origen: string }) {
  const pasos = [
    { titulo: `Desde ${origen}`, cuerpo: op.tomarEn ? `Tómelo en ${op.tomarEn}.` : null },
    { titulo: MODO_LABEL[op.modo], cuerpo: null, lineas: op.lineas },
    op.bajarseEn ? { titulo: "Bájese en", cuerpo: op.bajarseEn } : null,
    { titulo: HOSPITAL.nombre, cuerpo: HOSPITAL.direccion },
  ].filter(Boolean) as { titulo: string; cuerpo: string | null; lineas?: string[] }[];

  return (
    <article className="rounded-2xl border border-line bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-bold">{MODO_LABEL[op.modo]}</h3>
        <div className="flex items-center gap-2">
          {op.minutos && <span className="font-bold">{op.minutos} min aprox.</span>}
          {op.tarifa && <span className="text-ink-soft">{op.tarifa}</span>}
          <PorVerificar ok={op.verificado} />
        </div>
      </div>
      <ol className="relative ml-2 border-l-4 border-pine/25">
        {pasos.map((p, i) => (
          <li key={i} className="relative pb-5 pl-6 last:pb-0">
            <span className={`absolute -left-[11px] top-1 h-[18px] w-[18px] rounded-full border-4 ${i === pasos.length - 1 ? "border-pine bg-pine" : "border-pine bg-white"}`} aria-hidden />
            <p className="font-bold">{p.titulo}</p>
            {p.lineas && p.lineas.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{p.lineas.map((l) => <Linea key={l} texto={l} />)}</div>}
            {p.cuerpo && <p className="text-ink-soft">{p.cuerpo}</p>}
          </li>
        ))}
      </ol>
      {op.nota && <p className="mt-4 rounded-lg bg-mist px-3 py-2 text-base">{op.nota}</p>}
      <p className="mt-3 text-sm text-ink-soft">Fuente: {op.fuente}</p>
    </article>
  );
}

export function BotonesApps({ origen }: { origen?: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <a href={mapsUrl(origen)} target="_blank" rel="noopener noreferrer" className="btn-primary py-4 text-lg">
        {origen ? "Ver ruta en Google Maps" : "Ruta desde donde estoy (Google Maps)"}
      </a>
      <a href={HOSPITAL.moovitUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary py-4 text-lg">Ver en Moovit</a>
    </div>
  );
}

export function Paraderos() {
  return (
    <ul className="divide-y divide-line rounded-xl border border-line bg-white">
      {PARADEROS.map((p) => (
        <li key={p.nombre} className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold">{p.nombre}</p>
            <PorVerificar ok={p.verificado} />
          </div>
          <p className="text-base text-ink-soft">{p.distancia}</p>
          <div className="mt-2 flex flex-wrap gap-2">{p.lineas.map((l) => <Linea key={l} texto={l} />)}</div>
        </li>
      ))}
    </ul>
  );
}
