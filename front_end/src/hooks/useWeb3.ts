import { useState } from 'react';
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
  "function stakingBalance(address _token, address _user) public view returns (uint256)"
];

export const useWeb3 = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [loading, setLoading] = useState(false);

  // --- 1. CONNEXION METAMASK ---
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Ouvre Metamask
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

  return { account, connectWallet, stakeTokens,getTokenBalance, isConnected: !!account, loading };
};