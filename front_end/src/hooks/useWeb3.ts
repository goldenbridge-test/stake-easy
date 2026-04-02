import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import networkMap from '../chain-info/map.json';
import { walletApi, networksApi } from '../services/blockchainApi';

// Lit dynamiquement la dernière paire TokenFarm/GoldenToken depuis map.json
function getContractAddresses(chainId: number): { tokenFarm: string; goldenToken: string } {
  const chainData = (networkMap as any)[String(chainId)];
  const farms: string[] = chainData?.TokenFarm || [];
  const tokens: string[] = chainData?.GoldenToken || [];
  return {
    tokenFarm: farms[0] || '0x328011A76260088494119a77940DD0C6E4DCdFfD',
    goldenToken: tokens[0] || '0xD6592daDd49Dd401CD5dF8CC54dFe98cDB922E71',
  };
}

// Fallback Sepolia (chainId 11155111) — mis à jour automatiquement au runtime
const SEPOLIA_CHAIN_ID = 11155111;
const { tokenFarm: TOKEN_FARM_ADDRESS, goldenToken: DEFAULT_TOKEN_ADDRESS } =
  getContractAddresses(SEPOLIA_CHAIN_ID);

// ABI standard ERC20 (pour lire balances, faire des approve, etc.)
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
  "function decimals() public view returns (uint8)",
  "function symbol() public view returns (string)",
  "function name() public view returns (string)"
];

// ABI exacte du contrat TokenFarm.sol (correspondance 1:1 avec le Solidity)
const TOKEN_FARM_ABI = [
  // --- Fonctions d'écriture (transactions) ---
  "function stakeTokens(uint256 _amount, address token) public",
  "function unstakeTokens(address token) public",
  "function addAllowedTokens(address token) public",
  "function setPriceFeedContract(address token, address priceFeed) public",
  "function removeAllowedToken(address token) public",
  "function issueTokens() public",

  // --- Fonctions de lecture (gratuit, pas de gas) ---
  "function owner() public view returns (address)",
  "function stakingBalance(address token, address user) public view returns (uint256)",
  "function tokenIsAllowed(address token) public view returns (bool)",
  "function allowedTokens(uint256 index) public view returns (address)",
  "function getUserTotalValue(address user) public view returns (uint256)",
  "function getUserTokenStakingBalanceEthValue(address user, address token) public view returns (uint256)",
  "function getTokenEthPrice(address token) public view returns (uint256, uint8)",
  "function uniqueTokensStaked(address user) public view returns (uint256)",
  "function goldenToken() public view returns (address)",
  "function name() public view returns (string)",
  "function tokenPriceFeedMapping(address token) public view returns (address)",

  // --- Événements (logs enregistrés sur la blockchain) ---
  "event TokenStaked(address indexed user, address indexed token, uint256 amount)",
  "event TokenUnstaked(address indexed user, address indexed token, uint256 amount)",
  "event AllowedTokenRemoved(address token)"
];

export const useWeb3 = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [loading, setLoading] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

  // Auto-connexion au chargement si MetaMask est déjà connecté
  useEffect(() => {
    const init = async () => {
      const { ethereum } = window as any;
      if (!ethereum) return;

      try {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const web3Provider = new ethers.providers.Web3Provider(ethereum);
          const network = await web3Provider.getNetwork();
          setProvider(web3Provider);
          setAccount(accounts[0]);
          setChainId(network.chainId);
        }
      } catch (error) {
        console.error("Erreur initialisation wallet:", error);
      }

      // Écouter les changements de compte ou de réseau
      ethereum.on('accountsChanged', async (newAccounts: string[]) => {
        if (newAccounts.length > 0) {
          const web3Provider = new ethers.providers.Web3Provider(ethereum);
          const network = await web3Provider.getNetwork();
          setAccount(newAccounts[0]);
          setProvider(web3Provider);
          setChainId(network.chainId);
        } else {
          setAccount(null);
          setProvider(null);
          setChainId(null);
        }
      });

      ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    };

    init();
  }, []);

  // Basculer MetaMask sur le réseau Sepolia
  const switchToSepolia = async () => {
    const { ethereum } = window as any;
    if (!ethereum) return false;

    const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Testnet',
              nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          });
          return true;
        } catch (addError) {
          console.error("Erreur ajout réseau Sepolia:", addError);
          return false;
        }
      }
      console.error("Erreur changement réseau:", switchError);
      return false;
    }
  };

  // Connecter MetaMask (demande l'autorisation à l'utilisateur)
  const connectWallet = async () => {
    const { ethereum } = window as any;
    if (!ethereum) {
      alert("Installez MetaMask !");
      return false;
    }

    try {
      const isOnSepolia = await switchToSepolia();
      if (!isOnSepolia) {
        alert("Veuillez vous connecter au réseau Sepolia");
        return false;
      }

      const web3Provider = new ethers.providers.Web3Provider(ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();

      const network = await web3Provider.getNetwork();
      setChainId(network.chainId);
      setProvider(web3Provider);
      setAccount(address);

      // Enregistrer le wallet dans Django (silencieux si non connecté ou déjà enregistré)
      try {
        const networksData = await networksApi.list();
        const networksList = networksData.results || networksData || [];
        const djangoNetwork = networksList.find((n: any) => n.chain_id === network.chainId);
        if (djangoNetwork) {
          await walletApi.register({
            address,
            chain_id: String(network.chainId),
            network: djangoNetwork.id,
            asset: 'ETH',
          });
          console.log("Wallet enregistré dans Django :", address);
        }
      } catch {
        // Silencieux : wallet déjà enregistré ou utilisateur non connecté à Django
      }

      return true;
    } catch (error) {
      console.error("Erreur connexion:", error);
      return false;
    }
  };

  // ==========================================
  // FONCTIONS STAKING (utilisateur)
  // ==========================================

  // Staker des tokens : approve puis stakeTokens
  const stakeTokens = async (amount: string, tokenAddress?: string): Promise<{ success: boolean; txHash?: string }> => {
    if (!provider || !account) return { success: false };
    setLoading(true);

    const targetToken = tokenAddress || DEFAULT_TOKEN_ADDRESS;

    try {
      const signer = provider.getSigner();
      const formattedAmount = ethers.utils.parseEther(amount);

      const tokenContract = new ethers.Contract(targetToken, ERC20_ABI, signer);
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);

      console.log("Étape 1 : Approbation en cours pour", targetToken);
      const txApprove = await tokenContract.approve(TOKEN_FARM_ADDRESS, formattedAmount);
      await txApprove.wait();
      console.log("Approbation réussie !");

      console.log("Étape 2 : Staking en cours...");
      const txStake = await farmContract.stakeTokens(formattedAmount, targetToken);
      await txStake.wait();

      console.log("Staking réussi !", txStake.hash);
      return { success: true, txHash: txStake.hash };
    } catch (error: any) {
      console.error("Erreur durant le staking:", error);
      const reason = error?.reason || error?.message || "Erreur inconnue";
      alert(`Erreur staking: ${reason}`);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Unstaker : retire TOUS les tokens stakés pour un token donné
  const unstakeTokens = async (tokenAddress?: string): Promise<{ success: boolean; txHash?: string }> => {
    if (!provider || !account) return { success: false };
    setLoading(true);

    const targetToken = tokenAddress || DEFAULT_TOKEN_ADDRESS;

    try {
      const signer = provider.getSigner();
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);

      console.log("Unstaking en cours pour", targetToken);
      const tx = await farmContract.unstakeTokens(targetToken);
      await tx.wait();

      console.log("Unstake réussi !", tx.hash);
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error("Erreur unstake:", error);
      const reason = error?.reason || error?.message || "Erreur inconnue";
      alert(`Erreur unstake: ${reason}`);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FONCTIONS DE LECTURE (pas de gas, gratuit)
  // ==========================================

  // Lire le solde d'un token ERC20 dans le wallet
  const getTokenBalance = async (tokenAddress: string): Promise<string> => {
    if (!provider || !account) return '0';

    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await tokenContract.balanceOf(account);

      let decimals = 18;
      try {
        decimals = await tokenContract.decimals();
      } catch {
        console.warn(`decimals() non disponible pour ${tokenAddress}, fallback à 18`);
      }

      return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
      console.error(`Erreur lecture balance pour ${tokenAddress}:`, error);
      return '0';
    }
  };

  // Lire le solde staké d'un utilisateur dans le TokenFarm
  const getStakingBalance = async (tokenAddress?: string): Promise<string> => {
    if (!provider || !account) return '0';

    const targetToken = tokenAddress || DEFAULT_TOKEN_ADDRESS;

    try {
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, provider);
      const balance = await farmContract.stakingBalance(targetToken, account);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error("Erreur lecture staking balance:", error);
      return '0';
    }
  };

  // Lire la valeur totale stakée d'un utilisateur (en ETH, via les price feeds)
  const getUserTotalValue = async (userAddress?: string): Promise<string> => {
    if (!provider) return '0';

    const user = userAddress || account;
    if (!user) return '0';

    try {
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, provider);
      const totalValue = await farmContract.getUserTotalValue(user);
      return ethers.utils.formatEther(totalValue);
    } catch (error) {
      console.error("Erreur lecture valeur totale:", error);
      return '0';
    }
  };

  // Vérifier si un token est autorisé dans le TokenFarm
  const checkTokenIsAllowed = async (tokenAddress: string): Promise<boolean> => {
    if (!provider) return false;

    try {
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, provider);
      return await farmContract.tokenIsAllowed(tokenAddress);
    } catch (error) {
      console.error("Erreur vérification token autorisé:", error);
      return false;
    }
  };

  // Lire tous les tokens autorisés depuis le contrat (tableau public allowedTokens[])
  const getAllowedTokens = async (): Promise<Array<{ address: string; symbol: string; name: string; priceFeed: string }>> => {
    if (!provider) return [];

    try {
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS!, TOKEN_FARM_ABI, provider);
      const result: Array<{ address: string; symbol: string; name: string; priceFeed: string }> = [];
      let index = 0;

      while (true) {
        try {
          const address: string = await farmContract.allowedTokens(index);
          if (!address || address === ethers.constants.AddressZero) break;
          const tokenContract = new ethers.Contract(address, ERC20_ABI, provider);
          const [symbol, name, priceFeed] = await Promise.all([
            tokenContract.symbol().catch(() => `TOKEN${index}`),
            tokenContract.name().catch(() => `Unknown Token ${index}`),
            farmContract.tokenPriceFeedMapping(address).catch(() => ethers.constants.AddressZero),
          ]);
          result.push({ address, symbol, name, priceFeed });
          index++;
        } catch {
          break; // fin du tableau (index hors limites)
        }
      }

      return result;
    } catch (error) {
      console.error('Erreur lecture allowedTokens:', error);
      return [];
    }
  };

  // Récupérer l'historique des événements Stake/Unstake
  const getStakingEvents = async () => {
    if (!provider || !account) return [];

    try {
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, provider);

      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 5000);

      const [stakeEvents, unstakeEvents] = await Promise.all([
        farmContract.queryFilter(
          farmContract.filters.TokenStaked(account),
          fromBlock
        ).catch(() => []),
        farmContract.queryFilter(
          farmContract.filters.TokenUnstaked(account),
          fromBlock
        ).catch(() => []),
      ]);

      const allEvents = [
        ...stakeEvents.map((e) => ({
          action: "Staked" as const,
          token: e.args?.token || "",
          amount: e.args?.amount ? ethers.utils.formatEther(e.args.amount) : "0",
          blockNumber: e.blockNumber,
          hash: e.transactionHash,
        })),
        ...unstakeEvents.map((e) => ({
          action: "Unstaked" as const,
          token: e.args?.token || "",
          amount: e.args?.amount ? ethers.utils.formatEther(e.args.amount) : "0",
          blockNumber: e.blockNumber,
          hash: e.transactionHash,
        })),
      ].sort((a, b) => b.blockNumber - a.blockNumber);

      return allEvents;
    } catch (error) {
      console.error("Erreur lecture événements:", error);
      return [];
    }
  };

  // ==========================================
  // FONCTIONS ADMIN (onlyOwner)
  // ==========================================

  // Vérifier si le wallet connecté est le propriétaire du contrat
  const checkIsAdmin = async (): Promise<boolean> => {
    if (!provider || !account) return false;
    try {
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, provider);
      const owner = await farmContract.owner();
      return owner.toLowerCase() === account.toLowerCase();
    } catch (error) {
      console.error("Erreur vérification admin:", error);
      return false;
    }
  };

  // Ajouter un token à la liste des tokens autorisés (étape 1)
  const addAllowedToken = async (tokenAddress: string) => {
    if (!provider || !account) {
      alert("Wallet non connecté");
      return false;
    }

    try {
      const signer = provider.getSigner();
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);

      console.log("Ajout du token autorisé:", tokenAddress);
      const tx = await farmContract.addAllowedTokens(tokenAddress);
      console.log("Transaction envoyée, hash:", tx.hash);
      await tx.wait();

      console.log("Token ajouté !");
      return true;
    } catch (error: any) {
      console.error("Erreur ajout token:", error);
      alert(`Erreur ajout token: ${error?.reason || error?.message}`);
      return false;
    }
  };

  // Configurer le price feed Chainlink pour un token (étape 2)
  const setPriceFeed = async (tokenAddress: string, priceFeedAddress: string) => {
    if (!provider || !account) {
      alert("Wallet non connecté");
      return false;
    }

    try {
      const signer = provider.getSigner();
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);

      console.log("Configuration price feed:", tokenAddress, "->", priceFeedAddress);
      const tx = await farmContract.setPriceFeedContract(tokenAddress, priceFeedAddress);
      console.log("Transaction envoyée, hash:", tx.hash);
      await tx.wait();

      console.log("Price feed configuré !");
      return true;
    } catch (error: any) {
      console.error("Erreur config price feed:", error);
      alert(`Erreur price feed: ${error?.reason || error?.message}`);
      return false;
    }
  };

  // Retirer un token de la liste autorisée
  const removeAllowedToken = async (tokenAddress: string) => {
    if (!provider || !account) {
      alert("Wallet non connecté");
      return false;
    }

    try {
      const signer = provider.getSigner();
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);

      console.log("Suppression du token:", tokenAddress);
      const tx = await farmContract.removeAllowedToken(tokenAddress);
      console.log("Transaction envoyée, hash:", tx.hash);
      await tx.wait();

      console.log("Token supprimé !");
      return true;
    } catch (error: any) {
      console.error("Erreur suppression token:", error);
      alert(`Erreur suppression: ${error?.reason || error?.message}`);
      return false;
    }
  };

  // Distribuer les récompenses à TOUS les stakers (issueTokens)
  const distributeRewardsToAll = async () => {
    if (!provider || !account) {
      alert("Wallet non connecté");
      return false;
    }

    try {
      const signer = provider.getSigner();
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);

      console.log("Distribution des rewards à tous les stakers...");
      const tx = await farmContract.issueTokens();
      console.log("Transaction envoyée, hash:", tx.hash);
      await tx.wait();

      console.log("Rewards distribués !");
      return true;
    } catch (error: any) {
      console.error("Erreur distribution:", error);
      alert(`Erreur distribution: ${error?.reason || error?.message}`);
      return false;
    }
  };

  return {
    // État
    account,
    isConnected: !!account,
    loading,
    chainId,
    provider,
    // Connexion
    connectWallet,
    // Staking utilisateur
    stakeTokens,
    unstakeTokens,
    // Lecture
    getTokenBalance,
    getStakingBalance,
    getUserTotalValue,
    checkTokenIsAllowed,
    getAllowedTokens,
    getStakingEvents,
    // Admin
    checkIsAdmin,
    addAllowedToken,
    setPriceFeed,
    removeAllowedToken,
    distributeRewardsToAll,
  };
};
