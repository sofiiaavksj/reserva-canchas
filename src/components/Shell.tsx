import Link from "next/link";
import { sitio } from "@/config/sitio";

/** Marco común de las páginas públicas: encabezado simple y pie con aclaración. */
export function Shell({ children, back }: { children: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print border-b border-line bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-4">
          <Link href="/" className="font-bold text-pine">{sitio.hospital}</Link>
          {back && <Link href={back.href} className="link text-base">{back.label}</Link>}
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">{children}</main>
      <footer className="no-print border-t border-line bg-white">
        <div className="mx-auto max-w-2xl px-5 py-5 text-base text-ink-soft">
          Este servicio no agenda ni cambia horas médicas.
          {sitio.telefonoSome ? ` Para eso, llame a SOME al ${sitio.telefonoSome}.` : " Para eso, comuníquese con SOME del hospital."}
          {" "}<Link href="/privacidad" className="link">Cómo usamos sus datos</Link>
        </div>
      </footer>
    </div>
  );
}

export function Notice({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <div role={error ? "alert" : "status"}
      className={`mb-6 rounded-lg border px-4 py-3 font-bold ${error ? "border-risk-alto/30 bg-red-50 text-risk-alto" : "border-risk-bajo/30 bg-emerald-50 text-risk-bajo"}`}>
      {error ?? ok}
    </div>
  );
}
