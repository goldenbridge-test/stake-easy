import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { PEFUND_ABI, PEFUND_ADDRESS } from '../constants/pefund';

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
  "function symbol() public view returns (string)",
  "function balanceOf(address account) public view returns (uint256)"
];

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

      const formattedAmount = ethers.utils.parseUnits(amount, decimals);

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
      console.error("Erreur durant le dépôt:", error);
      alert("Erreur transaction (voir console)");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Withdraw: "I want exactly X stablecoins back, burn whatever shares needed"
  const withdrawFromFund = async (amount: string) => {
    if (!provider || !account) return false;
    setLoading(true);
    try {
      const signer = provider.getSigner();
      const pefundContract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, signer);

      const assetAddress = await pefundContract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, signer);
      const decimals = await assetContract.decimals();

      const formattedAmount = ethers.utils.parseUnits(amount, decimals);

      // Pre-check before opening MetaMask (withdrawals are not blocked by pause in the contract)
      const maxWithdraw = await pefundContract.maxWithdraw(account);
      if (formattedAmount.gt(maxWithdraw)) {
        const symbol = await assetContract.symbol();
        alert(`Montant trop élevé : vous pouvez retirer au maximum ${ethers.utils.formatUnits(maxWithdraw, decimals)} ${symbol}.`);
        return false;
      }

      // withdraw(assets, receiver, owner) — one single transaction, no approve needed
      const tx = await pefundContract.withdraw(formattedAmount, account, account);
      await tx.wait();

    alert("Retrait Réussi!");
      return true;
    } catch (error) {
      console.error("Erreur durant le retrait :", error);
      alert("Erreur transaction (voir console)");
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
      const signer = provider.getSigner();
      const pefundContract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, signer);
      const decimals = await pefundContract.decimals();

      const formattedShares = ethers.utils.parseUnits(shares, decimals);

      // Pre-check before opening MetaMask (withdrawals are not blocked by pause in the contract)
      const maxRedeem = await pefundContract.maxRedeem(account);
      if (formattedShares.gt(maxRedeem)) {
        alert(`Nombre de parts trop élevé : vous pouvez racheter au maximum ${ethers.utils.formatUnits(maxRedeem, decimals)} parts.`);
        return false;
      }

      // redeem(shares, receiver, owner) — one single transaction, no approve needed
      const tx = await pefundContract.redeem(formattedShares, account, account);
      await tx.wait();

    alert("Rachat réussi !");
      return true;
    } catch (error) {
      console.error("Erreur durant le Rachat:", error);
      alert("Erreur transaction (voir console)");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Preview functions — no gas, just simulations for the UI
  const getPreviewDeposit = async (amount: string): Promise<string> => {
    if (!provider) return "0";
    try {
      const pefundContract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, provider);

      const assetAddress = await pefundContract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, provider);
      const decimals = await assetContract.decimals();

      const formattedAmount = ethers.utils.parseUnits(amount, decimals);
      const shares = await pefundContract.previewDeposit(formattedAmount);
      const shareDecimals = await pefundContract.decimals();
      return ethers.utils.formatUnits(shares, shareDecimals);
    } catch (error) {
      console.error("Error previewDeposit:", error);
      return "0";
    }
  };

  const getPreviewRedeem = async (shares: string): Promise<string> => {
    if (!provider) return "0";
    try {
      const pefundContract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, provider);
      const shareDecimals = await pefundContract.decimals();
      const formattedShares = ethers.utils.parseUnits(shares, shareDecimals);

      const assets = await pefundContract.previewRedeem(formattedShares);

      const assetAddress = await pefundContract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, provider);
      const assetDecimals = await assetContract.decimals();
      return ethers.utils.formatUnits(assets, assetDecimals);
    } catch (error) {
      console.error("Error previewRedeem:", error);
      return "0";
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
    getPreviewRedeem,
    getAssetBalance,
    getFundInfo,
    getAssetSymbol,
  };
};