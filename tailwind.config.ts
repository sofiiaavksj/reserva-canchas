import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pine: { DEFAULT: "#0E4F4A", dark: "#093B37", soft: "#E3EEEC" },
        mist: "#F2F5F4",
        ink: { DEFAULT: "#1A2422", soft: "#4A5A57" },
        line: "#D5DEDB",
        marigold: { DEFAULT: "#E0A526", soft: "#FBF1DA" },
        risk: { alto: "#B42318", medio: "#9A6212", bajo: "#2E7D5B" },
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
