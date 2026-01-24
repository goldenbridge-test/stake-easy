
export const TOKEN_FARM_ADDRESS = "0x736Ee2066fd93601Cb86Ce4d8ce7109d014cbDE4"; 


export const SUPPORTED_TOKENS = [
  {
    symbol: "GLD",
    name: "Golden Token",
    address: "0x4d05A6430C78D66d904dc49BAa5a55137Ed53110", 
    decimals: 18,
    iconColor: "bg-yellow-500",
    price: 100,
    priceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306" 
  }
];

export const SEPOLIA_CONFIG = {
  chainId: '0xaa36a7',
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io']
};

export const getTokenByAddress = (address: string) => {
  return SUPPORTED_TOKENS.find(
    token => token.address.toLowerCase() === address.toLowerCase()
  );
};

export const getTokenBySymbol = (symbol: string) => {
  return SUPPORTED_TOKENS.find(
    token => token.symbol.toLowerCase() === symbol.toLowerCase()
  );
};