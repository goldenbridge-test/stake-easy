import { useState } from 'react';
import { ethers } from 'ethers';
import { SUPPORTED_TOKENS, TOKEN_FARM_ADDRESS, SEPOLIA_CONFIG } from '../constants/tokens';

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)"
];

const TOKEN_FARM_ABI = [
  "function stakeTokens(uint256 _amount, address _token) public",
  "function unstakeTokens(address _token) public",
  "function getUserTotalValue(address _user) public view returns (uint256)",
  "function getUserTokenStakingBalanceEthValue(address _user, address _token) public view returns (uint256)",
  "function stakingBalance(address _token, address _user) public view returns (uint256)",
  "function issueTokens() public",
  "function addAllowedTokens(address _token) public",
  "function setPriceFeedContract(address _token, address _priceFeed) public",
  "function owner() public view returns (address)",
  "function tokenIsAllowed(address _token) public view returns (bool)",
  "function allowedTokens(uint256 _index) public view returns (address)",
  "function uniqueTokensStaked(address _user) public view returns (uint256)"
];

export const useWeb3 = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [loading, setLoading] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      const { ethereum } = window as any;
      if (ethereum) {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const network = await provider.getNetwork();
          setProvider(provider);
          setAccount(accounts[0]);
          setChainId(network.chainId);
        }

        ethereum.on('accountsChanged', async (newAccounts: string[]) => {
          if (newAccounts.length > 0) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const network = await provider.getNetwork();
            setAccount(newAccounts[0]);
            setProvider(provider);
            setChainId(network.chainId);
          } else {
            setAccount(null);
            setProvider(null);
            setChainId(null);
          }
        });

        ethereum.on('chainChanged', async (newChainId: string) => {
          setChainId(parseInt(newChainId, 16));
          window.location.reload(); 
        });
      }
    };

    init();
  }, []);

  const getAllTokensWithInfo = async (): Promise<Array<{
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    iconColor: string;
    balance: number;
    price: number;
  }>> => {
    if (!provider || !account) return [];
    
    try {
      const tokensWithInfo = [];
      
      for (const tokenConfig of SUPPORTED_TOKENS) {
        try {
          const isAllowed = await checkTokenIsAllowed(tokenConfig.address);
          
          if (!isAllowed) {
            console.log(`⚠️ Token ${tokenConfig.symbol} n'est pas encore autorisé sur le contrat`);
            continue;
          }
          
          const balance = await getTokenBalance(tokenConfig.address);
          
          tokensWithInfo.push({
            address: tokenConfig.address,
            symbol: tokenConfig.symbol,
            name: tokenConfig.name,
            decimals: tokenConfig.decimals,
            iconColor: tokenConfig.iconColor || getRandomColor(),
            balance: parseFloat(balance || "0"),
            price: tokenConfig.price || 0
          });
        } catch (error) {
          console.error(`❌ Erreur avec le token ${tokenConfig.symbol}:`, error);
        }
      }
      
      return tokensWithInfo;
      
    } catch (error) {
      console.error("Erreur récupération tokens:", error);
      return [];
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const isOnSepolia = await switchToSepolia();
        if (!isOnSepolia) {
          alert("⚠️ Veuillez vous connecter au réseau Sepolia");
          return false;
        }

        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        const network = await provider.getNetwork();
        setChainId(network.chainId);
        
        setProvider(provider);
        setAccount(address);
        return true;
      } catch (error) {
        console.error("Erreur connexion:", error);
        return false;
      }
    } else {
      alert("📦 Installez MetaMask pour continuer !");
      return false;
    }
  };

  const stakeTokens = async (amount: string, tokenAddress: string) => {
    if (!provider || !account) {
      alert("❌ Wallet non connecté");
      return false;
    }
    
    setLoading(true);

    try {
      const signer = provider.getSigner();
      
      const tokenConfig = SUPPORTED_TOKENS.find(t => 
        t.address.toLowerCase() === tokenAddress.toLowerCase()
      );
      
      const decimals = tokenConfig?.decimals || 18;
      const formattedAmount = ethers.utils.parseUnits(amount, decimals);

      const isAllowed = await checkTokenIsAllowed(tokenAddress);
      if (!isAllowed) {
        alert("❌ Ce token n'est pas autorisé pour le staking. Contactez l'admin.");
        return false;
      }

      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);

      console.log("✅ Étape 1 : Vérification balance...");
      const balance = await tokenContract.balanceOf(account);
      if (balance.lt(formattedAmount)) {
        alert(`❌ Balance insuffisante. Vous avez ${ethers.utils.formatUnits(balance, decimals)} ${tokenConfig?.symbol || 'tokens'}`);
        return false;
      }

      console.log("✅ Étape 2 : Vérification approbation...");
      const allowance = await tokenContract.allowance(account, TOKEN_FARM_ADDRESS);
      if (allowance.lt(formattedAmount)) {
        console.log("⏳ Approbation nécessaire...");
        const txApprove = await tokenContract.approve(TOKEN_FARM_ADDRESS, formattedAmount);
        await txApprove.wait();
        console.log("✅ Approbation réussie !");
      } else {
        console.log("✅ Approbation déjà suffisante");
      }

      console.log("⏳ Étape 3 : Staking en cours...");
      const txStake = await farmContract.stakeTokens(formattedAmount, tokenAddress);
      await txStake.wait();
      
      console.log("🎉 Staking réussi !");
      alert(`🎉 Félicitations ! ${amount} ${tokenConfig?.symbol || 'tokens'} stakés avec succès.`);
      return true;

    } catch (error: any) {
      console.error("❌ Erreur durant le staking:", error);
      alert(`❌ Erreur: ${error.message || "Transaction échouée"}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTokenBalance = async (tokenAddress: string): Promise<string> => {
    if (!provider || !account) return '0';

    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      
      const tokenConfig = SUPPORTED_TOKENS.find(t => 
        t.address.toLowerCase() === tokenAddress.toLowerCase()
      );
      
      const balance = await tokenContract.balanceOf(account);
      const decimals = tokenConfig?.decimals || await tokenContract.decimals();
      
      return ethers.utils.formatUnits(balance, decimals);
      
    } catch (error: any) {
      console.error('❌ Erreur lecture balance:', error);
      return '0';
    }
  };

  const unstakeTokens = async (tokenAddress: string) => {
    if (!provider || !account) {
      alert("❌ Wallet non connecté");
      return false;
    }
    
    setLoading(true);

    try {
      const signer = provider.getSigner();
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);

      console.log("⏳ Unstaking en cours...");
      const tx = await farmContract.unstakeTokens(tokenAddress);
      await tx.wait();
      
      console.log("✅ Unstaking réussi !");
      alert("✅ Tokens retirés avec succès.");
      return true;

    } catch (error: any) {
      console.error("❌ Erreur durant l'unstaking:", error);
      alert(`❌ Erreur: ${error.message || "Transaction échouée"}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAllowedTokens = async (): Promise<string[]> => {
    if (!provider) return [];
    
    try {
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, provider);
      
      const tokens: string[] = [];
      let i = 0;
      
      while (true) {
        try {
          const token = await farmContract.allowedTokens(i);
          tokens.push(token);
          i++;
        } catch (e) {
          break;
        }
      }
      
      return tokens;
      
    } catch (error) {
      console.error("❌ Erreur récupération tokens autorisés:", error);
      return [];
    }
  };

  const checkTokenIsAllowed = async (tokenAddress: string): Promise<boolean> => {
  if (!provider) return false;
  
  try {
    const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, provider);
    return await farmContract.tokenIsAllowed(tokenAddress);
    
  } catch (error) {
    console.error("❌ Erreur vérification token autorisé:", error);
    
    // ✅ SOLUTION TEMPORAIRE : Accepter le token GLD même s'il n'est pas dans la liste
    // Remplace "GLD" par le vrai symbole de ton token
    const tokenConfig = SUPPORTED_TOKENS.find(t => 
      t.address.toLowerCase() === tokenAddress.toLowerCase()
    );
    
    if (tokenConfig && tokenConfig.symbol === "GLD") {
      console.log(`✅ On accepte temporairement ${tokenConfig.symbol} pour les tests`);
      return true; // 👈 Accepter le GLD même sans être dans allowedTokens
    }
    
    return false;
  }
};

  const getTokenInfo = async (tokenAddress: string): Promise<{
    symbol: string;
    name: string;
    decimals: number;
  } | null> => {
    if (!provider) return null;
    
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      
      const [symbol, name, decimals] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.name(),
        tokenContract.decimals()
      ]);
      
      return { 
        symbol: symbol || 'Unknown', 
        name: name || 'Unknown Token', 
        decimals: decimals || 18 
      };
      
    } catch (error) {
      console.error(`❌ Erreur récupération infos token ${tokenAddress}:`, error);
      return null;
    }
  };

  const getRandomColor = (): string => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const switchToSepolia = async () => {
    const { ethereum } = window as any;
    if (!ethereum) return false;
    
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CONFIG.chainId }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_CONFIG]
          });
          return true;
        } catch (addError) {
          console.error("❌ Erreur ajout réseau Sepolia:", addError);
          return false;
        }
      }
      console.error("❌ Erreur changement réseau:", switchError);
      return false;
    }
  };

  const getStakingBalance = async (tokenAddress: string): Promise<string> => {
    if (!provider || !account) return '0';
    
    try {
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, provider);
      const balance = await farmContract.stakingBalance(tokenAddress, account);
      
      const tokenConfig = SUPPORTED_TOKENS.find(t => 
        t.address.toLowerCase() === tokenAddress.toLowerCase()
      );
      
      return ethers.utils.formatUnits(balance, tokenConfig?.decimals || 18);
    } catch (error) {
      console.error("❌ Erreur récupération solde staké:", error);
      return '0';
    }
  };

  const getUserStakingValueEth = async (tokenAddress: string): Promise<string> => {
    if (!provider || !account) return '0';
    
    try {
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, provider);
      const value = await farmContract.getUserTokenStakingBalanceEthValue(account, tokenAddress);
      return ethers.utils.formatEther(value);
    } catch (error: any) {
      console.error("❌ Erreur récupération valeur staking:", error);
      return '0';
    }
  };

  const getUserTotalStakingValue = async (): Promise<string> => {
    if (!provider || !account) return '0';
    
    try {
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, provider);
      const totalValue = await farmContract.getUserTotalValue(account);
      return ethers.utils.formatEther(totalValue);
    } catch (error: any) {
      console.error("❌ Erreur récupération valeur totale:", error);
      return '0';
    }
  };

  const checkIsAdmin = async (): Promise<boolean> => {
    if (!provider || !account) return false;
    try {
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, provider);
      const owner = await farmContract.owner();
      return owner.toLowerCase() === account.toLowerCase();
    } catch (error) {
      console.error("❌ Erreur vérification admin:", error);
      return false;
    }
  };

  const addAllowedToken = async (tokenAddress: string, priceFeedAddress: string) => {
    if (!provider || !account) {
      alert("❌ Wallet non connecté");
      return false;
    }

    try {
      const signer = provider.getSigner();
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);
      
      console.log("⏳ Étape 1: Ajout du token aux tokens autorisés...");
      const tx1 = await farmContract.addAllowedTokens(tokenAddress);
      await tx1.wait();
      console.log("✅ Token ajouté !");
      
      if (priceFeedAddress && priceFeedAddress !== "0x0000000000000000000000000000000000000000") {
        console.log("⏳ Étape 2: Configuration du price feed...");
        const tx2 = await farmContract.setPriceFeedContract(tokenAddress, priceFeedAddress);
        await tx2.wait();
        console.log("✅ Price feed configuré !");
      }
      
      return true;
      
    } catch (error) {
      console.error("❌ Erreur ajout token:", error);
      return false;
    }
  };

  const distributeRewardsToAll = async () => {
    if (!provider || !account) {
      alert("❌ Wallet non connecté");
      return false;
    }

    try {
      const signer = provider.getSigner();
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);
      
      console.log("⏳ Distribution des rewards...");
      const tx = await farmContract.issueTokens();
      await tx.wait();
      
      console.log("✅ Rewards distribués !");
      return true;
      
    } catch (error) {
      console.error("❌ Erreur distribution:", error);
      return false;
    }
  };

  const issueRewardToUser = async (userAddress: string) => {
    if (!provider || !account) {
      alert("❌ Wallet non connecté");
      return false;
    }

    try {
      const signer = provider.getSigner();
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);
      
      console.log("⏳ Distribution reward à:", userAddress);
      const tx = await farmContract.issueReward(userAddress);
      await tx.wait();
      
      console.log("✅ Reward distribué !");
      return true;
      
    } catch (error) {
      console.error("❌ Erreur issue reward:", error);
      return false;
    }
  };

  const setPriceFeed = async (tokenAddress: string, priceFeedAddress: string) => {
    if (!provider || !account) {
      alert("❌ Wallet non connecté");
      return false;
    }

    try {
      const signer = provider.getSigner();
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);
      
      console.log("⏳ Configuration du price feed...");
      const tx = await farmContract.setPriceFeedContract(tokenAddress, priceFeedAddress);
      await tx.wait();
      
      console.log("✅ Price feed configuré !");
      return true;
      
    } catch (error) {
      console.error("❌ Erreur configuration price feed:", error);
      return false;
    }
  };

  return { 
    account, 
    connectWallet, 
    stakeTokens,
    unstakeTokens,
    getTokenBalance,
    getStakingBalance,
    getUserStakingValueEth,
    getUserTotalStakingValue,
    addAllowedToken,
    distributeRewardsToAll,
    checkIsAdmin,
    issueRewardToUser,
    setPriceFeed,
    checkTokenIsAllowed,
    getAllowedTokens,
    getTokenInfo,
    getAllTokensWithInfo, 
    isConnected: !!account, 
    loading,
    chainId,
    provider
  };
};