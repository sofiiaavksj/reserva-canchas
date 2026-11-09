-- =====================================================================
-- Agenda virtual y guía de transporte · Esquema
-- Sin cuentas de usuario: el paciente (o un familiar) registra su hora y
-- recibe un enlace personal para gestionarla. No se pide RUT.
-- Todo el acceso pasa por el servidor con la clave de servicio; las tablas
-- tienen RLS activo y ninguna política, de modo que nadie puede leerlas
-- directamente desde el navegador.
-- =====================================================================

create type canal as enum ('whatsapp', 'sms', 'email');
create type rango_horario as enum ('manana', 'tarde', 'noche');
create type tipo_mensaje as enum ('confirmacion', 'dos_dias', 'un_dia', 'mismo_dia', 'post_cita');
create type estado_mensaje as enum ('pendiente', 'enviado', 'simulado', 'fallido', 'omitido');

create table recordatorios (
  id uuid primary key default gen_random_uuid(),
  nombre text check (char_length(nombre) <= 80),          -- opcional: cómo saludar
  canal canal not null,
  contacto text not null check (char_length(contacto) <= 120), -- celular E.164 o correo
  cita_en timestamptz not null,
  especialidad text check (char_length(especialidad) <= 80),
  lugar text check (char_length(lugar) <= 120),
  origen text check (char_length(origen) <= 40),          -- id de la guía de transporte
  rango rango_horario not null,
  anulado_en timestamptz,
  no_asistira_en timestamptz,                             -- avisó "No podré ir"
  asistio boolean,                                        -- respuesta post cita
  asistio_respondido_en timestamptz,
  ip_hash text,                                           -- límite de abuso, no identifica
  consentimiento_en timestamptz not null,
  creado_en timestamptz not null default now()
);
create index on recordatorios (cita_en);
create index on recordatorios (contacto, cita_en);
create index on recordatorios (ip_hash, creado_en);

create table mensajes (
  id uuid primary key default gen_random_uuid(),
  recordatorio_id uuid not null references recordatorios(id) on delete cascade,
  tipo tipo_mensaje not null,
  enviar_en timestamptz not null,
  estado estado_mensaje not null default 'pendiente',
  cuerpo text,
  error text,
  ref_proveedor text,
  enviado_en timestamptz,
  unique (recordatorio_id, tipo)
);
create index on mensajes (estado, enviar_en);

-- Consultas a la guía de transporte (sólo el sector, sin datos personales)
create table consultas_transporte (
  id bigint generated always as identity primary key,
  origen text not null check (char_length(origen) <= 40),
  creado_en timestamptz not null default now()
);

alter table recordatorios enable row level security;
alter table mensajes enable row level security;
alter table consultas_transporte enable row level security;
revoke all on recordatorios, mensajes, consultas_transporte from anon, authenticated;

-- ---------------------------------------------------------------------
-- Toma atómica de mensajes vencidos: evita envíos duplicados si la tarea
-- programada corre dos veces al mismo tiempo.
-- ---------------------------------------------------------------------
create function tomar_mensajes_pendientes(p_limite int default 200)
returns setof mensajes language sql security definer set search_path = public as $$
  update mensajes m set estado = 'enviado', enviado_en = now()
   where m.id in (
     select id from mensajes
      where estado = 'pendiente' and enviar_en <= now()
      order by enviar_en
      limit p_limite
      for update skip locked)
  returning m.*;
$$;
revoke execute on function tomar_mensajes_pendientes(int) from public, anon, authenticated;
grant execute on function tomar_mensajes_pendientes(int) to service_role;

-- Visitas a la página de inicio según de dónde llegan (sitio del hospital o QR)
create table visitas (
  id bigint generated always as identity primary key,
  fuente text not null check (fuente in ('sitio-hospital', 'qr', 'otro')),
  creado_en timestamptz not null default now()
);
alter table visitas enable row level security;
revoke all on visitas from anon, authenticated;
