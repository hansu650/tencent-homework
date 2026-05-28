import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1664FF",
          foreground: "#FFFFFF"
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        deep: {
          950: "#07111F",
          900: "#0B1224",
          850: "#0E1A2F"
        }
      },
      boxShadow: {
        glow: "0 0 60px rgba(22,100,255,0.32)",
        "inner-glass": "inset 0 1px 0 rgba(255,255,255,0.14)"
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem"
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" }
        },
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        }
      },
      animation: {
        shimmer: "shimmer 2.2s linear infinite",
        pulseGlow: "pulseGlow 3.2s ease-in-out infinite",
        orbit: "orbit 24s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
