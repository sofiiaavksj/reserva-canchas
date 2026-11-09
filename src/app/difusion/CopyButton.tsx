"use client";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="btn-secondary btn-sm"
      onClick={async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); } catch { /* sin portapapeles */ } }}>
      {ok ? "Copiado" : "Copiar código"}
    </button>
  );
}

export function PrintButtonClient() {
  return <button type="button" onClick={() => window.print()} className="btn-primary">Imprimir afiche</button>;
}
