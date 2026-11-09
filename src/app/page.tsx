import Link from "next/link";
import { Shell } from "@/components/Shell";
import { sitio } from "@/config/sitio";
import { db } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Inicio(props: { searchParams: Promise<{ origen?: string }> }) {
  const searchParams = await props.searchParams;
  // Mide cuántas personas llegan desde el banner del hospital o desde el afiche QR.
  if (searchParams.origen === "sitio-hospital" || searchParams.origen === "qr") {
    try { await db().from("visitas").insert({ fuente: searchParams.origen }); } catch { /* no bloquea */ }
  }
  return (
    <Shell>
      <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
        ¿Tiene hora en el {sitio.hospital.replace(/^Hospital /, "hospital ")}?
      </h1>
      <p className="mt-4 text-xl leading-relaxed text-ink-soft">
        Le avisamos antes de su cita y le mostramos cómo llegar. Sin RUT y sin crear una cuenta.
      </p>

      <div className="mt-10 grid gap-4">
        <Link href="/recordatorio" className="group rounded-2xl border-2 border-pine bg-pine p-6 text-white hover:bg-pine-dark">
          <span className="block text-2xl font-bold">Quiero un recordatorio</span>
          <span className="mt-1 block text-white/85">Por WhatsApp, mensaje de texto o correo, en el horario que le acomode.</span>
        </Link>
        <Link href="/como-llegar" className="rounded-2xl border-2 border-line bg-white p-6 hover:border-pine">
          <span className="block text-2xl font-bold">¿Cómo llego al hospital?</span>
          <span className="mt-1 block text-ink-soft">Micros, colectivos y buses desde su sector o comuna.</span>
        </Link>
      </div>

      <p className="mt-10 text-base text-ink-soft">
        También puede pedir el recordatorio para un familiar: sólo necesita el celular o correo donde quiere recibirlo.
      </p>
    </Shell>
  );
}
