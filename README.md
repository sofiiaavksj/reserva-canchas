# Agenda virtual y guía de transporte

Plataforma para pacientes del Hospital San Pablo de Coquimbo. No interviene en el agendamiento del hospital: ayuda al paciente a **no olvidar su hora** y a **saber cómo llegar**.

La guía de publicación está en **[GUIA_DESPLIEGUE.md](GUIA_DESPLIEGUE.md)** y la planilla para verificar rutas en terreno en **[VERIFICACION_TRANSPORTE.md](VERIFICACION_TRANSPORTE.md)**.

## Flujo

1. **Link en la página del hospital.** `/difusion` entrega el banner con la pregunta *"¿Tiene hora en el hospital?"* listo para pegar, y un afiche con código QR para imprimir.
2. **Ingreso sin RUT ni cuenta.** Sirve para extranjeros sin RUT, adultos mayores y familiares que lo hacen por el paciente.
3. **Dos opciones:** *Quiero un recordatorio* / *¿Cómo llego al hospital?*
4. **Recordatorio** (`/recordatorio`):
   - Datos de la cita: fecha y hora; especialidad y lugar son opcionales.
   - Medio: WhatsApp, SMS o correo. Acepta celulares chilenos y extranjeros.
   - Avisos: 2 días antes, 1 día antes y/o el mismo día.
   - Rango horario: mañana, tarde o noche.
   - Sector desde donde viaja (opcional), para incluir la ruta en el aviso.

   **Transporte** (`/como-llegar`):
   - Rutas por sector de Coquimbo, La Serena y otras comunas.
   - Paraderos cercanos al hospital.
   - Botones a Google Maps (en transporte público) y Moovit para la ruta en tiempo real.

## Además

- **Mensaje de confirmación inmediato** con un enlace personal (`/r/...`) para ver los avisos, agregar la hora al calendario del celular (.ics), ver cómo llegar o anular.
- **"No podré ir"**: deja de enviar avisos y muestra el teléfono de SOME para liberar la hora.
- **"¿Pudo asistir?"**: pregunta de un toque después de la cita. Es el indicador de efectividad del proyecto.
- **Panel de indicadores** (`/panel`, con usuario y contraseña):
  - Recordatorios creados, medio y horario elegidos.
  - Asistencia declarada y avisos "no podré ir".
  - Sectores consultados y visitas desde el sitio del hospital y desde el QR.

## Privacidad y seguridad

- No se pide RUT ni información de salud. Los datos se borran 30 días después de la cita.
- Las tablas tienen RLS activo sin políticas: sólo el servidor puede leerlas.
- El enlace personal está firmado con HMAC: no se puede adivinar ni fabricar uno para otro recordatorio.
- Límites contra abuso: 10 registros por hora por conexión, 5 recordatorios activos por contacto y una trampa para robots.
- El primer mensaje permite anular si alguien registró un número ajeno.
- La tarea programada toma los mensajes de forma atómica, así que no hay envíos duplicados.

## Editar la guía de transporte

Todo está en `src/data/transporte.ts`, con instrucciones al inicio del archivo. Se puede editar desde GitHub con el lápiz "Edit". Cada dato lleva `verificado: true/false`; la página muestra "Por verificar" mientras no se confirme.

## Pruebas

```bash
npm install
npm test        # lógica de avisos, contactos, guía, mensajes y base de datos
npm run build
```
