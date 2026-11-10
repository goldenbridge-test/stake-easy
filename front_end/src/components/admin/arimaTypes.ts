// Types du contrat de l'API admin (voir docs/ARIMA_ADMIN_PLAN.md §8).
export type ParamKind = "decimal" | "int" | "schedule";
export type ParamValue = string | number | Array<string | number> | null;
export type ParamSource = "asset" | "config" | "default";

export interface ParamMeta {
  name: string;
  label: string;
  description: string;
  kind: ParamKind;
  default: ParamValue;
  min: ParamValue;
  max: ParamValue;
  decimal_places: number | null;
  unit: string;
  config_field: string | null;
  affects_zones: boolean;
}

export interface MetaResponse {
  params: ParamMeta[];
  zone_affecting: string[];
  apply_modes: string[];
}

export interface AssetKey {
  exchange: string;
  symbol: string;
}

export interface AssetSummary extends AssetKey {
  has_overrides: boolean;
  live_active: number;
  test_active: number;
  zones_need_regen: boolean;
}

export interface ParamState {
  name: string;
  override: ParamValue;
  default: ParamValue;
  config_values: ParamValue[];
  source: ParamSource;
  effective: ParamValue;
  varies: boolean;
  affects_zones: boolean;
}

export interface AssetDetail extends AssetKey {
  has_overrides: boolean;
  params: ParamState[];
  configs: { live_active: number; test_active: number; live_total: number; test_total: number };
  zones_need_regen: boolean;
  zone_params: { tolerance_pct: number; left: number; right: number; min_band_pct: number };
  updated_at: string | null;
  updated_by: string | null;
}

export interface HistoryItem {
  id: number;
  changed_at: string;
  changed_by: string | null;
  kind: "update" | "regenerate_zones";
  changes: Record<string, unknown>;
}

export interface RegenSummary {
  deleted: number;
  kept_referenced: number;
  deactivated: number;
  active_after: number;
  params: { tolerance_pct: number; left: number; right: number; min_band_pct: number };
}

export interface RegenResponse {
  summary: RegenSummary;
  detail: AssetDetail;
}

/** {champ: valeur} ; null retire la surcharge. */
export type ChangeSet = Record<string, ParamValue>;

export interface ApiFailure {
  status: number | null;
  message: string;
  fieldErrors: Record<string, string[]>;
}
