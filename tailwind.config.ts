import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#050505",
          surface: "#0c0c0c",
          panel: "#14120f",
          line: "#2a2418",
          gold: "#d4af37",
          goldHi: "#e8c766",
          goldLo: "#9a7b26",
          cream: "#f2ebe0",
          muted: "#8f897c",
        },
      },
      boxShadow: {
        lux: "0 24px 48px -12px rgba(0,0,0,0.65), inset 0 1px 0 rgba(212,175,55,0.06)",
        card: "0 0 0 1px rgba(212,175,55,0.12), 0 18px 40px -16px rgba(0,0,0,0.85)",
      },
    },
  },
  plugins: [],
};

export default config;
