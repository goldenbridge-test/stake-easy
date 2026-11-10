// Logique pure (sans React) du formulaire des parametres ARIMA : parsing, validation, diff.
// Les bornes viennent de l'API (GET asset-params/meta/) : rien n'est code en dur ici.
import axios from "axios";
import type {
  ApiFailure,
  AssetDetail,
  ChangeSet,
  ParamMeta,
  ParamSource,
  ParamState,
  ParamValue,
} from "./arimaTypes";

// ------------------------------------------------------------------ decimaux
/** "0,60" / " 60.00 " / ".5" -> chaine canonique ("0.6", "60", "0.5"), ou null si invalide. */
export function normDecimal(raw: string): string | null {
  const text = raw.trim().replace(",", ".");
  const m = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(text);
  if (!m || (m[2] === "" && (m[3] ?? "") === "")) return null;
  const sign = m[1] === "-" ? "-" : "";
  const intPart = m[2].replace(/^0+(?=\d)/, "") || "0";
  const frac = (m[3] ?? "").replace(/0+$/, "");
  const out = frac ? `${intPart}.${frac}` : intPart;
  return out === "0" ? "0" : `${sign}${out}`;
}

const places = (norm: string) => (norm.includes(".") ? norm.split(".")[1].length : 0);

// ------------------------------------------------------------------ valeurs
export function draftFromValue(value: ParamValue | undefined): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map((v) => normDecimal(String(v)) ?? String(v)).join(", ");
  return normDecimal(String(value)) ?? String(value);
}

export function formatValue(meta: ParamMeta, value: ParamValue | undefined): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return `[${value.map((v) => normDecimal(String(v)) ?? String(v)).join(", ")}]`;
  const text = normDecimal(String(value)) ?? String(value);
  return meta.unit && meta.kind !== "schedule" ? `${text} ${meta.unit}` : text;
}

export function sameValue(a: ParamValue | undefined, b: ParamValue | undefined): boolean {
  const na = a === undefined ? null : a;
  const nb = b === undefined ? null : b;
  if (na === null || nb === null) return na === null && nb === null;
  if (Array.isArray(na) || Array.isArray(nb)) {
    if (!Array.isArray(na) || !Array.isArray(nb) || na.length !== nb.length) return false;
    return na.every((v, i) => Number(v) === Number(nb[i]));
  }
  return (normDecimal(String(na)) ?? String(na)) === (normDecimal(String(nb)) ?? String(nb));
}

// ------------------------------------------------------------------ validation
export type ParseResult = { ok: true; value: ParamValue } | { ok: false; error: string };

const num = (v: ParamValue) => (v === null || Array.isArray(v) ? null : Number(v));

function checkRange(meta: ParamMeta, value: number): string | null {
  const min = num(meta.min);
  const max = num(meta.max);
  if (min !== null && value < min) return `Doit être ≥ ${normDecimal(String(meta.min)) ?? meta.min}.`;
  if (max !== null && value > max) return `Doit être ≤ ${normDecimal(String(meta.max)) ?? meta.max}.`;
  return null;
}

/** Texte saisi -> valeur API. Vide = pas de surcharge (null). */
export function validateDraft(meta: ParamMeta, text: string): ParseResult {
  if (text.trim() === "") return { ok: true, value: null };

  if (meta.kind === "schedule") {
    const parts = text.split(/[\s,;]+/).filter(Boolean);
    if (parts.length < 1 || parts.length > 10) return { ok: false, error: "1 à 10 pourcentages séparés par des virgules (ex : 2, 2, 1)." };
    const values: number[] = [];
    for (const part of parts) {
      const n = /^\d*\.?\d+$|^\d+\.$/.test(part) ? normDecimal(part) : null;
      if (n === null) return { ok: false, error: `« ${part} » n'est pas un nombre.` };
      const v = Number(n);
      if (v <= 0 || v > 100) return { ok: false, error: "Chaque achat doit être > 0 et ≤ 100." };
      values.push(v);
    }
    if (values.reduce((a, b) => a + b, 0) > 100 + 1e-9) return { ok: false, error: "La somme du schedule ne peut pas dépasser 100 %." };
    return { ok: true, value: values };
  }

  const norm = normDecimal(text);
  if (norm === null) return { ok: false, error: "Nombre attendu." };
  if (meta.kind === "int") {
    if (norm.includes(".")) return { ok: false, error: "Entier attendu." };
    const range = checkRange(meta, Number(norm));
    return range ? { ok: false, error: range } : { ok: true, value: Number(norm) };
  }
  if (meta.decimal_places !== null && places(norm) > meta.decimal_places) {
    return { ok: false, error: `Maximum ${meta.decimal_places} décimale(s).` };
  }
  const range = checkRange(meta, Number(norm));
  return range ? { ok: false, error: range } : { ok: true, value: norm };
}

// ------------------------------------------------------------------ plan de modification
export const SOURCE_LABEL: Record<ParamSource, string> = {
  asset: "Surcharge",
  config: "Config",
  default: "Défaut",
};

/** Ce qui s'applique quand la surcharge est retiree. */
export function fallbackText(meta: ParamMeta, state: ParamState): string {
  const configValues = state.config_values.filter((v) => v !== null);
  if (configValues.length > 1) return "valeurs des stratégies";
  if (configValues.length === 1) return `${formatValue(meta, configValues[0])} (config)`;
  return `${formatValue(meta, meta.default)} (défaut)`;
}

export interface PlanEntry {
  name: string;
  label: string;
  from: string;
  to: string;
  affectsZones: boolean;
}

export interface Plan {
  changes: ChangeSet;
  entries: PlanEntry[];
  errors: Record<string, string>;
  touchesZones: boolean;
}

export function draftsFromDetail(metas: ParamMeta[], detail: AssetDetail): Record<string, string> {
  const out: Record<string, string> = {};
  for (const meta of metas) {
    const state = detail.params.find((p) => p.name === meta.name);
    out[meta.name] = draftFromValue(state?.override ?? null);
  }
  return out;
}

export function buildPlan(metas: ParamMeta[], detail: AssetDetail, drafts: Record<string, string>): Plan {
  const plan: Plan = { changes: {}, entries: [], errors: {}, touchesZones: false };
  for (const meta of metas) {
    const state = detail.params.find((p) => p.name === meta.name);
    if (!state) continue;
    const text = drafts[meta.name] ?? draftFromValue(state.override);
    const parsed = validateDraft(meta, text);
    if (!parsed.ok) {
      plan.errors[meta.name] = parsed.error;
      continue;
    }
    if (sameValue(parsed.value, state.override)) continue;
    plan.changes[meta.name] = parsed.value;
    plan.touchesZones = plan.touchesZones || meta.affects_zones;
    const from =
      state.override !== null
        ? formatValue(meta, state.override)
        : `${state.varies ? "variable" : formatValue(meta, state.effective)} (${SOURCE_LABEL[state.source].toLowerCase()})`;
    const to = parsed.value === null ? `surcharge retirée → ${fallbackText(meta, state)}` : formatValue(meta, parsed.value);
    plan.entries.push({ name: meta.name, label: meta.label, from, to, affectsZones: meta.affects_zones });
  }
  return plan;
}

// ------------------------------------------------------------------ erreurs API
export function toApiFailure(error: unknown): ApiFailure {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const data = error.response?.data as { detail?: unknown; errors?: unknown } | undefined;
    const fieldErrors: Record<string, string[]> = {};
    if (data && typeof data.errors === "object" && data.errors !== null) {
      for (const [field, messages] of Object.entries(data.errors as Record<string, unknown>)) {
        fieldErrors[field] = Array.isArray(messages) ? messages.map(String) : [String(messages)];
      }
    }
    let message: string;
    if (status === null) message = "Serveur injoignable.";
    else if (status === 401) message = "Session expirée : reconnecte-toi.";
    else if (status === 403) message = "Accès refusé : réservé aux administrateurs.";
    else if (status === 404) message = "Actif introuvable.";
    else if (typeof data?.detail === "string") message = data.detail;
    else message = `Erreur inattendue (${status}).`;
    return { status, message, fieldErrors };
  }
  return { status: null, message: "Erreur inattendue.", fieldErrors: {} };
}
