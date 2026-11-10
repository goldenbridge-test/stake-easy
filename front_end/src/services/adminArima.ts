import api from "./api";
import type {
  AssetDetail,
  AssetKey,
  AssetSummary,
  ChangeSet,
  HistoryItem,
  MetaResponse,
  RegenResponse,
} from "../components/admin/arimaTypes";

// Client de l'API admin des parametres ARIMA par actif (backend : /api/strategy/admin/asset-params/).
// Le symbole BTC/USDT est passe en deux segments d'URL : .../binance/BTC/USDT/
const BASE = "/strategy/admin/asset-params";

const assetUrl = ({ exchange, symbol }: AssetKey) =>
  `${BASE}/${encodeURIComponent(exchange)}/${symbol.split("/").map(encodeURIComponent).join("/")}/`;

export const adminArima = {
  async meta(): Promise<MetaResponse> {
    return (await api.get<MetaResponse>(`${BASE}/meta/`)).data;
  },
  async listAssets(): Promise<AssetSummary[]> {
    return (await api.get<AssetSummary[]>(`${BASE}/`)).data;
  },
  async getAsset(asset: AssetKey): Promise<AssetDetail> {
    return (await api.get<AssetDetail>(assetUrl(asset))).data;
  },
  async patchAsset(asset: AssetKey, changes: ChangeSet): Promise<AssetDetail> {
    return (await api.patch<AssetDetail>(assetUrl(asset), { changes })).data;
  },
  /** fields = null -> retire toutes les surcharges de l'actif. */
  async resetAsset(asset: AssetKey, fields: string[] | null = null): Promise<AssetDetail> {
    return (await api.post<AssetDetail>(`${assetUrl(asset)}reset/`, fields ? { fields } : {})).data;
  },
  async history(asset: AssetKey, limit = 50): Promise<HistoryItem[]> {
    return (await api.get<HistoryItem[]>(`${assetUrl(asset)}history/`, { params: { limit } })).data;
  },
  async regenerateZones(asset: AssetKey): Promise<RegenResponse> {
    return (await api.post<RegenResponse>(`${assetUrl(asset)}regenerate-zones/`, { confirm: true })).data;
  },
};

export type AdminArimaApi = typeof adminArima;
