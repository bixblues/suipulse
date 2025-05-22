import { SuiPulse } from "@suipulse/sdk";
import { getActiveSuiKeypair } from "../utils";

export async function addPermission(
  streamId: string,
  address: string,
  level: number,
  network: string
): Promise<void> {
  const keypair = getActiveSuiKeypair();
  const suiPulse = new SuiPulse(keypair, network as any);

  try {
    const response = await suiPulse.addPermission(streamId, address, level);
    console.log("Permission added successfully:", response);
  } finally {
    suiPulse.cleanup();
  }
}
