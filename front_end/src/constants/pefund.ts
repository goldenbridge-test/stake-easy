import networkMap from '../chain-info/map.json';
import GoldenPEFundArtifact from '../chain-info/GoldenPEFund.json';

// Brownie prepends each new deployment to map.json, so index [0] is the latest
// Sepolia deployment (confirmed via git history of map.json, see commit 9a0d6d4).
const sepoliaPEFunds: string[] = (networkMap as any)["11155111"]?.GoldenPEFund || [];
// Hardcoded fallback = latest known deployment, only used if the map.json lookup fails
export const PEFUND_ADDRESS = sepoliaPEFunds[0] || "0x99CB8188B5FAC5591690692D7C3f1B47fcBB040b";

// ABI from the Brownie-generated artifact
export const PEFUND_ABI = GoldenPEFundArtifact.abi;
