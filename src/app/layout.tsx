import type { Metadata, Viewport } from "next";
import "./globals.css";
import { sitio } from "@/config/sitio";

export const metadata: Metadata = {
  title: { default: `Su hora en el ${sitio.hospital}`, template: `%s | ${sitio.hospital}` },
  description: "Reciba un recordatorio de su hora médica y vea cómo llegar al hospital en micro, colectivo o bus.",
};
export const viewport: Viewport = { themeColor: "#0E4F4A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL">
      <body className="text-[17px] sm:text-lg">{children}</body>
    </html>
  );
}
