import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ArimaParams from "../src/components/admin/ArimaParams";
import { adminArima } from "../src/services/adminArima";
import { assetsFixture, btcFixture, ethFixture, metaFixture, withOverrides } from "./fixtures";
import { axiosError, deferred } from "./helpers";

vi.mock("../src/services/adminArima", () => ({
  adminArima: {
    meta: vi.fn(), listAssets: vi.fn(), getAsset: vi.fn(), patchAsset: vi.fn(),
    resetAsset: vi.fn(), history: vi.fn(), regenerateZones: vi.fn(),
  },
}));
const api = vi.mocked(adminArima);
const BTC = { exchange: "binance", symbol: "BTC/USDT" };

async function open(symbol = "BTC/USDT") {
  const user = userEvent.setup();
  render(<ArimaParams />);
  await screen.findByText("Choisis un actif pour afficher et modifier ses paramètres.");
  await user.click(screen.getByRole("button", { name: new RegExp(symbol) }));
  await screen.findByRole("heading", { level: 2, name: new RegExp(symbol) });
  return user;
}
const input = (label: RegExp | string) => screen.getByRole("textbox", { name: label });

beforeEach(() => {
  vi.resetAllMocks();
  api.meta.mockResolvedValue(metaFixture());
  api.listAssets.mockResolvedValue(assetsFixture());
  api.getAsset.mockImplementation(async (a) => (a.symbol === "ETH/USDT" ? ethFixture() : btcFixture()));
  api.history.mockResolvedValue([]);
});

describe("chargement", () => {
  it("liste les actifs et invite a en choisir un", async () => {
    render(<ArimaParams />);
    expect(await screen.findByText("Choisis un actif pour afficher et modifier ses paramètres.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /BTC\/USDT/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ETH\/USDT/ })).toBeInTheDocument();
    expect(api.getAsset).not.toHaveBeenCalled();
  });

  it("403 : message d'acces refuse, aucune liste", async () => {
    api.meta.mockRejectedValue(axiosError(403, { detail: "interdit" }));
    render(<ArimaParams />);
    expect(await screen.findByText(/Accès refusé/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /BTC\/USDT/ })).not.toBeInTheDocument();
  });

  it("erreur reseau : bouton Reessayer relance le chargement", async () => {
    api.meta.mockRejectedValueOnce(axiosError(undefined));
    const user = userEvent.setup();
    render(<ArimaParams />);
    expect(await screen.findByText("Serveur injoignable.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Réessayer/ }));
    expect(await screen.findByRole("button", { name: /BTC\/USDT/ })).toBeInTheDocument();
  });

  it("filtre la liste des actifs", async () => {
    const user = userEvent.setup();
    render(<ArimaParams />);
    await screen.findByRole("button", { name: /BTC\/USDT/ });
    await user.type(screen.getByRole("searchbox", { name: "Filtrer les actifs" }), "eth");
    expect(screen.queryByRole("button", { name: /BTC\/USDT/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ETH\/USDT/ })).toBeInTheDocument();
  });
});

describe("detail d'un actif", () => {
  it("affiche les 11 parametres, leur origine, et l'avertissement live", async () => {
    await open();
    expect(api.getAsset).toHaveBeenCalledWith(BTC);
    expect(screen.getAllByRole("textbox").filter((el) => el.id.startsWith("param-"))).toHaveLength(11);
    expect(screen.getByText(/1 stratégie\(s\) LIVE active\(s\)/)).toBeInTheDocument();
    expect(screen.getByText("Détection des zones")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeDisabled();
  });

  it("pas d'avertissement live pour un actif en test seulement", async () => {
    await open("ETH/USDT");
    expect(screen.queryByText(/LIVE active/)).not.toBeInTheDocument();
  });

  it("pre-remplit les champs surcharges", async () => {
    api.getAsset.mockResolvedValue(withOverrides(btcFixture(), { discount_pct: "60.00", buy_streak_schedule: [1, 1] }));
    await open();
    expect(input("Discount (fib %)")).toHaveValue("60");
    expect(input("Schedule d'achats (streak)")).toHaveValue("1, 1");
    expect(input("Touches minimales")).toHaveValue("");
  });
});

describe("edition et validation", () => {
  it("active Enregistrer pour une valeur valide, le desactive pour une valeur invalide", async () => {
    const user = await open();
    await user.type(input("Discount (fib %)"), "60");
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeEnabled();
    await user.clear(input("Discount (fib %)"));
    await user.type(input("Discount (fib %)"), "500");
    expect(await screen.findByText("Doit être ≤ 100.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeDisabled();
    expect(screen.getByText(/1 champ\(s\) invalide\(s\)/)).toBeInTheDocument();
  });

  it("un champ valide + un champ invalide : l'enregistrement reste bloque (aucun envoi partiel silencieux)", async () => {
    const user = await open("ETH/USDT");
    await user.type(input("Touches minimales"), "3");               // valide
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeEnabled();
    await user.type(input("Discount (fib %)"), "500");              // invalide
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeDisabled();
    expect(screen.getByText(/1 champ\(s\) invalide\(s\)/)).toBeInTheDocument();
    await user.clear(input("Discount (fib %)"));                    // corrige -> debloque
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeEnabled();
  });

  it("annuler les modifications restaure les valeurs", async () => {
    const user = await open();
    await user.type(input("Discount (fib %)"), "60");
    await user.click(screen.getByRole("button", { name: "Annuler les modifications" }));
    expect(input("Discount (fib %)")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeDisabled();
  });

  it("le bouton de retrait vide le champ", async () => {
    api.getAsset.mockResolvedValue(withOverrides(btcFixture(), { discount_pct: "60.00" }));
    const user = await open();
    await user.click(screen.getByRole("button", { name: "Retirer la surcharge : Discount (fib %)" }));
    expect(input("Discount (fib %)")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeEnabled();
  });
});

describe("enregistrement", () => {
  it("modale avec le diff, case a cocher obligatoire (live), envoi des seuls champs modifies", async () => {
    const saved = withOverrides(btcFixture(), { discount_pct: "60.00" });
    api.patchAsset.mockResolvedValue(saved);
    const user = await open();
    await user.type(input("Discount (fib %)"), "60");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/75 % \(config\)/)).toBeInTheDocument();
    expect(within(dialog).getByText("60 %")).toBeInTheDocument();
    const confirm = within(dialog).getByRole("button", { name: "Enregistrer" });
    expect(confirm).toBeDisabled();                                  // stratégie live -> confirmation explicite
    expect(api.patchAsset).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("checkbox"));
    await user.click(confirm);

    await waitFor(() => expect(api.patchAsset).toHaveBeenCalledTimes(1));
    expect(api.patchAsset).toHaveBeenCalledWith(BTC, { discount_pct: "60" });
    expect(await screen.findByText(/1 paramètre\(s\) enregistré\(s\)/)).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(input("Discount (fib %)")).toHaveValue("60");
    expect(api.listAssets).toHaveBeenCalledTimes(2);                  // liste rafraichie
  });

  it("actif sans stratégie live : pas de case a cocher", async () => {
    api.patchAsset.mockResolvedValue(ethFixture());
    const user = await open("ETH/USDT");
    await user.type(input("Touches minimales"), "3");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).queryByRole("checkbox")).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Enregistrer" }));
    await waitFor(() => expect(api.patchAsset).toHaveBeenCalledWith({ exchange: "binance", symbol: "ETH/USDT" }, { min_touch_count: 3 }));
  });

  it("annuler la modale n'appelle pas l'API", async () => {
    const user = await open("ETH/USDT");
    await user.type(input("Touches minimales"), "3");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Annuler" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(api.patchAsset).not.toHaveBeenCalled();
    expect(input("Touches minimales")).toHaveValue("3");              // brouillon conserve
  });

  it("Echap ferme la modale", async () => {
    const user = await open("ETH/USDT");
    await user.type(input("Touches minimales"), "3");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("erreur 400 : message sous le champ et bandeau, brouillon conserve", async () => {
    api.patchAsset.mockRejectedValue(axiosError(400, { detail: "Donnees invalides.", errors: { min_touch_count: ["Refuse par le serveur."] } }));
    const user = await open("ETH/USDT");
    await user.type(input("Touches minimales"), "3");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Enregistrer" }));
    expect(await screen.findByText("Refuse par le serveur.")).toBeInTheDocument();
    expect(screen.getByText("Valeurs refusées par le serveur.")).toBeInTheDocument();
    expect(input("Touches minimales")).toHaveValue("3");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("erreur 403 pendant l'enregistrement : message d'acces refuse", async () => {
    api.patchAsset.mockRejectedValue(axiosError(403, {}));
    const user = await open("ETH/USDT");
    await user.type(input("Touches minimales"), "3");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Enregistrer" }));
    expect(await screen.findByText(/Accès refusé/)).toBeInTheDocument();
  });

  it("retirer une surcharge envoie null", async () => {
    api.getAsset.mockResolvedValue(withOverrides(ethFixture(), { min_touch_count: 3 }));
    api.patchAsset.mockResolvedValue(ethFixture());
    const user = await open("ETH/USDT");
    await user.click(screen.getByRole("button", { name: "Retirer la surcharge : Touches minimales" }));
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Enregistrer" }));
    await waitFor(() => expect(api.patchAsset).toHaveBeenCalledWith(expect.anything(), { min_touch_count: null }));
  });
});

describe("changement d'actif", () => {
  it("modifications non enregistrees : confirmation, refus = on reste", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = await open();
    await user.type(input("Discount (fib %)"), "60");
    await user.click(screen.getByRole("button", { name: /ETH\/USDT/ }));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(api.getAsset).toHaveBeenCalledTimes(1);
    expect(input("Discount (fib %)")).toHaveValue("60");
    confirm.mockRestore();
  });

  it("modifications non enregistrees : acceptation = on change", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = await open();
    await user.type(input("Discount (fib %)"), "60");
    await user.click(screen.getByRole("button", { name: /ETH\/USDT/ }));
    expect(await screen.findByRole("heading", { level: 2, name: /ETH\/USDT/ })).toBeInTheDocument();
    expect(input("Discount (fib %)")).toHaveValue("");
    confirm.mockRestore();
  });

  it("ignore la reponse tardive d'un actif deja quitte", async () => {
    const slowBtc = deferred<ReturnType<typeof btcFixture>>();
    api.getAsset.mockImplementation((a) => (a.symbol === "BTC/USDT" ? slowBtc.promise : Promise.resolve(ethFixture())));
    const user = userEvent.setup();
    render(<ArimaParams />);
    await screen.findByRole("button", { name: /BTC\/USDT/ });
    await user.click(screen.getByRole("button", { name: /BTC\/USDT/ }));
    await user.click(screen.getByRole("button", { name: /ETH\/USDT/ }));
    await screen.findByRole("heading", { level: 2, name: /ETH\/USDT/ });
    slowBtc.resolve(btcFixture());                                    // BTC repond APRES ETH
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByRole("heading", { level: 2, name: /ETH\/USDT/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: /BTC\/USDT/ })).not.toBeInTheDocument();
  });
});

describe("reset, regeneration, historique", () => {
  it("tout remettre par defaut : desactive sans surcharge, sinon modale puis API", async () => {
    api.getAsset.mockResolvedValue(ethFixture());
    let user = await open("ETH/USDT");
    expect(screen.getByRole("button", { name: "Tout remettre par défaut" })).toBeDisabled();

    api.getAsset.mockResolvedValue(withOverrides(ethFixture(), { min_touch_count: 3 }));
    api.resetAsset.mockResolvedValue(ethFixture());
    document.body.innerHTML = "";
    user = await open("ETH/USDT");
    await user.click(screen.getByRole("button", { name: "Tout remettre par défaut" }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Retirer les surcharges" }));
    await waitFor(() => expect(api.resetAsset).toHaveBeenCalledWith({ exchange: "binance", symbol: "ETH/USDT" }, null));
    expect(await screen.findByText(/surcharges de cet actif ont été retirées/)).toBeInTheDocument();
  });

  it("zones a regenerer : bandeau + confirmation + resume", async () => {
    const needs = { ...ethFixture(), zones_need_regen: true };
    api.getAsset.mockResolvedValue(needs);
    api.regenerateZones.mockResolvedValue({
      summary: { deleted: 5, kept_referenced: 2, deactivated: 2, active_after: 7, params: needs.zone_params },
      detail: { ...needs, zones_need_regen: false },
    });
    const user = await open("ETH/USDT");
    expect(screen.getByText(/ne les reflètent pas encore/)).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Régénérer les zones" })[0]);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/conservées/)).toBeInTheDocument();
    expect(api.regenerateZones).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole("button", { name: "Régénérer" }));
    expect(await screen.findByText(/5 supprimée\(s\), 2 conservée\(s\)/)).toBeInTheDocument();
    expect(screen.queryByText(/ne les reflètent pas encore/)).not.toBeInTheDocument();
  });

  it("la regeneration est bloquee tant que des modifications ne sont pas enregistrees", async () => {
    const user = await open("ETH/USDT");
    expect(screen.getByRole("button", { name: "Régénérer les zones" })).toBeEnabled();
    await user.type(input("Touches minimales"), "3");
    expect(screen.getByRole("button", { name: "Régénérer les zones" })).toBeDisabled();
  });

  it("historique : chargement a l'ouverture, lisible", async () => {
    api.history.mockResolvedValue([
      { id: 2, changed_at: "2026-11-06T08:00:00Z", changed_by: "boss", kind: "update", changes: { discount_pct: { old: "75", new: "60" } } },
      { id: 1, changed_at: "2026-11-05T08:00:00Z", changed_by: null, kind: "regenerate_zones", changes: { _regenerate_zones: { deleted: 3, kept_referenced: 1 } } },
    ]);
    const user = await open();
    await user.click(screen.getByRole("button", { name: /Historique/ }));
    expect(await screen.findByText(/Discount \(fib %\)/, { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText(/3 supprimée\(s\), 1 conservée\(s\)/)).toBeInTheDocument();
    expect(screen.getByText(/boss/)).toBeInTheDocument();
    expect(api.history).toHaveBeenCalledWith(BTC);
  });

  it("historique : erreur affichee", async () => {
    api.history.mockRejectedValue(axiosError(500, {}));
    const user = await open();
    await user.click(screen.getByRole("button", { name: /Historique/ }));
    expect(await screen.findByText(/Erreur inattendue \(500\)/)).toBeInTheDocument();
  });
});
