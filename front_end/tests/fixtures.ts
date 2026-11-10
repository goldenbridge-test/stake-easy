// Donnees de test generees depuis le VRAI backend (voir tests/fixtures/*.json).
import type { AssetDetail, AssetSummary, MetaResponse, ParamState } from "../src/components/admin/arimaTypes";
import meta from "./fixtures/meta.json";
import assets from "./fixtures/assets.json";
import detailBtc from "./fixtures/detail_btc.json";
import detailEth from "./fixtures/detail_eth.json";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export const metaFixture = (): MetaResponse => clone(meta) as unknown as MetaResponse;
export const assetsFixture = (): AssetSummary[] => clone(assets) as unknown as AssetSummary[];
export const btcFixture = (): AssetDetail => clone(detailBtc) as unknown as AssetDetail;
export const ethFixture = (): AssetDetail => clone(detailEth) as unknown as AssetDetail;

/** Copie d'un detail avec des surcharges posees : withOverrides(btcFixture(), {discount_pct: "60.00"}). */
export function withOverrides(detail: AssetDetail, overrides: Record<string, ParamState["override"]>): AssetDetail {
  const d = clone(detail);
  for (const p of d.params) {
    if (p.name in overrides) {
      p.override = overrides[p.name];
      p.source = overrides[p.name] === null ? p.source : "asset";
      if (overrides[p.name] !== null) p.effective = overrides[p.name];
    }
  }
  d.has_overrides = d.params.some((p) => p.override !== null);
  return d;
}
