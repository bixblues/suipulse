import { SuiPulse, NetworkConfig } from "@suipulse/sdk";
import { getActiveSuiKeypair } from "../utils";

export async function setCustomConfig(
  url: string,
  packageId: string
): Promise<void> {
  const keypair = getActiveSuiKeypair();
  const suiPulse = new SuiPulse(keypair);

  try {
    const config: NetworkConfig = {
      url,
      packageId,
    };
    suiPulse.setCustomConfig(config);
    console.log("Custom network configuration set successfully");
  } finally {
    suiPulse.cleanup();
  }
}
