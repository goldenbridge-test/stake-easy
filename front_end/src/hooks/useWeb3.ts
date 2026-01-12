import { useEffect, useState } from 'react';
import { ethers } from 'ethers';


const TOKEN_FARM_ADDRESS = "0x1Cc9762518EC94a17F70634C7266E32381af7cEa"; 
const TOKEN_ADDRESS = "0x45822c02771E441D24f0409D86D2f88FCb16cE5F";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)"
];

const TOKEN_FARM_ABI = [
  "function stakeTokens(uint256 _amount, address _token) public",
  "function unstakeTokens(address _token) public",
  "function getUserSingleTokenValue(address _user, address _token) public view returns (uint256)",
  "function stakingBalance(address _token, address _user) public view returns (uint256)",
  "function issueTokens() public",
  "function addAllowedTokens(address _token, address _priceFeed) public", 
  "function issueReward(address _user) public",
  "function owner() public view returns (address)"
];

export const useWeb3 = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [loading, setLoading] = useState(false)

    useEffect(() => {
    const init = async () => {
      const { ethereum } = window as any;
      if (ethereum) {
        // 1. Vérifier si on est déjà connecté
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          setProvider(provider);
          setAccount(accounts[0]);
        }

        // 2. Écouter si l'utilisateur change de compte dans MetaMask
        ethereum.on('accountsChanged', (newAccounts: string[]) => {
          if (newAccounts.length > 0) {
            setAccount(newAccounts[0]);
            const provider = new ethers.providers.Web3Provider(ethereum);
            setProvider(provider);
          } else {
            setAccount(null); // Déconnecté
            setProvider(null);
          }
        });
      }
    };

    init();
  }, []); 

  const connectWallet = async () => {
    const { ethereum } = window as any;
    if (ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(ethereum);
        // Demande la permission
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setProvider(provider);
        setAccount(address);
        return true;
      } catch (error) {
        console.error("Erreur connexion:", error);
        return false;
      }
    } else {
      alert("Installez Metamask !");
      return false;
    }
  };

  // --- 2. FONCTION STAKE (APPROVE + STAKE) ---
  const stakeTokens = async (amount: string) => {
    if (!provider || !account) return;
    setLoading(true);

    try {
      const signer = provider.getSigner();
      
      // Conversion du montant (ex: "10" devient "10000000000000000000")
      const formattedAmount = ethers.utils.parseEther(amount);

      // A. INSTANCE DES CONTRATS
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);

      // B. ÉTAPE 1 : APPROVE (Autoriser le contrat Farm à prendre nos sous)
      console.log("Étape 1 : Approbation en cours...");
      const txApprove = await tokenContract.approve(TOKEN_FARM_ADDRESS, formattedAmount);
      await txApprove.wait(); // On attend que la transaction soit validée sur la blockchain
      console.log("Approbation réussie !");

      // C. ÉTAPE 2 : STAKE (Envoyer les sous)
      console.log("Étape 2 : Staking en cours...");
      // Note: J'adapte les arguments selon ton contrat TokenFarm (montant + adresse du token)
      const txStake = await farmContract.stakeTokens(formattedAmount, TOKEN_ADDRESS);
      await txStake.wait();
      
      console.log("Staking réussi !");
      alert("Félicitations ! Tokens stakés avec succès.");

    } catch (error) {
      console.error("Erreur durant le staking:", error);
      alert("Erreur transaction (voir console)");
    } finally {
      setLoading(false);
    }
  };

  const getTokenBalance = async (tokenAddress: string) => {
  if (!provider || !account) return '0';

  try {
    const signer = provider.getSigner();
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    
    const balance = await tokenContract.balanceOf(account);
    
    // Convertir de Wei vers Ether (ex: "1000000000000000000" → "1.0")
    return ethers.utils.formatEther(balance);
    
  } catch (error) {
    console.error('Erreur lecture balance:', error);
    return '0';
  }
};

  const checkIsAdmin = async (): Promise<boolean> => {
    if (!provider || !account) return false;
    try {
      const signer = provider.getSigner();
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);
      const owner = await farmContract.owner();
      return owner.toLowerCase() === account.toLowerCase();
    } catch (error) {
      console.error("Erreur vérification admin:", error);
      return false;
    }
  };

const addAllowedToken = async (tokenAddress: string, priceFeedAddress: string) => {
  if (!provider || !account) {
    alert("Wallet non connecté");
    return false;
  }

  try {
    const signer = provider.getSigner();
    const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);
    
    console.log("Ajout du token:", tokenAddress);
    
    // Appeler addAllowedTokens du contrat
    const tx = await farmContract.addAllowedTokens(tokenAddress, priceFeedAddress);
    
    console.log("Transaction envoyée, hash:", tx.hash);
    
    // Attendre confirmation
    await tx.wait();
    
    console.log("Token ajouté avec succès !");
    return true;
    
  } catch (error) {
    console.error("Erreur ajout token:", error);
    alert("Erreur lors de l'ajout du token (voir console)");
    return false;
  }
};

const distributeRewardsToAll = async () => {
  if (!provider || !account) {
    alert("Wallet non connecté");
    return false;
  }

  try {
    const signer = provider.getSigner();
    const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);
    
    console.log("Distribution des rewards...");
    
    const tx = await farmContract.issueTokens();
    
    console.log("Transaction envoyée, hash:", tx.hash);
    
    await tx.wait();
    
    console.log("Rewards distribués !");
    return true;
    
  } catch (error) {
    console.error("Erreur distribution:", error);
    alert("Erreur lors de la distribution (voir console)");
    return false;
  }
};


const issueRewardToUser = async (userAddress: string) => {
  if (!provider || !account) {
    alert("Wallet non connecté");
    return false;
  }

  try {
    const signer = provider.getSigner();
    const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);
    
    console.log("Distribution reward à:", userAddress);
    
    // Appeler issueReward du contrat
    const tx = await farmContract.issueReward(userAddress);
    
    console.log("Transaction envoyée, hash:", tx.hash);
    
    await tx.wait();
    
    console.log("Reward distribué !");
    return true;
    
  } catch (error) {
    console.error("Erreur issue reward:", error);
    alert("Erreur lors de la distribution (voir console)");
    return false;
  }
};



  return { account, connectWallet, stakeTokens,getTokenBalance,addAllowedToken ,distributeRewardsToAll,checkIsAdmin,issueRewardToUser, isConnected: !!account, loading };
};