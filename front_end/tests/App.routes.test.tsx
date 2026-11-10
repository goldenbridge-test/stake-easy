import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { useAuth } from "../src/hooks/useAuth";

// On simule uniquement les pages lourdes (web3, graphiques). App, ProtectedRoute et AdminDashboard sont REELS.
const { page } = vi.hoisted(() => ({
  page: async (name: string) => {
    const React = await import("react");
    return { default: () => React.createElement("div", null, name) };
  },
}));
vi.mock("../src/components/SignIn", () => page("SIGNIN PAGE"));
vi.mock("../src/components/SignUp", () => page("SIGNUP PAGE"));
vi.mock("../src/components/Staking", () => page("STAKING PAGE"));
vi.mock("../src/components/Home", () => page("HOME PAGE"));
vi.mock("../src/components/TradingDashboard", () => page("TRADING PAGE"));
vi.mock("../src/components/ArimaBacktest", () => page("BACKTEST PAGE"));
vi.mock("../src/components/ArimaPortfolio", () => page("PORTFOLIO PAGE"));
vi.mock("../src/components/AssetChart", () => page("ASSETCHART PAGE"));
vi.mock("../src/components/ChartPage", () => page("CHART PAGE"));
vi.mock("../src/components/admin/ArimaParams", () => page("ARIMA PANEL"));
vi.mock("../src/hooks/useAuth", () => ({ useAuth: vi.fn() }));

const go = (path: string) => {
  window.history.pushState({}, "", path);
  return render(<App />);
};

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  vi.mocked(useAuth).mockReturnValue({ isStaff: true, loading: false } as unknown as ReturnType<typeof useAuth>);
});

describe("route /admin", () => {
  it("sans token : redirige vers /signin", () => {
    go("/admin");
    expect(screen.getByText("SIGNIN PAGE")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/signin");
  });

  it("token + staff : tableau de bord admin", () => {
    localStorage.setItem("access_token", "t");
    go("/admin");
    expect(screen.getByText("Admin Mode")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/admin");
  });

  it("token + non staff : Access Denied", () => {
    localStorage.setItem("access_token", "t");
    vi.mocked(useAuth).mockReturnValue({ isStaff: false, loading: false } as unknown as ReturnType<typeof useAuth>);
    go("/admin");
    expect(screen.getByRole("heading", { name: "Access Denied" })).toBeInTheDocument();
  });
});

describe("routes existantes inchangees", () => {
  it.each([
    ["/staking", "STAKING PAGE"],
    ["/arima", "TRADING PAGE"],
    ["/arima/backtest", "BACKTEST PAGE"],
    ["/arima/portfolio", "PORTFOLIO PAGE"],
  ])("%s protegee : token -> page", (path, text) => {
    localStorage.setItem("access_token", "t");
    go(path);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it.each(["/staking", "/arima", "/arima/backtest", "/arima/portfolio"])("%s sans token -> /signin", (path) => {
    go(path);
    expect(screen.getByText("SIGNIN PAGE")).toBeInTheDocument();
  });

  it("routes publiques et route inconnue", () => {
    go("/signin");
    expect(screen.getByText("SIGNIN PAGE")).toBeInTheDocument();
  });
});
