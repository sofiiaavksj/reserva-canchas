import { Shell } from "@/components/Shell";
import { Formulario } from "./Formulario";
import { AVISOS, RANGOS } from "@/lib/agenda";
import { ORIGENES } from "@/data/transporte";
import { ESPECIALIDADES } from "@/data/especialidades";
import { chileDateKey } from "@/lib/time";

export const metadata = { title: "Recordatorio de mi hora" };
export const dynamic = "force-dynamic";

export default async function Page(props: { searchParams: Promise<{ origen?: string }> }) {
  const searchParams = await props.searchParams;
  const grupos = ["Coquimbo", "La Serena", "Otras comunas"].map((g) => ({
    grupo: g, items: ORIGENES.filter((o) => o.grupo === g).map((o) => ({ id: o.id, nombre: o.nombre })),
  }));
  return (
    <Shell back={{ href: "/", label: "Volver" }}>
      <h1 className="text-3xl font-bold tracking-tight">Recordatorio de su hora</h1>
      <p className="mb-8 mt-2 text-ink-soft">Complete los datos de la hora que le dio el hospital. Toma un minuto.</p>
      <Formulario
        hoy={chileDateKey(new Date())}
        especialidades={ESPECIALIDADES}
        rangos={Object.entries(RANGOS).map(([value, r]) => ({ value, label: r.label }))}
        avisos={Object.entries(AVISOS).map(([value, label]) => ({ value, label }))}
        origenes={grupos}
        origenInicial={searchParams.origen}
      />
    </Shell>
  );
}
