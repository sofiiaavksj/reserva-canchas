/**
 * GUÍA DE TRANSPORTE AL HOSPITAL SAN PABLO DE COQUIMBO
 * ===================================================
 * Este archivo es la fuente de la guía "¿Cómo llego?". Se edita sin saber
 * programar: cambie los textos entre comillas y guarde (en GitHub, con el
 * lápiz "Edit"). Vercel publica el cambio en uno o dos minutos.
 *
 * REGLA: todo dato nuevo se marca `verificado: false` hasta que alguien del
 * equipo lo compruebe en terreno o en dos fuentes (Google Maps, Moovit,
 * Ubícate, Red, Kupos). La página muestra "Por verificar" en esos casos.
 *
 * Fuentes usadas para la versión inicial (consultadas en noviembre de 2026):
 *  - Moovit, "Hospital San Pablo De Coquimbo" y paradero "Hospital Coquimbo".
 *  - Wikipedia, "Red Coquimbo-La Serena de Movilidad" (recorrido por Av. Videla).
 *  - DTPR (Ministerio de Transportes), Ficha Coquimbo 2026: rebaja adulto mayor y pago de Red.
 *  - Pasajebus/Kupos: dirección del Terminal de Buses de Coquimbo.
 */

export type Modo = "micro" | "colectivo" | "bus_electrico" | "interurbano" | "taxi";

export const MODO_LABEL: Record<Modo, string> = {
  micro: "Micro o taxibús",
  colectivo: "Colectivo",
  bus_electrico: "Bus eléctrico Red",
  interurbano: "Bus interurbano",
  taxi: "Taxi o aplicación",
};

export interface Opcion {
  modo: Modo;
  /** Líneas o recorridos, tal como aparecen en el letrero. */
  lineas: string[];
  /** Dónde tomarlo (opcional). */
  tomarEn?: string;
  /** Dónde bajarse. */
  bajarseEn?: string;
  /** Minutos aproximados de viaje (opcional, sólo si está verificado). */
  minutos?: number;
  /** Tarifa aproximada en texto, ej. "$800" (opcional). */
  tarifa?: string;
  nota?: string;
  verificado: boolean;
  fuente: string;
}

export interface Origen {
  id: string;
  nombre: string;
  grupo: "Coquimbo" | "La Serena" | "Otras comunas";
  opciones: Opcion[];
}

export const HOSPITAL = {
  nombre: "Hospital San Pablo de Coquimbo",
  direccion: "Av. Videla s/n, Coquimbo",
  /** Texto que se usa como destino en Google Maps. */
  destinoMapas: "Hospital San Pablo, Coquimbo, Chile",
  moovitUrl:
    "https://moovitapp.com/index/es-419/transporte_p%C3%BAblico-Hospital_San_Pablo_De_Coquimbo-La_Serena_y_Coquimbo-site_177944338-3281",
};

/** Paraderos cercanos al hospital (Moovit, por verificar en terreno). */
export const PARADEROS = [
  { nombre: "Paradero Romana", distancia: "140 m, unos 3 minutos a pie", lineas: ["1", "2", "3", "3B"], verificado: false },
  { nombre: "Paradero Hospital Coquimbo", distancia: "150 m, unos 3 minutos a pie", lineas: ["B", "8"], verificado: false },
  { nombre: "Paradero J. J. Mac-Auliffe 723", distancia: "210 m, unos 4 minutos a pie", lineas: ["A", "6"], verificado: false },
];

const MOOVIT = "Moovit (nov. 2026)";
const bajarRomana = "Paradero Romana (140 m del hospital)";
const bajarHospital = "Paradero Hospital Coquimbo (150 m del hospital)";
const bajarMacAuliffe = "Paradero J. J. Mac-Auliffe 723 (210 m del hospital)";

export const ORIGENES: Origen[] = [
  // ---------------- Coquimbo ----------------
  {
    id: "coquimbo-centro", nombre: "Centro de Coquimbo", grupo: "Coquimbo",
    opciones: [
      { modo: "micro", lineas: ["6 Centro", "8 Centro"], bajarseEn: `${bajarMacAuliffe} o ${bajarHospital}`, verificado: false, fuente: MOOVIT },
      { modo: "micro", lineas: ["7 Centro"], nota: "Moovit la registra cerca del hospital, sin indicar el paradero.", verificado: false, fuente: MOOVIT },
    ],
  },
  {
    id: "parte-alta", nombre: "Parte Alta", grupo: "Coquimbo",
    opciones: [{ modo: "micro", lineas: ["B Parte Alta"], bajarseEn: bajarHospital, verificado: false, fuente: MOOVIT }],
  },
  {
    id: "san-juan", nombre: "San Juan", grupo: "Coquimbo",
    opciones: [{ modo: "micro", lineas: ["A San Juan"], bajarseEn: bajarMacAuliffe, verificado: false, fuente: MOOVIT }],
  },
  {
    id: "sindempart", nombre: "Sindempart", grupo: "Coquimbo",
    opciones: [{ modo: "micro", lineas: ["7", "8"], bajarseEn: bajarHospital, nota: "Recorridos con destino Sindempart según Moovit; confirme el sentido.", verificado: false, fuente: MOOVIT }],
  },
  {
    id: "tierras-blancas", nombre: "Tierras Blancas", grupo: "Coquimbo",
    opciones: [{ modo: "micro", lineas: ["4A Tierras Blancas"], nota: "Moovit la registra cerca del hospital, sin indicar el paradero.", verificado: false, fuente: MOOVIT }],
  },
  {
    id: "penuelas", nombre: "Peñuelas", grupo: "Coquimbo",
    opciones: [{ modo: "micro", lineas: ["4B Peñuelas"], nota: "Moovit la registra cerca del hospital, sin indicar el paradero.", verificado: false, fuente: MOOVIT }],
  },
  {
    id: "la-cantera", nombre: "La Cantera / Narciso Herrera", grupo: "Coquimbo",
    opciones: [{ modo: "micro", lineas: ["3B La Cantera"], bajarseEn: bajarRomana, verificado: false, fuente: MOOVIT }],
  },
  {
    id: "el-llano", nombre: "El Llano", grupo: "Coquimbo",
    opciones: [{ modo: "micro", lineas: ["2 Llano"], bajarseEn: bajarRomana, verificado: false, fuente: MOOVIT }],
  },
  {
    id: "manuel-rodriguez", nombre: "Manuel Rodríguez", grupo: "Coquimbo",
    opciones: [{ modo: "micro", lineas: ["6 Manuel Rodríguez"], bajarseEn: bajarMacAuliffe, verificado: false, fuente: MOOVIT }],
  },
  {
    id: "nueva-vida", nombre: "Nueva Vida / Cerrillos", grupo: "Coquimbo",
    opciones: [{ modo: "micro", lineas: ["12 Nueva Vida-Cerrillos"], nota: "Moovit la registra cerca del hospital, sin indicar el paradero.", verificado: false, fuente: MOOVIT }],
  },
  {
    id: "la-herradura", nombre: "La Herradura / Guayacán", grupo: "Coquimbo",
    opciones: [{ modo: "micro", lineas: ["10-11 La Herradura"], nota: "Moovit la registra cerca del hospital, sin indicar el paradero.", verificado: false, fuente: MOOVIT }],
  },
  // ---------------- La Serena ----------------
  {
    id: "la-serena-centro", nombre: "Centro de La Serena", grupo: "La Serena",
    opciones: [
      { modo: "micro", lineas: ["2", "3", "10-11"], bajarseEn: bajarRomana, nota: "Recorridos que unen La Serena con Coquimbo según Moovit; confirme que pasen por Av. Videla.", verificado: false, fuente: MOOVIT },
      { modo: "bus_electrico", lineas: ["Recorrido La Pampilla – Viña del Mar"], nota: "Pasa por Avenida Videla en ambos sentidos. Confirme el paradero más cercano al hospital. Se paga con tarjeta o código QR.", verificado: false, fuente: "Wikipedia, Red Coquimbo-La Serena; DTPR" },
    ],
  },
  {
    id: "la-pampa", nombre: "La Pampa", grupo: "La Serena",
    opciones: [{ modo: "micro", lineas: ["3 Pampa"], bajarseEn: bajarRomana, verificado: false, fuente: MOOVIT }],
  },
  {
    id: "la-serena-otro", nombre: "Otro sector de La Serena (Las Compañías, Antena, etc.)", grupo: "La Serena",
    opciones: [{ modo: "micro", lineas: [], nota: "Tome una micro o colectivo hacia el centro de La Serena y combine con las líneas 2, 3 o 10-11. Para su ruta exacta use el botón de Google Maps o Moovit.", verificado: false, fuente: MOOVIT }],
  },
  // ---------------- Otras comunas ----------------
  {
    id: "tongoy", nombre: "Tongoy", grupo: "Otras comunas",
    opciones: [{ modo: "interurbano", lineas: ["Servicio Tongoy – Coquimbo – La Serena"], bajarseEn: "Coquimbo; luego combine con una micro hacia el hospital", verificado: false, fuente: "DTPR, Ficha Coquimbo 2026" }],
  },
  {
    id: "ovalle", nombre: "Ovalle", grupo: "Otras comunas",
    opciones: [{ modo: "interurbano", lineas: ["Buses Ovalle – Coquimbo"], bajarseEn: "Terminal de Buses de Coquimbo (Varela 1300); luego micro o colectivo hacia el hospital", nota: "Compre su pasaje con anticipación en el terminal o en Kupos.", verificado: false, fuente: "Pasajebus/Kupos" }],
  },
  {
    id: "andacollo", nombre: "Andacollo", grupo: "Otras comunas",
    opciones: [{ modo: "interurbano", lineas: ["Buses Andacollo – Coquimbo / La Serena"], bajarseEn: "Coquimbo; luego micro o colectivo hacia el hospital", verificado: false, fuente: "Por completar" }],
  },
  {
    id: "vicuna", nombre: "Vicuña / Valle de Elqui", grupo: "Otras comunas",
    opciones: [{ modo: "interurbano", lineas: ["Buses Vicuña – La Serena"], bajarseEn: "Terminal de La Serena; luego micro 2, 3 o 10-11 hacia Coquimbo", verificado: false, fuente: "Por completar" }],
  },
];

/** Consejos generales que se muestran en todas las rutas. */
export const CONSEJOS = [
  "Las personas desde 65 años tienen 50 % de rebaja en los buses de la región: muestre su cédula al pagar.",
  "Los buses eléctricos Red se pagan con tarjeta o código QR, no con efectivo.",
  "Calcule llegar 20 minutos antes de su hora para hacer la admisión.",
];

export function origenPorId(id: string) {
  return ORIGENES.find((o) => o.id === id);
}

export function mapsUrl(origen?: string) {
  const p = new URLSearchParams({ api: "1", destination: HOSPITAL.destinoMapas, travelmode: "transit" });
  if (origen) p.set("origin", origen);
  return `https://www.google.com/maps/dir/?${p.toString()}`;
}
