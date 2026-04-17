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
          primary: "#4ecdc4",
          secondary: "#b5bc7a",
          dark: "#595f5a",
          light: "#f5f5f0",
        },
      },
    },
  },
  plugins: [],
};

export default config;
