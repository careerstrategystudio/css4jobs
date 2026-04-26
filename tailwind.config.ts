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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50:  "#EEF0FF",
          100: "#DCE0FF",
          200: "#BFC6FF",
          300: "#9BA4FF",
          400: "#7B85FF",
          500: "#6C63FF",
          600: "#5B6CFF",
          700: "#4A55D6",
          800: "#3A43A8",
          900: "#2C337F",
        },
        accent: {
          50:  "#E6FAF7",
          100: "#C5F2EB",
          200: "#9CE8DC",
          300: "#6EDDCC",
          400: "#3ED1C2",
          500: "#2CBFAE",
          600: "#23998C",
          700: "#1B7368",
          800: "#134D45",
          900: "#0B2B26",
        },
        highlight: {
          50:  "#FFF1E6",
          100: "#FFE0C7",
          200: "#FFC79A",
          300: "#FFAA66",
          400: "#F88D40",
          500: "#F47A2A",
          600: "#D9621A",
          700: "#A84812",
          800: "#7A330B",
          900: "#4D1F05",
        },
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgba(91, 108, 255, 0.18)",
        glow: "0 10px 40px -12px rgba(91, 108, 255, 0.35)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
