import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: "var(--color-app)",
        panel: "var(--color-panel)",
        "panel-alt": "var(--color-panel-alt)",
        accent: "var(--color-accent)",
        "accent-bg": "var(--color-accent-bg)",
        "accent-text": "var(--color-accent-text)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        divider: "var(--color-divider)",
      },
      boxShadow: {
        glow: "0 0 0 2px var(--color-accent-bg)",
      },
    },
  },
  plugins: [],
} satisfies Config;
