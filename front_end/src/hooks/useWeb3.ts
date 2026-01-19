import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// 🔥 NOUVELLES ADRESSES APRÈS DÉPLOIEMENT
const TOKEN_FARM_ADDRESS = "0x4eBF913470E62204e4b1cdf121d6Ed50d85Ba62A"; 
const TOKEN_ADDRESS = "0xFD803Ded3A8516484fD058Af8683353D92F3FE00";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
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

  const switchToSepolia = async () => {
    const { ethereum } = window as any;
    if (!ethereum) return false;

    const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 en hex
    
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (switchError: any) {
      // Si le réseau n'existe pas dans MetaMask, on l'ajoute
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              }
            ]
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

  const connectWallet = async () => {
    const { ethereum } = window as any;
    if (ethereum) {
      try {
        // Vérifier/changer vers Sepolia
        const isOnSepolia = await switchToSepolia();
        if (!isOnSepolia) {
          alert("Veuillez vous connecter au réseau Sepolia");
          return false;
        }

        const provider = new ethers.providers.Web3Provider(ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        // Récupérer le chainId
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
      alert("Installez MetaMask !");
      return false;
    }
  };
  const stakeTokens = async (amount: string) => {
    if (!provider || !account) return;
    setLoading(true);

    try {
      const signer = provider.getSigner();
      const formattedAmount = ethers.utils.parseEther(amount);

      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
      const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);

      console.log("Étape 1 : Approbation en cours...");
      const txApprove = await tokenContract.approve(TOKEN_FARM_ADDRESS, formattedAmount);
      await txApprove.wait();
      console.log("Approbation réussie !");

      console.log("Étape 2 : Staking en cours...");
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
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      
      const balance = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      
      return ethers.utils.formatUnits(balance, decimals);
      
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
      
      const tx = await farmContract.addAllowedTokens(tokenAddress, priceFeedAddress);
      
      console.log("Transaction envoyée, hash:", tx.hash);
      
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

return { 
  account, 
  connectWallet, 
  stakeTokens,
  getTokenBalance,
  addAllowedToken,
  distributeRewardsToAll,
  checkIsAdmin,
  issueRewardToUser, 
  isConnected: !!account, 
  loading,
  chainId ,
  provider
};
};