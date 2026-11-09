"use client";
import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { crearRecordatorio, type Estado } from "./actions";

interface Props {
  hoy: string;
  especialidades: string[];
  rangos: { value: string; label: string }[];
  avisos: { value: string; label: string }[];
  origenes: { grupo: string; items: { id: string; nombre: string }[] }[];
  origenInicial?: string;
}

const CANALES = [
  { value: "whatsapp", label: "WhatsApp", ayuda: "Celular", placeholder: "9 1234 5678" },
  { value: "sms", label: "Mensaje de texto", ayuda: "Celular", placeholder: "9 1234 5678" },
  { value: "email", label: "Correo", ayuda: "Correo electrónico", placeholder: "nombre@correo.cl" },
];

const tile = "flex cursor-pointer items-center gap-3 rounded-xl border-2 border-line bg-white px-4 py-3 has-[:checked]:border-pine has-[:checked]:bg-pine-soft";

export function Formulario({ hoy, especialidades, rangos, avisos, origenes, origenInicial }: Props) {
  const [estado, accion, pendiente] = useActionState<Estado, FormData>(crearRecordatorio, {});
  const [canal, setCanal] = useState("whatsapp");
  const alerta = useRef<HTMLParagraphElement>(null);
  // En el celular el error queda arriba: se lleva la vista hasta él.
  useEffect(() => {
    if (estado.error) { alerta.current?.scrollIntoView({ behavior: "smooth", block: "center" }); alerta.current?.focus(); }
  }, [estado]);
  const c = CANALES.find((x) => x.value === canal)!;
  const err = (campo: string) => estado.campo === campo;

  return (
    <form
      className="space-y-10"
      noValidate
      // Se envía con onSubmit (no con action) para que, si hay un error, el formulario conserve lo escrito.
      onSubmit={(e) => {
        e.preventDefault();
        const datos = new FormData(e.currentTarget);
        startTransition(() => accion(datos));
      }}
    >
      {estado.error && <p ref={alerta} tabIndex={-1} role="alert" className="rounded-lg border border-risk-alto/30 bg-red-50 px-4 py-3 font-bold text-risk-alto">{estado.error}</p>}
      <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <fieldset>
        <legend className="mb-3 text-2xl font-bold">Su hora</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="label">Fecha</span>
            <input type="date" name="fecha" required min={hoy} className={`field ${err("fecha") ? "border-risk-alto" : ""}`} /></label>
          <label className="block"><span className="label">Hora</span>
            <input type="time" name="hora" required step={300} className={`field ${err("fecha") ? "border-risk-alto" : ""}`} /></label>
          <label className="block sm:col-span-2"><span className="label">Especialidad o examen <span className="font-normal text-ink-soft">(opcional)</span></span>
            <select name="especialidad" defaultValue="" className="field">
              <option value="">Prefiero no indicarlo</option>
              {especialidades.map((e) => <option key={e} value={e}>{e}</option>)}
            </select></label>
          <label className="block sm:col-span-2"><span className="label">Lugar dentro del hospital <span className="font-normal text-ink-soft">(opcional)</span></span>
            <input name="lugar" maxLength={120} placeholder="Ej.: Policlínico, 2° piso, box 4" className="field" /></label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-2xl font-bold">Cómo le avisamos</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {CANALES.map((x) => (
            <label key={x.value} className={tile}>
              <input type="radio" name="canal" value={x.value} checked={canal === x.value} onChange={() => setCanal(x.value)} className="h-5 w-5 accent-pine" />
              <span className="font-bold">{x.label}</span>
            </label>
          ))}
        </div>
        <label className="mt-4 block"><span className="label">{c.ayuda}</span>
          <input name="contacto" required inputMode={canal === "email" ? "email" : "tel"} autoComplete={canal === "email" ? "email" : "tel"}
            placeholder={c.placeholder} className={`field text-xl ${err("contacto") ? "border-risk-alto" : ""}`} /></label>
        {canal !== "email" && <p className="mt-2 text-base text-ink-soft">Si su número no es chileno, escríbalo con el código de su país, por ejemplo +58 o +51.</p>}
        <label className="mt-4 block"><span className="label">Nombre <span className="font-normal text-ink-soft">(opcional, para saludarle)</span></span>
          <input name="nombre" maxLength={80} autoComplete="given-name" className="field" /></label>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-2xl font-bold">Cuándo le avisamos</legend>
        <div className="grid gap-3">
          {avisos.map((a) => (
            <label key={a.value} className={tile}>
              <input type="checkbox" name="avisos" value={a.value} defaultChecked={a.value !== "dos_dias"} className="h-5 w-5 accent-pine" />
              {a.label}
            </label>
          ))}
        </div>
        <p className="mb-3 mt-6 font-bold">¿En qué horario prefiere recibirlos?</p>
        <div className="grid gap-3">
          {rangos.map((r, i) => (
            <label key={r.value} className={tile}>
              <input type="radio" name="rango" value={r.value} defaultChecked={i === 1} className="h-5 w-5 accent-pine" />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-2xl font-bold">Desde dónde viaja <span className="text-lg font-normal text-ink-soft">(opcional)</span></legend>
        <p className="mb-3 text-ink-soft">Así el aviso incluye cómo llegar desde su sector.</p>
        <select name="origen" defaultValue={origenInicial ?? ""} className="field">
          <option value="">No indicar</option>
          {origenes.map((g) => (
            <optgroup key={g.grupo} label={g.grupo}>{g.items.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}</optgroup>
          ))}
        </select>
      </fieldset>

      <label className={`flex items-start gap-3 rounded-xl border-2 bg-white p-4 ${err("consentimiento") ? "border-risk-alto" : "border-line"}`}>
        <input type="checkbox" name="consentimiento" className="mt-1 h-5 w-5 shrink-0 accent-pine" />
        <span>Autorizo que me envíen estos avisos. Mis datos se usan sólo para esto y se borran 30 días después de la cita.</span>
      </label>

      <button type="submit" disabled={pendiente} aria-busy={pendiente} className="btn-primary w-full py-4 text-xl">
        {pendiente ? "Registrando…" : "Activar mi recordatorio"}
      </button>
    </form>
  );
}
