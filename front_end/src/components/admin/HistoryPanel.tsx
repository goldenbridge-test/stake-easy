import type { HistoryItem, ParamMeta } from "./arimaTypes";

interface Props {
  items: HistoryItem[] | null;
  metas: ParamMeta[];
  error?: string | null;
}

const fmt = (value: unknown): string => {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return `[${value.join(", ")}]`;
  return String(value);
};

const HistoryPanel = ({ items, metas, error }: Props) => {
  if (error) return <p role="alert" className="text-sm text-red-600">{error}</p>;
  if (items === null) return <p className="text-sm text-gray-400">Chargement de l'historique…</p>;
  if (items.length === 0) return <p className="text-sm text-gray-400">Aucune modification enregistrée.</p>;

  const label = (name: string) => metas.find((m) => m.name === name)?.label ?? name;

  return (
    <ul className="divide-y divide-gray-100">
      {items.map((item) => (
        <li key={item.id} className="py-3 text-sm">
          <p className="text-xs text-gray-400">
            {new Date(item.changed_at).toLocaleString("fr-FR")} · {item.changed_by ?? "système"}
          </p>
          {item.kind === "regenerate_zones" ? (
            <p className="text-gray-700">
              Zones régénérées
              {(() => {
                const s = (item.changes as Record<string, { deleted?: number; kept_referenced?: number }>)._regenerate_zones;
                return s ? ` — ${s.deleted ?? 0} supprimée(s), ${s.kept_referenced ?? 0} conservée(s)` : "";
              })()}
            </p>
          ) : (
            <ul className="text-gray-700">
              {Object.entries(item.changes).map(([name, change]) => {
                const c = change as { old?: unknown; new?: unknown };
                return (
                  <li key={name}>
                    <span className="font-bold">{label(name)}</span> : <span className="font-mono">{fmt(c.old)}</span> →{" "}
                    <span className="font-mono">{fmt(c.new)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
};

export default HistoryPanel;
