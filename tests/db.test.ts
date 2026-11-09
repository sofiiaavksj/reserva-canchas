import { describe, it, expect, beforeAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

let db: PGlite;
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
                 grant usage on schema public to anon, authenticated, service_role;`);
  const dir = join(__dirname, "..", "supabase", "migrations");
  for (const f of readdirSync(dir).sort()) await db.exec(readFileSync(join(dir, f), "utf8"));
  await db.exec(`grant all on all tables in schema public to anon, authenticated;`); // simula los permisos por defecto de Supabase
  await db.exec(readFileSync(join(dir, readdirSync(dir).sort()[0]), "utf8").match(/revoke all on recordatorios[^;]+;/)![0]);
  await db.exec("revoke all on visitas from anon, authenticated;");
});

describe("base de datos", () => {
  it("el navegador (anon) no puede leer recordatorios", async () => {
    await db.exec("set role anon;");
    await expect(db.query("select * from recordatorios")).rejects.toThrow(/permission denied/);
    await db.exec("reset role;");
  });

  it("toma cada mensaje vencido una sola vez", async () => {
    const { rows: [r] } = await db.query<{ id: string }>(`insert into recordatorios (canal, contacto, cita_en, rango, consentimiento_en)
      values ('whatsapp', '+56911111111', now() + interval '2 days', 'tarde', now()) returning id`);
    await db.query(`insert into mensajes (recordatorio_id, tipo, enviar_en) values
      ($1, 'confirmacion', now() - interval '1 minute'), ($1, 'un_dia', now() + interval '1 day')`, [r.id]);
    const a = await db.query("select * from tomar_mensajes_pendientes(50)");
    const b = await db.query("select * from tomar_mensajes_pendientes(50)");
    expect(a.rows).toHaveLength(1);
    expect(b.rows).toHaveLength(0);
  });

  it("un recordatorio no puede tener dos avisos del mismo tipo", async () => {
    const { rows: [r] } = await db.query<{ id: string }>("select id from recordatorios limit 1");
    await expect(db.query("insert into mensajes (recordatorio_id, tipo, enviar_en) values ($1, 'un_dia', now())", [r.id])).rejects.toThrow(/duplicate/);
  });

  it("al borrar un recordatorio se borran sus mensajes", async () => {
    await db.exec("delete from recordatorios");
    expect((await db.query<{ n: number }>("select count(*)::int n from mensajes")).rows[0].n).toBe(0);
  });
});
