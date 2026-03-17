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
        dark: {
          DEFAULT: "#020617",
          50: "#0B1120",
          100: "#0F172A",
          200: "#162040",
          300: "#1c2b52",
          400: "#243564",
          500: "#2e4175",
          600: "#384f8a",
          700: "#4a64a0",
          800: "#6b84b8",
          900: "#94a7cc",
        },
        accent: {
          blue: "#3b82f6",
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          indigo: "#6366f1",
          electric: "#60a5fa",
          glow: "#818cf8",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        surface: {
          DEFAULT: "#f8fafc",
          raised: "#ffffff",
          sunken: "#f1f5f9",
          overlay: "#ffffff",
        },
        navy: {
          DEFAULT: "#0f172a",
          light: "#1e293b",
          muted: "#334155",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        card: "0 4px 24px -4px rgb(0 0 0 / 0.15), 0 0 0 1px rgb(0 0 0 / 0.03)",
        "card-hover": "0 24px 48px -12px rgb(0 0 0 / 0.2), 0 0 0 1px rgb(99 102 241 / 0.1)",
        glow: "0 0 30px -6px rgb(99 102 241 / 0.5), 0 0 60px -12px rgb(99 102 241 / 0.25)",
        "glow-lg": "0 0 80px -16px rgb(99 102 241 / 0.5), 0 0 120px -24px rgb(139 92 246 / 0.2)",
        "glow-cyan": "0 0 50px -10px rgb(34 211 238 / 0.4)",
        "glow-violet": "0 0 50px -10px rgb(139 92 246 / 0.4)",
        "glass": "0 12px 40px 0 rgb(0 0 0 / 0.25), 0 0 0 1px rgba(255,255,255,0.03)",
        "glass-lg": "0 24px 64px 0 rgb(0 0 0 / 0.35), 0 0 0 1px rgba(255,255,255,0.04)",
        neon: "0 0 8px rgb(99 102 241 / 0.5), 0 0 30px rgb(99 102 241 / 0.3), 0 0 60px rgb(99 102 241 / 0.15)",
        "neon-hover": "0 0 12px rgb(99 102 241 / 0.6), 0 0 40px rgb(99 102 241 / 0.35), 0 0 80px rgb(99 102 241 / 0.2)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(1deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "float-strong": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        progress: {
          from: { width: "0%" },
          to: { width: "100%" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float-strong": "float-strong 5s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        progress: "progress 2.5s linear",
        "gradient-x": "gradient-x 3s ease infinite",
      },
      backgroundImage: {
        "grid-dark": "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "grid-light": "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backgroundSize: {
        "grid": "60px 60px",
      },
      height: {
        "13": "3.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
