import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it } from "vitest";
import {
  buildPlan,
  draftFromValue,
  draftsFromDetail,
  fallbackText,
  formatValue,
  normDecimal,
  sameValue,
  toApiFailure,
  validateDraft,
} from "../src/components/admin/arimaParamsLogic";
import type { ParamMeta } from "../src/components/admin/arimaTypes";
import { btcFixture, metaFixture, withOverrides } from "./fixtures";

const metas = metaFixture().params;
const m = (name: string): ParamMeta => metas.find((p) => p.name === name)!;

describe("normDecimal", () => {
  it.each([
    ["60.00", "60"], [" 0,60 ", "0.6"], [".5", "0.5"], ["5.", "5"], ["007", "7"], ["-0", "0"], ["+5", "5"], ["0.10", "0.1"],
  ])("%j -> %j", (raw, expected) => expect(normDecimal(raw)).toBe(expected));

  it.each(["", " ", ".", "-", "abc", "1e5", "1.2.3", "1 000"])("rejette %j", (raw) => expect(normDecimal(raw)).toBeNull());
});

describe("validateDraft", () => {
  it("vide = pas de surcharge", () => {
    expect(validateDraft(m("discount_pct"), "")).toEqual({ ok: true, value: null });
    expect(validateDraft(m("discount_pct"), "   ")).toEqual({ ok: true, value: null });
  });

  it("decimaux : accepte la virgule, normalise, borne min/max, limite les decimales", () => {
    expect(validateDraft(m("tolerance_pct"), "0,8")).toEqual({ ok: true, value: "0.8" });
    expect(validateDraft(m("discount_pct"), "60.00")).toEqual({ ok: true, value: "60" });
    expect(validateDraft(m("discount_pct"), "100")).toEqual({ ok: true, value: "100" });
    for (const bad of ["100.5", "-1", "abc", "60.123"]) expect(validateDraft(m("discount_pct"), bad).ok, bad).toBe(false);
    expect(validateDraft(m("tolerance_pct"), "0.04").ok).toBe(false);          // min 0.05
    expect(validateDraft(m("capital_weight"), "0").ok).toBe(false);            // min 0.01
    expect(validateDraft(m("capital_weight"), "0.5")).toEqual({ ok: true, value: "0.5" });
  });

  it("entiers : refuse les decimaux et les hors-bornes", () => {
    expect(validateDraft(m("min_touch_count"), "3")).toEqual({ ok: true, value: 3 });
    for (const bad of ["1.5", "0", "21", "x"]) expect(validateDraft(m("min_touch_count"), bad).ok, bad).toBe(false);
    expect(validateDraft(m("swing_left"), "1").ok).toBe(false);
    expect(validateDraft(m("swing_left"), "31").ok).toBe(false);
    expect(validateDraft(m("fast_break_candles"), "30")).toEqual({ ok: true, value: 30 });
  });

  it("max_position_per_asset : positif, 10 decimales max", () => {
    expect(validateDraft(m("max_position_per_asset"), "5000")).toEqual({ ok: true, value: "5000" });
    expect(validateDraft(m("max_position_per_asset"), "0").ok).toBe(false);
    expect(validateDraft(m("max_position_per_asset"), "-5").ok).toBe(false);
    expect(validateDraft(m("max_position_per_asset"), "0.12345678901").ok).toBe(false);
  });

  it("schedule : liste de 1 a 10 achats, chacun dans ]0,100], somme <= 100", () => {
    expect(validateDraft(m("buy_streak_schedule"), "2, 2, 1")).toEqual({ ok: true, value: [2, 2, 1] });
    expect(validateDraft(m("buy_streak_schedule"), "2;2 1.5")).toEqual({ ok: true, value: [2, 2, 1.5] });
    expect(validateDraft(m("buy_streak_schedule"), "100")).toEqual({ ok: true, value: [100] });
    for (const bad of ["0", "-1", "101", "60, 50", "a, b", "1,,", "1 2 3 4 5 6 7 8 9 10 11"]) {
      const r = validateDraft(m("buy_streak_schedule"), bad);
      expect(r.ok, bad).toBe(bad === "1,," ? true : false);
    }
  });
});

describe("sameValue / draftFromValue / formatValue", () => {
  it("compare numeriquement, pas textuellement", () => {
    expect(sameValue("60.00", "60")).toBe(true);
    expect(sameValue(60, "60.0")).toBe(true);
    expect(sameValue("60", "61")).toBe(false);
    expect(sameValue(null, null)).toBe(true);
    expect(sameValue(null, "0")).toBe(false);
    expect(sameValue(undefined, null)).toBe(true);
    expect(sameValue([2, 2, 1], [2.0, 2.0, 1.0])).toBe(true);
    expect(sameValue([2, 2, 1], [2, 2])).toBe(false);
    expect(sameValue([2, 2], 2)).toBe(false);
  });

  it("brouillon et affichage", () => {
    expect(draftFromValue(null)).toBe("");
    expect(draftFromValue("60.00")).toBe("60");
    expect(draftFromValue([2, 2, 1])).toBe("2, 2, 1");
    expect(formatValue(m("discount_pct"), "75.00")).toBe("75 %");
    expect(formatValue(m("leave_atr_multiplier"), "2.00")).toBe("2 x ATR");
    expect(formatValue(m("buy_streak_schedule"), [2, 2, 1])).toBe("[2, 2, 1]");
    expect(formatValue(m("max_position_per_asset"), null)).toBe("—");
    expect(formatValue(m("swing_left"), 8)).toBe("8 bougies");
  });
});

describe("buildPlan", () => {
  const detail = btcFixture();

  it("aucun changement quand les brouillons viennent du detail", () => {
    const plan = buildPlan(metas, detail, draftsFromDetail(metas, detail));
    expect(plan.entries).toEqual([]);
    expect(plan.changes).toEqual({});
    expect(plan.errors).toEqual({});
    expect(plan.touchesZones).toBe(false);
  });

  it("ne renvoie QUE les champs modifies", () => {
    const drafts = { ...draftsFromDetail(metas, detail), discount_pct: "60", capital_weight: "0,5" };
    const plan = buildPlan(metas, detail, drafts);
    expect(plan.changes).toEqual({ discount_pct: "60", capital_weight: "0.5" });
    expect(plan.entries.map((e) => e.name)).toEqual(["discount_pct", "capital_weight"]);
    expect(plan.entries[0].from).toBe("75 % (config)");   // BTC a une stratégie live à 75
    expect(plan.entries[0].to).toBe("60 %");
    expect(plan.touchesZones).toBe(false);
  });

  it("une valeur equivalente n'est pas un changement (60 vs 60.00)", () => {
    const d = withOverrides(detail, { discount_pct: "60.00" });
    const plan = buildPlan(metas, d, { ...draftsFromDetail(metas, d), discount_pct: "60" });
    expect(plan.entries).toEqual([]);
  });

  it("retirer une surcharge envoie null et decrit le retour arriere", () => {
    const d = withOverrides(detail, { discount_pct: "60.00" });
    const plan = buildPlan(metas, d, { ...draftsFromDetail(metas, d), discount_pct: "" });
    expect(plan.changes).toEqual({ discount_pct: null });
    expect(plan.entries[0].from).toBe("60 %");
    expect(plan.entries[0].to).toBe("surcharge retirée → 75 % (config)");
  });

  it("detecte les parametres de zones", () => {
    const plan = buildPlan(metas, detail, { ...draftsFromDetail(metas, detail), swing_left: "10" });
    expect(plan.touchesZones).toBe(true);
    expect(plan.changes).toEqual({ swing_left: 10 });
  });

  it("collecte les erreurs sans les ajouter aux changements", () => {
    const plan = buildPlan(metas, detail, { ...draftsFromDetail(metas, detail), discount_pct: "500", swing_left: "1", min_touch_count: "3" });
    expect(Object.keys(plan.errors).sort()).toEqual(["discount_pct", "swing_left"]);
    expect(plan.changes).toEqual({ min_touch_count: 3 });
  });

  it("fallbackText : config unique, configs divergentes, defaut", () => {
    const d = btcFixture();
    const discount = d.params.find((p) => p.name === "discount_pct")!;
    expect(fallbackText(m("discount_pct"), discount)).toBe("75 % (config)");
    discount.config_values = ["50.00", "60.00"];
    expect(fallbackText(m("discount_pct"), discount)).toBe("valeurs des stratégies");
    expect(fallbackText(m("tolerance_pct"), d.params.find((p) => p.name === "tolerance_pct")!)).toBe("0.6 % (défaut)");
  });
});

describe("toApiFailure", () => {
  const axiosError = (status?: number, data?: unknown) => {
    const config = { headers: {} } as InternalAxiosRequestConfig;
    const response = status === undefined ? undefined : ({ status, data, statusText: "", headers: {}, config } as AxiosResponse);
    return new AxiosError("boom", "ERR", config, undefined, response);
  };

  it("400 : erreurs par champ", () => {
    const f = toApiFailure(axiosError(400, { detail: "Donnees invalides.", errors: { discount_pct: ["Doit etre <= 100."], swing_left: ["x", "y"] } }));
    expect(f.status).toBe(400);
    expect(f.fieldErrors).toEqual({ discount_pct: ["Doit etre <= 100."], swing_left: ["x", "y"] });
    expect(f.message).toBe("Donnees invalides.");
  });

  it.each([[401, /expirée/], [403, /Accès refusé/], [404, /introuvable/], [500, /500/]])("%i", (status, pattern) => {
    expect(toApiFailure(axiosError(status, {})).message).toMatch(pattern);
  });

  it("reseau coupe et erreur non-axios", () => {
    expect(toApiFailure(axiosError(undefined)).message).toBe("Serveur injoignable.");
    expect(toApiFailure(new Error("x")).status).toBeNull();
  });
});
