/** Datos del establecimiento y de la plataforma (se leen de variables de entorno). */
const clean = (v?: string) => v?.split("#")[0].trim() || "";

export const sitio = {
  hospital: clean(process.env.HOSPITAL_NAME) || "Hospital San Pablo de Coquimbo",
  telefonoSome: clean(process.env.SOME_PHONE),        // para avisar que no podrá asistir
  horarioSome: clean(process.env.SOME_HOURS),         // ej. "lunes a viernes, 8:00 a 17:00"
};

export function appUrl() {
  const url = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}
