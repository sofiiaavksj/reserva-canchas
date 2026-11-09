import type { TipoMensaje } from "./agenda";
import { formatDateLong, formatTime } from "./time";

export interface DatosMensaje {
  hospital: string;
  nombre?: string | null;
  citaEn: string;
  especialidad?: string | null;
  lugar?: string | null;
  enlaceGestion: string;
  enlaceTransporte: string;
}

/** Textos cortos, una idea por mensaje, con enlaces a la gestión y a cómo llegar. */
export function redactar(tipo: TipoMensaje, d: DatosMensaje): { asunto: string; texto: string } {
  const hola = d.nombre ? `Hola ${d.nombre.split(" ")[0]}.` : "Hola.";
  const que = d.especialidad ? `su hora de ${d.especialidad}` : "su hora médica";
  const cuando = `el ${formatDateLong(d.citaEn)} a las ${formatTime(d.citaEn)}`;
  const donde = d.lugar ? `\nLugar: ${d.lugar}.` : "";
  const llegar = `\n\nCómo llegar: ${d.enlaceTransporte}`;
  const gestion = `\nSi no podrá ir o quiere anular los avisos: ${d.enlaceGestion}`;
  switch (tipo) {
    case "confirmacion":
      return {
        asunto: "Recordatorio registrado",
        texto: `${hola} Registramos un recordatorio para ${que} en ${d.hospital}, ${cuando}.${donde}\nLe avisaremos antes de la cita.${llegar}${gestion}\n\nSi usted no pidió este recordatorio, anúlelo en el enlace.`,
      };
    case "dos_dias":
      return { asunto: "Su hora es en 2 días", texto: `${hola} Le recordamos ${que} en ${d.hospital}, ${cuando}.${donde}${llegar}${gestion}` };
    case "un_dia":
      return { asunto: "Su hora es mañana", texto: `${hola} Mañana tiene ${que} en ${d.hospital}, a las ${formatTime(d.citaEn)}.${donde}\nLleve su cédula de identidad y llegue 20 minutos antes.${llegar}${gestion}` };
    case "mismo_dia":
      return { asunto: "Su hora es hoy", texto: `${hola} Hoy a las ${formatTime(d.citaEn)} tiene ${que} en ${d.hospital}.${donde}${llegar}` };
    case "post_cita":
      return { asunto: "¿Pudo asistir?", texto: `${hola} ¿Pudo asistir a ${que}? Responda con un toque, nos ayuda a mejorar: ${d.enlaceGestion}` };
  }
}
