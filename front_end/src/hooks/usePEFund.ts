import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { PEFUND_ABI, PEFUND_ADDRESS } from '../constants/pefund';

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
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
      const decimals = await contract.decimals();
      return ethers.utils.formatUnits(total, decimals);
    } catch (error) {
      console.error('Erreur getTotalAssets:', error);
      return "0";
    }
  };

  const depositToFund = async (amount: string) => {
    if (!provider || !account) return;
    setLoading(true);
    try {
      const signer = provider.getSigner();
      const pefundContract = new ethers.Contract(PEFUND_ADDRESS, PEFUND_ABI, signer);

      const assetAddress = await pefundContract.asset();
      const assetContract = new ethers.Contract(assetAddress, ERC20_ABI, signer);
      const decimals = await assetContract.decimals();

      const formattedAmount = ethers.utils.parseUnits(amount, decimals);

      const txApprove = await assetContract.approve(PEFUND_ADDRESS, formattedAmount);
      await txApprove.wait();

      const txDeposit = await pefundContract.deposit(formattedAmount, account);
      await txDeposit.wait();

      alert("Dépôt réussi !");
    } catch (error) {
      console.error("Erreur durant le dépôt:", error);
      alert("Erreur transaction (voir console)");
    } finally {
      setLoading(false);
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
  };
};