import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: "#f3f4f6",
        panel: "#ffffff",
        "panel-alt": "#f9fafb",
        accent: "#2563eb",
        ink: "#111827",
        muted: "#6b7280",
        border: "rgba(0, 0, 0, 0.09)",
      },
      boxShadow: {
        glow: "0 0 0 2px rgba(37, 99, 235, 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
