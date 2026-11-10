import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  History as HistoryIcon,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { adminArima } from "../../services/adminArima";
import type { AssetDetail, AssetKey, AssetSummary, HistoryItem, MetaResponse, ParamMeta } from "./arimaTypes";
import { buildPlan, draftsFromDetail, toApiFailure } from "./arimaParamsLogic";
import ParamRow from "./ParamRow";
import ConfirmModal from "./ConfirmModal";
import HistoryPanel from "./HistoryPanel";

type Pending = "save" | "reset" | "regen" | null;
type Banner = { type: "success" | "error"; text: string } | null;

// Regroupement visuel. Un parametre absent de ces groupes (ajoute plus tard cote API) est affiche dans "Autres".
const GROUPS: { title: string; note?: string; names: string[] }[] = [
  {
    title: "Achats et capital",
    names: ["discount_pct", "buy_streak_schedule", "min_touch_count", "capital_weight", "max_position_per_asset"],
  },
  { title: "Sorties et protection", names: ["leave_atr_multiplier", "fast_break_candles"] },
  {
    title: "Détection des zones",
    note: "Les zones sont partagées entre tous les modes : ces valeurs s'appliquent aussi aux backtests. Après un changement, régénère les zones.",
    names: ["tolerance_pct", "swing_left", "swing_right", "min_band_pct"],
  },
];

const sameAsset = (a: AssetKey | null, b: AssetKey) => !!a && a.exchange === b.exchange && a.symbol === b.symbol;

const ArimaParams = () => {
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "forbidden" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState("");

  const [selected, setSelected] = useState<AssetKey | null>(null);
  const [detail, setDetail] = useState<AssetDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});

  const [banner, setBanner] = useState<Banner>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const seq = useRef(0); // ignore les reponses d'un actif deja quitte

  // ------------------------------------------------------------------ chargements
  useEffect(() => {
    let alive = true;
    setStatus("loading");
    (async () => {
      try {
        const [m, list] = await Promise.all([adminArima.meta(), adminArima.listAssets()]);
        if (!alive) return;
        setMeta(m);
        setAssets(list);
        setStatus("ready");
      } catch (err) {
        if (!alive) return;
        const failure = toApiFailure(err);
        setLoadError(failure.message);
        setStatus(failure.status === 403 ? "forbidden" : "error");
      }
    })();
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const refreshList = useCallback(async () => {
    try {
      setAssets(await adminArima.listAssets());
    } catch {
      /* la liste sera rechargee au prochain chargement */
    }
  }, []);

  const loadDetail = useCallback(async (asset: AssetKey, metas: ParamMeta[]) => {
    const mine = ++seq.current;
    setDetailLoading(true);
    setBanner(null);
    setServerErrors({});
    try {
      const d = await adminArima.getAsset(asset);
      if (mine !== seq.current) return;
      setDetail(d);
      setDrafts(draftsFromDetail(metas, d));
    } catch (err) {
      if (mine !== seq.current) return;
      setDetail(null);
      setBanner({ type: "error", text: toApiFailure(err).message });
    } finally {
      if (mine === seq.current) setDetailLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (asset: AssetKey) => {
    setHistoryError(null);
    try {
      setHistory(await adminArima.history(asset));
    } catch (err) {
      setHistoryError(toApiFailure(err).message);
    }
  }, []);

  useEffect(() => {
    if (showHistory && selected) {
      setHistory(null);
      void loadHistory(selected);
    }
  }, [showHistory, selected, loadHistory]);

  // ------------------------------------------------------------------ etat derive
  const plan = useMemo(() => (meta && detail ? buildPlan(meta.params, detail, drafts) : null), [meta, detail, drafts]);
  const dirty = !!plan && plan.entries.length > 0;
  const invalidCount = plan ? Object.keys(plan.errors).length : 0;
  const locked = busy || detailLoading;
  const liveActive = detail?.configs.live_active ?? 0;

  const visibleAssets = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? assets.filter((a) => `${a.symbol} ${a.exchange}`.toLowerCase().includes(q)) : assets;
  }, [assets, filter]);

  // ------------------------------------------------------------------ actions
  const selectAsset = (asset: AssetKey) => {
    if (!meta || sameAsset(selected, asset)) return;
    if (dirty && !window.confirm("Des modifications ne sont pas enregistrées. Changer d'actif et les perdre ?")) return;
    const key: AssetKey = { exchange: asset.exchange, symbol: asset.symbol };
    setSelected(key);
    setDetail(null);
    setHistory(null);
    void loadDetail(key, meta.params);
  };

  const onDraftChange = (name: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [name]: value }));
    setServerErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const cancelEdits = () => {
    if (meta && detail) setDrafts(draftsFromDetail(meta.params, detail));
    setServerErrors({});
  };

  const afterMutation = (d: AssetDetail) => {
    if (!meta || !selected) return;
    setDetail(d);
    setDrafts(draftsFromDetail(meta.params, d));
    setServerErrors({});
    void refreshList();
    if (showHistory) void loadHistory(selected);
  };

  const doSave = async () => {
    if (!selected || !plan) return;
    setBusy(true);
    try {
      const d = await adminArima.patchAsset(selected, plan.changes);
      afterMutation(d);
      const n = Object.keys(plan.changes).length;
      setBanner({
        type: "success",
        text: `${n} paramètre(s) enregistré(s).${plan.touchesZones ? " Pense à régénérer les zones." : ""}`,
      });
    } catch (err) {
      const failure = toApiFailure(err);
      setServerErrors(failure.fieldErrors);
      setBanner({ type: "error", text: failure.status === 400 ? "Valeurs refusées par le serveur." : failure.message });
    } finally {
      setPending(null);
      setBusy(false);
    }
  };

  const doReset = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      afterMutation(await adminArima.resetAsset(selected, null));
      setBanner({ type: "success", text: "Toutes les surcharges de cet actif ont été retirées." });
    } catch (err) {
      setBanner({ type: "error", text: toApiFailure(err).message });
    } finally {
      setPending(null);
      setBusy(false);
    }
  };

  const doRegen = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await adminArima.regenerateZones(selected);
      afterMutation(res.detail);
      const s = res.summary;
      setBanner({
        type: "success",
        text: `Zones régénérées : ${s.deleted} supprimée(s), ${s.kept_referenced} conservée(s) car liées à des positions, ${s.active_after} active(s).`,
      });
    } catch (err) {
      setBanner({ type: "error", text: toApiFailure(err).message });
    } finally {
      setPending(null);
      setBusy(false);
    }
  };

  // ------------------------------------------------------------------ rendu : etats globaux
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-gray-500 text-sm" role="status">
        <Loader2 className="w-4 h-4 animate-spin" /> Chargement des paramètres…
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div role="alert" className="bg-white rounded-xl shadow-md border-t-4 border-red-500 p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-red-600 mx-auto mb-3" />
        <p className="font-bold text-gray-800">{loadError}</p>
        <p className="text-sm text-gray-500 mt-1">Ton compte n'a pas les droits administrateur sur le serveur.</p>
      </div>
    );
  }

  if (status === "error" || !meta) {
    return (
      <div role="alert" className="bg-white rounded-xl shadow-md border-t-4 border-red-500 p-8 text-center">
        <p className="font-bold text-gray-800">{loadError ?? "Impossible de charger les paramètres."}</p>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-bold hover:bg-gray-700"
        >
          <RefreshCw className="w-4 h-4" /> Réessayer
        </button>
      </div>
    );
  }

  // ------------------------------------------------------------------ rendu : principal
  const groupedNames = new Set(GROUPS.flatMap((g) => g.names));
  const otherNames = meta.params.map((p) => p.name).filter((n) => !groupedNames.has(n));
  const groups = [...GROUPS, ...(otherNames.length ? [{ title: "Autres", names: otherNames, note: undefined }] : [])];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-6">
      {/* ---------------- liste des actifs ---------------- */}
      <aside aria-label="Actifs" className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden self-start">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-heading font-bold text-primary">Actifs</h2>
          <input
            type="search"
            aria-label="Filtrer les actifs"
            placeholder="Filtrer…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-gold"
          />
        </div>
        {visibleAssets.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">Aucun actif.</p>
        ) : (
          <ul className="divide-y divide-gray-100 max-h-[32rem] overflow-y-auto">
            {visibleAssets.map((a) => {
              const active = sameAsset(selected, a);
              return (
                <li key={`${a.exchange}/${a.symbol}`}>
                  <button
                    type="button"
                    onClick={() => selectAsset(a)}
                    aria-current={active ? "true" : undefined}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${active ? "bg-gold/10 border-l-4 border-gold" : ""}`}
                  >
                    <span className="font-mono font-bold text-sm text-primary">{a.symbol}</span>
                    <span className="ml-2 text-xs text-gray-400">{a.exchange}</span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      {a.has_overrides && <Pill className="bg-gold/20 text-yellow-800">surchargé</Pill>}
                      {a.live_active > 0 && <Pill className="bg-red-100 text-red-700">live ×{a.live_active}</Pill>}
                      {a.test_active > 0 && <Pill className="bg-blue-50 text-blue-700">test ×{a.test_active}</Pill>}
                      {a.zones_need_regen && <Pill className="bg-orange-100 text-orange-700">zones à régénérer</Pill>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* ---------------- detail ---------------- */}
      <section aria-label="Paramètres de l'actif" className="space-y-4 min-w-0">
        {banner && (
          <div
            role={banner.type === "error" ? "alert" : "status"}
            className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
              banner.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            {banner.type === "error" ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> : <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            <span>{banner.text}</span>
          </div>
        )}

        {!selected && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-10 text-center text-gray-400 text-sm">
            Choisis un actif pour afficher et modifier ses paramètres.
          </div>
        )}

        {selected && detailLoading && (
          <div role="status" className="flex items-center justify-center gap-2 py-16 text-gray-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement de {selected.symbol}…
          </div>
        )}

        {selected && detail && !detailLoading && plan && (
          <>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 md:p-6">
              <h2 className="text-xl font-heading font-bold text-primary">
                {detail.symbol} <span className="text-sm font-normal text-gray-400">{detail.exchange}</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Stratégies actives : {detail.configs.live_active} live, {detail.configs.test_active} test. Les surcharges s'appliquent aux
                stratégies test et live au prochain scan (toutes les 4 h) ; vide = valeur actuelle de la stratégie ou défaut.
                {detail.updated_at && (
                  <> Dernière modification : {new Date(detail.updated_at).toLocaleString("fr-FR")}{detail.updated_by ? ` par ${detail.updated_by}` : ""}.</>
                )}
              </p>

              {liveActive > 0 && (
                <p className="mt-3 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  {liveActive} stratégie(s) LIVE active(s) sur cet actif : toute modification affecte de l'argent réel.
                </p>
              )}

              {detail.zones_need_regen && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-orange-800 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <span>Des paramètres de zones ont changé depuis la dernière régénération : les zones actuelles ne les reflètent pas encore.</span>
                  <button
                    type="button"
                    onClick={() => setPending("regen")}
                    disabled={locked || dirty}
                    title={dirty ? "Enregistre ou annule d'abord les modifications" : undefined}
                    className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold disabled:opacity-50"
                  >
                    Régénérer les zones
                  </button>
                </div>
              )}
            </div>

            {groups.map((group) => {
              const rows = group.names
                .map((name) => ({ meta: meta.params.find((p) => p.name === name), state: detail.params.find((p) => p.name === name) }))
                .filter((r): r is { meta: ParamMeta; state: AssetDetail["params"][number] } => !!r.meta && !!r.state);
              if (rows.length === 0) return null;
              return (
                <div key={group.title} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="p-4 md:px-6 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-heading font-bold text-primary">{group.title}</h3>
                    {group.note && <p className="text-xs text-gray-500 mt-1">{group.note}</p>}
                  </div>
                  <div className="px-4 md:px-6">
                    {rows.map(({ meta: m, state }) => (
                      <ParamRow
                        key={m.name}
                        meta={m}
                        state={state}
                        draft={drafts[m.name] ?? ""}
                        error={plan.errors[m.name]}
                        serverErrors={serverErrors[m.name]}
                        disabled={locked}
                        onChange={(value) => onDraftChange(m.name, value)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* ---------------- barre d'actions ---------------- */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setPending("save")}
                disabled={locked || !dirty || invalidCount > 0}
                className="px-5 py-2 rounded-lg bg-gold hover:bg-gold-hover text-white font-bold text-sm disabled:opacity-50"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={cancelEdits}
                disabled={locked || !dirty}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler les modifications
              </button>
              <button
                type="button"
                onClick={() => setPending("reset")}
                disabled={locked || !detail.has_overrides}
                className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-bold hover:bg-red-50 disabled:opacity-50"
              >
                Tout remettre par défaut
              </button>
              <button
                type="button"
                onClick={() => setPending("regen")}
                disabled={locked || dirty}
                title={dirty ? "Enregistre ou annule d'abord les modifications" : undefined}
                className="px-4 py-2 rounded-lg border border-orange-300 text-orange-700 text-sm font-bold hover:bg-orange-50 disabled:opacity-50"
              >
                Régénérer les zones
              </button>
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                aria-expanded={showHistory}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg text-primary text-sm font-bold hover:bg-gray-50"
              >
                <HistoryIcon className="w-4 h-4" /> Historique
              </button>
              {invalidCount > 0 && <p className="w-full text-xs text-red-600">{invalidCount} champ(s) invalide(s) à corriger avant d'enregistrer.</p>}
              {dirty && invalidCount === 0 && (
                <p className="w-full text-xs text-gray-500">{plan.entries.length} modification(s) non enregistrée(s).</p>
              )}
            </div>

            {showHistory && (
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 md:p-6">
                <h3 className="font-heading font-bold text-primary mb-2">Historique</h3>
                <HistoryPanel items={history} metas={meta.params} error={historyError} />
              </div>
            )}
          </>
        )}
      </section>

      {/* ---------------- modales de confirmation ---------------- */}
      {pending === "save" && plan && (
        <ConfirmModal
          title="Confirmer les modifications"
          confirmLabel="Enregistrer"
          busy={busy}
          ackLabel={liveActive > 0 ? `Je confirme appliquer ces changements à ${liveActive} stratégie(s) live.` : undefined}
          onConfirm={doSave}
          onCancel={() => setPending(null)}
        >
          <p>
            Actif <strong className="font-mono">{selected?.symbol}</strong> :
          </p>
          <ul className="space-y-1">
            {plan.entries.map((e) => (
              <li key={e.name} className="bg-gray-50 rounded-lg px-3 py-2">
                <span className="font-bold">{e.label}</span>
                <br />
                <span className="font-mono text-xs text-gray-500">{e.from}</span> → <span className="font-mono text-xs font-bold text-primary">{e.to}</span>
              </li>
            ))}
          </ul>
          {plan.touchesZones && <p className="text-orange-700">Des paramètres de zones changent : régénère ensuite les zones pour qu'ils prennent effet.</p>}
        </ConfirmModal>
      )}

      {pending === "reset" && (
        <ConfirmModal
          title="Tout remettre par défaut"
          confirmLabel="Retirer les surcharges"
          busy={busy}
          ackLabel={liveActive > 0 ? `Je confirme le retour aux valeurs actuelles des ${liveActive} stratégie(s) live.` : undefined}
          onConfirm={doReset}
          onCancel={() => setPending(null)}
        >
          <p>
            Toutes les surcharges de <strong className="font-mono">{selected?.symbol}</strong> seront retirées : le bot reprend les valeurs de chaque
            stratégie (ou les défauts). L'historique est conservé.
          </p>
        </ConfirmModal>
      )}

      {pending === "regen" && (
        <ConfirmModal title="Régénérer les zones" confirmLabel="Régénérer" busy={busy} onConfirm={doRegen} onCancel={() => setPending(null)}>
          <p>
            Les zones automatiques de <strong className="font-mono">{selected?.symbol}</strong> (1d) non utilisées sont supprimées puis recalculées avec
            les paramètres de zones de cet actif.
          </p>
          <p>
            Les zones liées à des positions, des trades, des paliers de TP ou à une cible sont <strong>conservées</strong> (désactivées). Les zones
            manuelles ne sont pas touchées.
          </p>
        </ConfirmModal>
      )}
    </div>
  );
};

const Pill = ({ className, children }: { className: string; children: React.ReactNode }) => (
  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${className}`}>{children}</span>
);

export default ArimaParams;
