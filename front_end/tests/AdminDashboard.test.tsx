import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminDashboard from "../src/components/AdminDashboard";
import { useAuth } from "../src/hooks/useAuth";

vi.mock("../src/hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../src/components/admin/ArimaParams", () => ({ default: () => <div>ARIMA PANEL</div> }));
const mockedAuth = vi.mocked(useAuth);

const auth = (isStaff: boolean, loading = false) =>
  mockedAuth.mockReturnValue({ isStaff, loading } as unknown as ReturnType<typeof useAuth>);
const renderDashboard = () => render(<MemoryRouter><AdminDashboard /></MemoryRouter>);

beforeEach(() => vi.resetAllMocks());
afterEach(() => vi.unstubAllEnvs());

describe("controle d'acces", () => {
  it("pendant la verification : pas de 'Access Denied'", () => {
    auth(false, true);
    renderDashboard();
    expect(screen.getByText("Vérification des droits…")).toBeInTheDocument();
    expect(screen.queryByText("Access Denied")).not.toBeInTheDocument();
  });

  it("non staff : Access Denied, aucun contenu admin", () => {
    auth(false);
    renderDashboard();
    expect(screen.getByRole("heading", { name: "Access Denied" })).toBeInTheDocument();
    expect(screen.queryByText(/Manage Tokens/)).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /Arima/ })).not.toBeInTheDocument();
  });

  it("bouton [DEV] : present en build de dev, conserve son comportement", async () => {
    auth(false);
    renderDashboard();
    await userEvent.setup().click(screen.getByRole("button", { name: "[DEV] Simulate Admin Login" }));
    expect(screen.getByText("Admin Mode")).toBeInTheDocument();
  });

  it("bouton [DEV] : absent en production", () => {
    vi.stubEnv("DEV", false);
    auth(false);
    renderDashboard();
    expect(screen.getByRole("heading", { name: "Access Denied" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Simulate Admin Login/ })).not.toBeInTheDocument();
  });

  it("staff : acces direct au tableau de bord", () => {
    auth(true);
    renderDashboard();
    expect(screen.getByText("Admin Mode")).toBeInTheDocument();
    expect(screen.queryByText("Access Denied")).not.toBeInTheDocument();
  });
});

describe("onglets", () => {
  it("Staking par defaut : tout le contenu d'origine est conserve", () => {
    auth(true);
    renderDashboard();
    expect(screen.getByRole("tab", { name: /Staking/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/Manage Tokens/)).toBeInTheDocument();
    expect(screen.getByText(/Reward Distribution/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Distribute All/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Issue Reward/ })).toBeInTheDocument();
    expect(screen.getAllByText(/DAPP/).length).toBeGreaterThan(0);
    expect(screen.queryByText("ARIMA PANEL")).not.toBeInTheDocument();
  });

  it("onglet Arima : affiche le panneau, masque le staking, et inversement", async () => {
    auth(true);
    renderDashboard();
    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: /Arima/ }));
    expect(screen.getByText("ARIMA PANEL")).toBeInTheDocument();
    expect(screen.queryByText(/Manage Tokens/)).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Arima/ })).toHaveAttribute("aria-selected", "true");

    await user.click(screen.getByRole("tab", { name: /Staking/ }));
    expect(screen.getByText(/Manage Tokens/)).toBeInTheDocument();
    expect(screen.queryByText("ARIMA PANEL")).not.toBeInTheDocument();
  });

  it("le panneau Arima n'est jamais monte pour un non-staff", async () => {
    auth(false);
    renderDashboard();
    expect(screen.queryByText("ARIMA PANEL")).not.toBeInTheDocument();
  });

  it("fonctionnalite staking existante : Distribute All demande confirmation", async () => {
    auth(true);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderDashboard();
    await userEvent.setup().click(screen.getByRole("button", { name: /Distribute All/ }));
    expect(confirm).toHaveBeenCalledTimes(1);
    confirm.mockRestore();
  });
});
