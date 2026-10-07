import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { PEFUND_ABI, PEFUND_ADDRESS } from '../constants/pefund';

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
  "function symbol() public view returns (string)",
  "function balanceOf(address account) public view returns (uint256)"
];

const BASIS_POINT_SCALE = 10000;

// Mirrors GoldenPEFund._feeOnRaw (rounded up): the vault sends out assets + this fee on every withdrawal
const grossWithExitFee = (assets: BigNumber, exitFeeBp: BigNumber): BigNumber =>
  assets.add(assets.mul(exitFeeBp).add(BASIS_POINT_SCALE - 1).div(BASIS_POINT_SCALE));

export type AmountValidation =
  | { ok: true; value: BigNumber }
  | { ok: false; error: string };

// Validates a user-typed amount against the token's real decimals BEFORE parseUnits,
// which would otherwise throw NUMERIC_FAULT on too many decimals.
// Rejects empty, NaN, negative, zero and too many decimals; returns a French message for the UI.
export const validateAmount = (input: string, decimals: number): AmountValidation => {
  const value = input.trim();
  // Plain decimal notation only (also rejects "-1", "1e3", "abc")
  if (!/^\d*\.?\d*$/.test(value) || value === '' || value === '.') {
    return { ok: false, error: 'Montant invalide : saisissez un nombre positif' };
  }
  // Trailing zeros do not count ("1.1000000" is fine for 6 decimals). They are also stripped
  // before parseUnits: ethers 5.2.0 accepts them but mis-parses ("1.1000000", 6) as 2.0.
  const [whole, rawFraction = ''] = value.split('.');
  const fraction = rawFraction.replace(/0+$/, '');
  if (fraction.length > decimals) {
    return { ok: false, error: `Montant invalide : ${decimals} décimales maximum` };
  }
  let parsed: BigNumber;
  try {
    parsed = ethers.utils.parseUnits(fraction ? `${whole || '0'}.${fraction}` : whole || '0', decimals);
  } catch {
    return { ok: false, error: 'Montant invalide : saisissez un nombre positif' };
  }
  if (parsed.isZero()) {
    return { ok: false, error: 'Montant invalide : le montant doit être supérieur à zéro' };
  }
  return { ok: true, value: parsed };
};

export const usePEFund = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(web3Provider);
          setAccount(accounts[0]);
        }
      }
    };
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const switchToSepolia = async (): Promise<boolean> => {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              rpcUrls: ['https://rpc.sepolia.org'],
              nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  };

  const connectWallet = async () => {
    const switched = await switchToSepolia();
    if (!switched) {
      alert("Veuillez vous connecter au réseau Sepolia");
      return false;
    }
    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();
      setProvider(web3Provider);
      setAccount(address);
      return true;
    } catch (error) {
      console.error("Erreur connexion:", error);
      return false;
    }
  };

  const getShareBalance = async (account: string): Promise<string> => {
    if (!provider) return "0";
    try {
      const contract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, provider);
      const balance = await contract.balanceOf(account);
      const decimals = await contract.decimals();
      return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Erreur getShareBalance:', error);
      return "0";
    }
  };

  const getTotalAssets = async (): Promise<string> => {
    if (!provider) return "0";
    try {
      const contract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, provider);
      const total = await contract.totalAssets();
      // totalAssets is denominated in the underlying asset, not in shares
      const assetAddress = await contract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, provider);
      const decimals = await assetContract.decimals();
      return ethers.utils.formatUnits(total, decimals);
    } catch (error) {
      console.error('Erreur getTotalAssets:', error);
      return "0";
    }
  };

  const depositToFund = async (amount: string) => {
    if (!provider || !account) return false;
    setLoading(true);
    try {
      const signer = provider.getSigner();
      const pefundContract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, signer);

      const assetAddress = await pefundContract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, signer);
      const decimals = await assetContract.decimals();

      const validation = validateAmount(amount, decimals);
      if (!validation.ok) {
        alert(validation.error);
        return false;
      }
      const formattedAmount = validation.value;

      // Pre-checks before opening MetaMask: deposits revert when paused or above the limit
      if (await pefundContract.paused()) {
        alert("Le fonds est actuellement en pause : les dépôts sont temporairement suspendus.");
        return false;
      }
      const maxDeposit = await pefundContract.maxDeposit(account);
      if (formattedAmount.gt(maxDeposit)) {
        const symbol = await assetContract.symbol();
        alert(`Montant trop élevé : vous pouvez déposer au maximum ${ethers.utils.formatUnits(maxDeposit, decimals)} ${symbol} (limite de dépôt du fonds).`);
        return false;
      }

      const txApprove = await assetContract.approve(PEFUND_ADDRESS, formattedAmount);
      await txApprove.wait();

      const txDeposit = await pefundContract.deposit(formattedAmount, account);
      await txDeposit.wait();

      alert("Dépôt réussi !");
      return true;
    } catch (error) {
      console.error("Error during deposit:", error);
      alert("Échec du dépôt (voir la console).");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reads everything needed to validate a withdrawal, as raw on-chain integers.
  // Asset (stablecoin) and share (GPEF) decimals are read separately: they can differ.
  const getWithdrawContext = async (owner: string) => {
    if (!provider) throw new Error("No provider");
    const pefundContract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, provider);
    const assetAddress = await pefundContract.asset();
    const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, provider);
    const [assetDecimals, shareDecimals, symbol, shareBalance, exitFeeBp, vaultLiquidity] = await Promise.all([
      assetContract.decimals(),
      pefundContract.decimals(),
      assetContract.symbol(),
      pefundContract.balanceOf(owner),
      pefundContract.exitFeeBasisPoints(),
      // Stablecoins physically held by the vault; funds sent to the strategy are not in here
      assetContract.balanceOf(PEFUND_ADDRESS),
    ]);
    // maxWithdraw() (inherited from OpenZeppelin) ignores the exit fee, so withdrawing that amount
    // would need more shares than the user owns and revert. previewRedeem(full share balance) is
    // the net amount the user can really receive once the exit fee is deducted.
    const maxAssets: BigNumber = await pefundContract.previewRedeem(shareBalance);
    return { pefundContract, assetDecimals, shareDecimals, symbol, shareBalance, exitFeeBp, vaultLiquidity, maxAssets };
  };

  // Max withdrawable for the "Max" buttons: net stablecoin amount (amount mode) and full share balance (shares mode)
  const getMaxWithdrawable = async (owner: string): Promise<{ assets: string; shares: string } | null> => {
    try {
      const ctx = await getWithdrawContext(owner);
      return {
        assets: ethers.utils.formatUnits(ctx.maxAssets, ctx.assetDecimals),
        shares: ethers.utils.formatUnits(ctx.shareBalance, ctx.shareDecimals),
      };
    } catch (error) {
      console.error('Error getMaxWithdrawable:', error);
      return null;
    }
  };

  // Rejects the withdrawal before MetaMask opens if the vault does not hold enough stablecoins.
  // The vault pays out assets + exit fee from its own balance, so that gross amount is what must be available.
  const checkVaultLiquidity = (netAssets: BigNumber, ctx: Awaited<ReturnType<typeof getWithdrawContext>>): boolean => {
    const gross = grossWithExitFee(netAssets, ctx.exitFeeBp);
    if (gross.lte(ctx.vaultLiquidity)) return true;
    alert(
      `Liquidité insuffisante : le fonds ne dispose actuellement que de ${ethers.utils.formatUnits(ctx.vaultLiquidity, ctx.assetDecimals)} ${ctx.symbol} disponibles ` +
      `(une partie des actifs est investie dans la stratégie). Ce retrait nécessite ${ethers.utils.formatUnits(gross, ctx.assetDecimals)} ${ctx.symbol} frais de sortie inclus. ` +
      `Réessayez plus tard ou retirez un montant plus faible.`
    );
    return false;
  };

  // Withdraw: "I want exactly X stablecoins back, burn whatever shares needed"
  const withdrawFromFund = async (amount: string) => {
    if (!provider || !account) return false;
    setLoading(true);
    try {
      const ctx = await getWithdrawContext(account);

      const validation = validateAmount(amount, ctx.assetDecimals);
      if (!validation.ok) {
        alert(validation.error);
        return false;
      }
      const formattedAmount = validation.value;

      // Pre-checks before opening MetaMask (withdrawals are not blocked by pause in the contract)
      if (formattedAmount.gt(ctx.maxAssets)) {
        alert(`Montant trop élevé : vous pouvez retirer au maximum ${ethers.utils.formatUnits(ctx.maxAssets, ctx.assetDecimals)} ${ctx.symbol} (frais de sortie déduits).`);
        return false;
      }
      if (!checkVaultLiquidity(formattedAmount, ctx)) return false;

      // withdraw(assets, receiver, owner) — one single transaction, no approve needed
      const pefundWithSigner = ctx.pefundContract.connect(provider.getSigner());
      const tx = await pefundWithSigner.withdraw(formattedAmount, account, account);
      await tx.wait();

      alert("Retrait par montant réussi !");
      return true;
    } catch (error) {
      console.error("Error during withdraw:", error);
      alert("Échec du retrait par montant (voir la console).");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Redeem: "I want to burn exactly X shares, give me whatever stablecoins they're worth"
  const redeemShares = async (shares: string) => {
    if (!provider || !account) return false;
    setLoading(true);
    try {
      const ctx = await getWithdrawContext(account);

      const validation = validateAmount(shares, ctx.shareDecimals);
      if (!validation.ok) {
        alert(validation.error);
        return false;
      }
      const formattedShares = validation.value;

      // Pre-checks before opening MetaMask (maxRedeem is the full share balance in OpenZeppelin 4.9)
      if (formattedShares.gt(ctx.shareBalance)) {
        alert(`Nombre de parts trop élevé : vous pouvez retirer au maximum ${ethers.utils.formatUnits(ctx.shareBalance, ctx.shareDecimals)} parts GPEF.`);
        return false;
      }
      const netAssets: BigNumber = await ctx.pefundContract.previewRedeem(formattedShares);
      if (!checkVaultLiquidity(netAssets, ctx)) return false;

      // redeem(shares, receiver, owner) — one single transaction, no approve needed
      const pefundWithSigner = ctx.pefundContract.connect(provider.getSigner());
      const tx = await pefundWithSigner.redeem(formattedShares, account, account);
      await tx.wait();

      alert("Retrait par parts réussi !");
      return true;
    } catch (error) {
      console.error("Error during redeem:", error);
      alert("Échec du retrait par parts (voir la console).");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Preview functions — no gas, just simulations for the UI.
  // They return null for an invalid amount or a failed read, so the UI never shows a fake "0,00".
  const getPreviewDeposit = async (amount: string): Promise<string | null> => {
    if (!provider) return null;
    try {
      const pefundContract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, provider);

      const assetAddress = await pefundContract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, provider);
      const decimals = await assetContract.decimals();

      const validation = validateAmount(amount, decimals);
      if (!validation.ok) return null;
      const shares = await pefundContract.previewDeposit(validation.value);
      const shareDecimals = await pefundContract.decimals();
      return ethers.utils.formatUnits(shares, shareDecimals);
    } catch (error) {
      console.error("Error previewDeposit:", error);
      return null;
    }
  };

  // Shares that withdraw(amount) would burn, exit fee included (previewWithdraw adds it on top)
  const getPreviewWithdraw = async (amount: string): Promise<string | null> => {
    if (!provider) return null;
    try {
      const pefundContract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, provider);
      const assetAddress = await pefundContract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, provider);
      const assetDecimals = await assetContract.decimals();
      const validation = validateAmount(amount, assetDecimals);
      if (!validation.ok) return null;

      const shares = await pefundContract.previewWithdraw(validation.value);
      const shareDecimals = await pefundContract.decimals();
      return ethers.utils.formatUnits(shares, shareDecimals);
    } catch (error) {
      console.error("Error previewWithdraw:", error);
      return null;
    }
  };

  const getPreviewRedeem = async (shares: string): Promise<string | null> => {
    if (!provider) return null;
    try {
      const pefundContract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, provider);
      const shareDecimals = await pefundContract.decimals();
      const validation = validateAmount(shares, shareDecimals);
      if (!validation.ok) return null;

      const assets = await pefundContract.previewRedeem(validation.value);

      const assetAddress = await pefundContract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, provider);
      const assetDecimals = await assetContract.decimals();
      return ethers.utils.formatUnits(assets, assetDecimals);
    } catch (error) {
      console.error("Error previewRedeem:", error);
      return null;
    }
  };

   // Get user's stablecoin balance (how much they can deposit)
  const getAssetBalance = async (account: string): Promise<string> => {
    if (!provider) return "0";
    try {
      const pefundContract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, provider);
      const assetAddress = await pefundContract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, provider);
      const balance = await assetContract.balanceOf(account);
      const decimals = await assetContract.decimals();
      return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Error getAssetBalance:', error);
      return "0";
    }
  };

  // Get fund info (fees, manager, limits)
  const getFundInfo = async () => {
    if (!provider) return null;
    try {
      const contract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, provider);
      const [entryFee, exitFee, perfFee, manager, maxDeposit, isPaused, name, symbol] = await Promise.all([
        contract.entryFeeBasisPoints(),
        contract.exitFeeBasisPoints(),
        contract.performanceFeeBasisPoints(),
        contract.fundManager(),
        contract.maxDepositLimit(),
        contract.paused(),
        contract.name(),
        contract.symbol(),
      ]);
      // maxDepositLimit is denominated in the underlying asset, not in shares
      const assetAddress = await contract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, provider);
      const decimals = await assetContract.decimals();
      return {
        entryFee: entryFee.toNumber() / 100,     // basis points → percentage
        exitFee: exitFee.toNumber() / 100,
        performanceFee: perfFee.toNumber() / 100,
        fundManager: manager,
        maxDeposit: ethers.utils.formatUnits(maxDeposit, decimals),
        isPaused,
        name,
        symbol,
      };
    } catch (error) {
      console.error('Error getFundInfo:', error);
      return null;
    }
  };

  // Real decimals of the stablecoin and of the GPEF share, for validating input as the user types
  const getTokenDecimals = async (): Promise<{ asset: number; shares: number } | null> => {
    if (!provider) return null;
    try {
      const pefundContract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, provider);
      const assetAddress = await pefundContract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, provider);
      const [asset, shares] = await Promise.all([assetContract.decimals(), pefundContract.decimals()]);
      return { asset, shares };
    } catch (error) {
      console.error('Error getTokenDecimals:', error);
      return null;
    }
  };

  // Get the underlying stablecoin's symbol (e.g. "USDC") for display
  const getAssetSymbol = async (): Promise<string> => {
    if (!provider) return "";
    try {
      const pefundContract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, provider);
      const assetAddress = await pefundContract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, provider);
      return await assetContract.symbol();
    } catch (error) {
      console.error('Error getAssetSymbol:', error);
      return "";
    }
  };

return {
    account,
    provider,
    loading,
    connectWallet,
    getShareBalance,
    getTotalAssets,
    depositToFund,
    withdrawFromFund,
    redeemShares,
    getPreviewDeposit,
    getPreviewWithdraw,
    getPreviewRedeem,
    getMaxWithdrawable,
    getAssetBalance,
    getFundInfo,
    getAssetSymbol,
    getTokenDecimals,
  };
};