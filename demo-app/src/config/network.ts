import { getFullnodeUrl } from "@mysten/sui.js/client";

export const networkConfig = {
  devnet: { url: getFullnodeUrl("devnet") },
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
};
