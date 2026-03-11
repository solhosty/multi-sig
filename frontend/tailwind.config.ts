import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))"
      },
      borderRadius: {
        xl: "1.125rem",
        "2xl": "1.5rem"
      },
      boxShadow: {
        "soft-xl": "0 12px 35px rgba(15, 23, 42, 0.12)",
        "soft-lg": "0 8px 24px rgba(15, 23, 42, 0.1)"
      },
      keyframes: {
        reveal: {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        reveal: "reveal 420ms ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
