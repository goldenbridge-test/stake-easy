import networkMap from '../chain-info/map.json';
import GoldenPEFundArtifact from '../chain-info/GoldenPEFund.json';

// index [0] = version active sur Sepolia
const sepoliaPEFunds: string[] = (networkMap as any)["11155111"]?.GoldenPEFund || [];
export const PEFUND_ADDRESS = sepoliaPEFunds[0] || "0x99CB8188B5FAC5591690692D7C3f1B47fcBB040b"; // fallback en dur dans map.json

// ABI : déjà dans le JSON
export const PEFUND_ABI = GoldenPEFundArtifact.abi;

