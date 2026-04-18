import { useVoltaStore, type Theme } from "../store/app-store";

const THEMES: { id: Theme; label: string; swatch: string }[] = [
  { id: "light", label: "Light", swatch: "#f3f4f6" },
  { id: "dark",  label: "Dark",  swatch: "#1a2030" },
  { id: "solar", label: "Solar", swatch: "#eee8d5" },
];

export function ThemeSelector() {
  const theme = useVoltaStore((s) => s.theme);
  const setTheme = useVoltaStore((s) => s.setTheme);

  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-widest text-muted">Theme</p>
      <div className="flex gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            onClick={() => setTheme(t.id)}
            className={`flex flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[10px] transition ${
              theme === t.id
                ? "bg-accent-bg text-accent-text font-medium"
                : "text-muted hover:bg-panel-alt hover:text-ink"
            }`}
          >
            <span
              className="block h-4 w-4 rounded-full border border-border"
              style={{ background: t.swatch }}
            />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
