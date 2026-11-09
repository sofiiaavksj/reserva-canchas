import "server-only";

export type Resultado = { estado: "enviado" | "simulado" | "fallido"; ref?: string; error?: string };

/**
 * Envío por canal.
 *  - WhatsApp y SMS: Twilio (NOTIFY_PROVIDER=twilio).
 *  - Correo: Resend (si hay RESEND_API_KEY).
 *  - Sin credenciales: modo simulado; el mensaje queda registrado en el panel.
 */
export async function enviar(canal: "whatsapp" | "sms" | "email", contacto: string, asunto: string, texto: string): Promise<Resultado> {
  try {
    if (canal === "email") {
      const key = process.env.RESEND_API_KEY;
      if (!key) return { estado: "simulado" };
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.EMAIL_FROM || "Recordatorios <onboarding@resend.dev>", to: [contacto], subject: asunto, text: texto }),
      });
      const j = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      return res.ok ? { estado: "enviado", ref: j.id } : { estado: "fallido", error: j.message || `HTTP ${res.status}` };
    }

    if (process.env.NOTIFY_PROVIDER !== "twilio") return { estado: "simulado" };
    const sid = process.env.TWILIO_ACCOUNT_SID, auth = process.env.TWILIO_AUTH_TOKEN;
    const from = canal === "whatsapp" ? process.env.TWILIO_WHATSAPP_FROM : process.env.TWILIO_SMS_FROM;
    if (!sid || !auth || !from) return { estado: "fallido", error: "Faltan credenciales de Twilio" };
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: "Basic " + Buffer.from(`${sid}:${auth}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ From: from, To: canal === "whatsapp" ? `whatsapp:${contacto}` : contacto, Body: texto }),
    });
    const j = (await res.json().catch(() => ({}))) as { sid?: string; message?: string };
    return res.ok ? { estado: "enviado", ref: j.sid } : { estado: "fallido", error: j.message || `HTTP ${res.status}` };
  } catch (e) {
    return { estado: "fallido", error: e instanceof Error ? e.message : "Error de red" };
  }
}
