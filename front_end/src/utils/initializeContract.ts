import { ethers } from 'ethers';
import { SUPPORTED_TOKENS } from '../constants/tokens';

const TOKEN_FARM_ADDRESS = "0x4eBF913470E62204e4b1cdf121d6Ed50d85Ba62A";

const TOKEN_FARM_ABI = [
  "function addAllowedTokens(address _token) public",
  "function setPriceFeedContract(address _token, address _priceFeed) public",
  "function owner() public view returns (address)",
  "function tokenIsAllowed(address _token) public view returns (bool)"
];

export const initializeTokenFarm = async (provider: ethers.providers.Web3Provider) => {
  try {
    const signer = provider.getSigner();
    const farmContract = new ethers.Contract(TOKEN_FARM_ADDRESS, TOKEN_FARM_ABI, signer);
    
    const account = await signer.getAddress();
    const owner = await farmContract.owner();
    
    if (account.toLowerCase() !== owner.toLowerCase()) {
      console.log("❌ Vous n'êtes pas le propriétaire du contrat");
      return false;
    }
    
    console.log("✅ Vous êtes le propriétaire, initialisation...");
    
    for (const token of SUPPORTED_TOKENS) {
      try {
        // Vérifier si déjà ajouté
        const isAllowed = await farmContract.tokenIsAllowed(token.address);
        
        if (!isAllowed) {
          console.log(`Ajout de ${token.symbol}...`);
          
          // Ajouter le token
          const tx1 = await farmContract.addAllowedTokens(token.address);
          await tx1.wait();
          console.log(`✅ ${token.symbol} ajouté`);
          
          // Configurer le price feed
          const tx2 = await farmContract.setPriceFeedContract(token.address, token.priceFeed);
          await tx2.wait();
          console.log(`✅ Price feed configuré pour ${token.symbol}`);
        } else {
          console.log(`✅ ${token.symbol} déjà autorisé`);
        }
      } catch (error) {
        console.error(`❌ Erreur avec ${token.symbol}:`, error);
      }
    }
    
    console.log("✅ Initialisation terminée !");
    return true;
    
  } catch (error) {
    console.error("Erreur initialisation:", error);
    return false;
  }
};