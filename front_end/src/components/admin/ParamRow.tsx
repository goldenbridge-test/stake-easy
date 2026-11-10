import { RotateCcw } from "lucide-react";
import type { ParamMeta, ParamState } from "./arimaTypes";
import { SOURCE_LABEL, formatValue } from "./arimaParamsLogic";

const BADGE: Record<ParamState["source"], string> = {
  asset: "bg-gold/20 text-yellow-800 border-gold",
  config: "bg-blue-50 text-blue-700 border-blue-200",
  default: "bg-gray-100 text-gray-600 border-gray-200",
};

interface Props {
  meta: ParamMeta;
  state: ParamState;
  draft: string;
  error?: string;
  serverErrors?: string[];
  disabled: boolean;
  onChange: (value: string) => void;
}

const rangeHint = (meta: ParamMeta) => {
  if (meta.kind === "schedule") return "1 à 10 achats, somme ≤ 100 %";
  const min = formatValue({ ...meta, unit: "" }, meta.min);
  const max = formatValue({ ...meta, unit: "" }, meta.max);
  return `${min} – ${max}${meta.unit ? ` ${meta.unit}` : ""}`;
};

const ParamRow = ({ meta, state, draft, error, serverErrors, disabled, onChange }: Props) => {
  const inputId = `param-${meta.name}`;
  const errorId = `${inputId}-error`;
  const shownError = error ?? serverErrors?.[0];
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 py-4 border-b border-gray-100 last:border-b-0">
      <div className="md:col-span-2">
        <label htmlFor={inputId} className="font-bold text-sm text-primary">
          {meta.label}
        </label>
        <span className={`ml-2 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${BADGE[state.source]}`}>
          {SOURCE_LABEL[state.source]}
        </span>
        <p className="text-xs text-gray-500 mt-1">{meta.description}</p>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <p>
          <span className="text-gray-400">Effective : </span>
          <span className="font-mono font-bold">{state.varies ? "variable" : formatValue(meta, state.effective)}</span>
        </p>
        {state.varies && (
          <p className="text-gray-500">Selon les stratégies : {state.config_values.map((v) => formatValue(meta, v)).join(" / ")}</p>
        )}
        <p>
          <span className="text-gray-400">Défaut : </span>
          <span className="font-mono">{formatValue(meta, meta.default)}</span>
        </p>
      </div>

      <div className="md:col-span-2">
        <div className="flex gap-2">
          <input
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={draft}
            disabled={disabled}
            placeholder="Vide = pas de surcharge"
            aria-invalid={shownError ? true : undefined}
            aria-describedby={shownError ? errorId : undefined}
            onChange={(e) => onChange(e.target.value)}
            className={`flex-1 min-w-0 px-3 py-2 rounded-lg border outline-none font-mono text-sm focus:border-gold disabled:opacity-50 ${
              shownError ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled || draft === ""}
            aria-label={`Retirer la surcharge : ${meta.label}`}
            title="Retirer la surcharge"
            className="px-2 rounded-lg border border-gray-200 text-gray-500 hover:text-primary hover:border-primary disabled:opacity-30"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">{rangeHint(meta)}</p>
        {shownError && (
          <p id={errorId} role="alert" className="text-xs text-red-600 mt-1">
            {shownError}
          </p>
        )}
      </div>
    </div>
  );
};

export default ParamRow;
