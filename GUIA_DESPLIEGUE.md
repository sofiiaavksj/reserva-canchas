# Guía de despliegue

Tiempo estimado: 40 minutos. Todo se hace desde el navegador con tres cuentas gratuitas: **GitHub**, **Supabase** y **Vercel**.

## 1. Subir el código a GitHub

1. En <https://github.com> → **New repository** → nombre `agenda-hospital`, **Private** → **Create repository**.
2. Haga clic en **uploading an existing file**, arrastre **el contenido** de la carpeta descomprimida y presione **Commit changes**.
   - La carpeta `.github` (oculta en algunos computadores) también debe subirse. Si no aparece, créela después: **Add file → Create new file**, nombre `.github/workflows/recordatorios.yml`, y pegue el contenido del archivo.

## 2. Base de datos en Supabase

1. En <https://supabase.com> → **New project**, región **South America (São Paulo)**.
2. **SQL Editor → New query**: pegue y ejecute (**Run**) el contenido de `supabase/migrations/20261109000000_agenda.sql`.
3. **Project Settings → API**: copie la **Project URL** y la clave **service_role**. Esta clave es secreta.

Esta versión no usa el sistema de cuentas de Supabase: no hay que configurar correos de ingreso.

## 3. Publicar en Vercel

1. En <https://vercel.com>, ingrese con GitHub → **Add New → Project** → importe `agenda-hospital`.
2. En **Environment Variables** cargue:

   | Variable | Valor |
   |---|---|
   | `SUPABASE_URL` | Project URL de Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | clave service_role |
   | `APP_URL` | dirección final, ej. `https://agenda-hospital.vercel.app` |
   | `HOSPITAL_NAME` | `Hospital San Pablo de Coquimbo` |
   | `SOME_PHONE` | teléfono de SOME (verifíquelo con el hospital) |
   | `SOME_HOURS` | horario de atención telefónica de SOME |
   | `TOKEN_SECRET` | texto aleatorio de 40 caracteres (<https://www.random.org/strings/>) |
   | `CRON_SECRET` | otro texto aleatorio de 40 caracteres |
   | `PANEL_USER` / `PANEL_PASSWORD` | usuario y contraseña del panel |
   | `NOTIFY_PROVIDER` | `simulado` |

3. **Deploy**. Si la dirección final no coincide con `APP_URL`, corríjala y use **Redeploy**.

> No cambie `TOKEN_SECRET` después de publicar: los enlaces ya enviados dejarían de funcionar.

## 4. Envío de avisos cada hora

Los avisos respetan el rango horario que elige el paciente, así que la tarea debe correr **cada hora**:

1. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**:
   - `APP_URL`: la dirección de Vercel.
   - `CRON_SECRET`: el mismo valor cargado en Vercel.
2. **Actions → Recordatorios → Run workflow** para probar. Debe terminar en verde.

`vercel.json` deja además una ejecución diaria de respaldo en Vercel.

## 5. Mensajes reales

**Modo simulado (por defecto).** Los mensajes se generan completos, con sus enlaces, y quedan en `/panel`, pero no se envían. Sirve para las pruebas con usuarios: el evaluador ve el resultado en pantalla.

**Correo** (gratis hasta cierto volumen):

1. Cree una cuenta en <https://resend.com> y una API Key.
2. Cargue `RESEND_API_KEY` en Vercel.
3. Sin dominio propio, Resend sólo permite enviar al correo de la cuenta; para enviar a pacientes debe verificar un dominio y cargar `EMAIL_FROM`.

**WhatsApp y SMS** (Twilio, con costo por mensaje):

1. Active el **WhatsApp Sandbox** en <https://www.twilio.com>. Cada teléfono de prueba debe enviar `join <palabra>` al número del sandbox.
2. Cargue `NOTIFY_PROVIDER=twilio`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` y, para SMS, `TWILIO_SMS_FROM`.
3. Para uso real, WhatsApp exige un número verificado del hospital y plantillas aprobadas por Meta. Los textos están en `src/lib/mensajes.ts`.

## 6. Link en la página del hospital

Abra `https://SU-DIRECCION/difusion`:

- **Banner**: presione **Copiar código** y entréguelo al área de comunicaciones o TI del hospital para pegarlo en su sitio.
- **Afiche**: presione **Imprimir afiche** para SOME, salas de espera y box.

El panel distingue las visitas que llegan desde el banner y desde el QR.

## 7. Completar y verificar la guía de transporte

1. Imprima o comparta `VERIFICACION_TRANSPORTE.md` y revise cada fila en terreno o en dos fuentes (Google Maps, Moovit, Ubícate, Red, Kupos).
2. En GitHub abra `src/data/transporte.ts` → lápiz **Edit**:
   - cambie `verificado: false` por `verificado: true` en lo confirmado;
   - agregue `minutos` y `tarifa` cuando los tenga;
   - agregue los **colectivos** como nuevas opciones con `modo: "colectivo"`.
3. **Commit changes**. Vercel publica el cambio en uno o dos minutos.

Si el cambio rompe algo, Vercel no publica y mantiene la versión anterior: revise el mensaje de error en **Deployments**.

## 8. Antes de usarla con pacientes

- Acordar con el hospital el uso de su nombre, el banner y el teléfono de SOME.
- Revisar con el hospital el texto de `/privacidad`.
- Verificar la guía de transporte completa.
- Probar los recordatorios con el equipo (sus propios celulares) antes de abrirla al público.
