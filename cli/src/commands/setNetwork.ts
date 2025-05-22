import { SuiPulse, Network } from "@suipulse/sdk";
import { getActiveSuiKeypair } from "../utils";

export async function setNetwork(network: string): Promise<void> {
  const keypair = getActiveSuiKeypair();
  const suiPulse = new SuiPulse(keypair);

  try {
    suiPulse.setNetwork(network as Network);
    console.log(`Network set to ${network}`);
  } finally {
    suiPulse.cleanup();
  }
}
