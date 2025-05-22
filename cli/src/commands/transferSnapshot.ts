import { SuiPulse } from "@suipulse/sdk";
import { getActiveSuiKeypair } from "../utils";

export async function transferSnapshot(
  snapshotId: string,
  recipient: string,
  network: string
): Promise<void> {
  const keypair = getActiveSuiKeypair();
  const suiPulse = new SuiPulse(keypair, network as any);

  try {
    const response = await suiPulse.transferSnapshot(snapshotId, recipient);
    console.log("Snapshot transferred successfully:", response);
  } finally {
    suiPulse.cleanup();
  }
}
