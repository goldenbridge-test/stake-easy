import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Staking from "../src/components/Staking";

// useWeb3 simule : wallet connecte avec 12.5 DAPP (les vraies balances viennent de la chaine via getTokenBalance).
vi.mock("../src/hooks/useWeb3", () => ({
  useWeb3: () => ({
    connectWallet: vi.fn(),
    stakeTokens: vi.fn(),
    getTokenBalance: vi.fn().mockResolvedValue("12.5"),
    account: "0xabcdef1234567890abcdef1234567890abcd1234",
    isConnected: true,
  }),
}));

async function openAndSelectToken() {
  const user = userEvent.setup();
  render(<MemoryRouter><Staking /></MemoryRouter>);
  await user.click(await screen.findByRole("button", { name: /Balance:/ }));          // ouvre la liste des jetons
  const option = (await screen.findByText(/available/)).closest("div[class*='cursor-pointer']") as HTMLElement;
  return { user, option };
}

describe("Staking : balances reelles (et non les anciennes valeurs `balance` / `price` inexistantes)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("la liste des jetons affiche la vraie balance on-chain", async () => {
    await openAndSelectToken();
    expect(screen.getByText("12.5 available")).toBeInTheDocument();
  });

  it("MAX remplit le montant avec la balance du jeton selectionne (ne leve plus de TypeError)", async () => {
    const { user, option } = await openAndSelectToken();
    await user.click(option);
    await user.click(screen.getByRole("button", { name: "MAX" }));
    expect(screen.getByPlaceholderText("0.00")).toHaveValue(12.5);   // input type=number -> valeur numerique
  });

  it("l'estimation USD n'affiche plus NaN quand aucun prix n'est disponible", async () => {
    const { user, option } = await openAndSelectToken();
    await user.click(option);
    await user.type(screen.getByPlaceholderText("0.00"), "3");
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    expect(screen.getByText(/≈ \$0\.00 USD/)).toBeInTheDocument();
  });
});
