/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];
export default {
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Los enlaces personales no deben filtrarse a otros sitios.
      { source: "/r/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] },
    ];
  },
};
