/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Fournisseur injecte par MetaMask (utilise par hooks/useWeb3.ts)
interface Window {
  ethereum?: any;
}
