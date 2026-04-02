import networkMap from '../chain-info/map.json';

// Prend la première adresse GoldenToken déployée pour Sepolia (index 0 = paire active)
const sepoliaTokens: string[] = (networkMap as any)["11155111"]?.GoldenToken || [];
const LATEST_GLD_ADDRESS = sepoliaTokens[0] || "0xD6592daDd49Dd401CD5dF8CC54dFe98cDB922E71";

export const SUPPORTED_TOKENS = [
  {
    symbol: "GLD",
    name: "Golden Token",
    address: LATEST_GLD_ADDRESS,
    balance: 0,
    price: 2000,
    iconColor: "bg-gradient-to-br from-yellow-400 to-yellow-600",
  },
];
