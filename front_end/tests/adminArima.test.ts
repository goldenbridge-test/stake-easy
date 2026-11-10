import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../src/services/api";
import { adminArima } from "../src/services/adminArima";

vi.mock("../src/services/api", () => ({ default: { get: vi.fn(), patch: vi.fn(), post: vi.fn() } }));
const mocked = vi.mocked(api);
const BTC = { exchange: "binance", symbol: "BTC/USDT" };
const BASE = "/strategy/admin/asset-params";

beforeEach(() => {
  vi.resetAllMocks();
  mocked.get.mockResolvedValue({ data: "G" });
  mocked.patch.mockResolvedValue({ data: "P" });
  mocked.post.mockResolvedValue({ data: "X" });
});

// Ces URL doivent rester identiques a apps/strategy/admin_urls.py (symbole en DEUX segments, slash final).
describe("adminArima : URL et corps conformes au backend", () => {
  it("meta et liste", async () => {
    expect(await adminArima.meta()).toBe("G");
    expect(mocked.get).toHaveBeenLastCalledWith(`${BASE}/meta/`);
    await adminArima.listAssets();
    expect(mocked.get).toHaveBeenLastCalledWith(`${BASE}/`);
  });

  it("detail : le symbole BTC/USDT devient deux segments", async () => {
    await adminArima.getAsset(BTC);
    expect(mocked.get).toHaveBeenLastCalledWith(`${BASE}/binance/BTC/USDT/`);
  });

  it("encode les caracteres speciaux de chaque segment", async () => {
    await adminArima.getAsset({ exchange: "bin ance", symbol: "1000SHIB/USDT" });
    expect(mocked.get).toHaveBeenLastCalledWith(`${BASE}/bin%20ance/1000SHIB/USDT/`);
  });

  it("patch : corps { changes }", async () => {
    expect(await adminArima.patchAsset(BTC, { discount_pct: "60", swing_left: null })).toBe("P");
    expect(mocked.patch).toHaveBeenCalledWith(`${BASE}/binance/BTC/USDT/`, { changes: { discount_pct: "60", swing_left: null } });
  });

  it("reset : tout = corps vide, partiel = { fields }", async () => {
    await adminArima.resetAsset(BTC);
    expect(mocked.post).toHaveBeenLastCalledWith(`${BASE}/binance/BTC/USDT/reset/`, {});
    await adminArima.resetAsset(BTC, ["swing_left"]);
    expect(mocked.post).toHaveBeenLastCalledWith(`${BASE}/binance/BTC/USDT/reset/`, { fields: ["swing_left"] });
  });

  it("historique : parametre limit", async () => {
    await adminArima.history(BTC);
    expect(mocked.get).toHaveBeenLastCalledWith(`${BASE}/binance/BTC/USDT/history/`, { params: { limit: 50 } });
    await adminArima.history(BTC, 10);
    expect(mocked.get).toHaveBeenLastCalledWith(`${BASE}/binance/BTC/USDT/history/`, { params: { limit: 10 } });
  });

  it("regeneration : confirm: true toujours envoye", async () => {
    await adminArima.regenerateZones(BTC);
    expect(mocked.post).toHaveBeenCalledWith(`${BASE}/binance/BTC/USDT/regenerate-zones/`, { confirm: true });
  });
});
