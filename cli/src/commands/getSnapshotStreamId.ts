import { SuiPulse } from "@suipulse/sdk";
import { getActiveSuiKeypair } from "../utils";

export async function getSnapshotStreamId(
  snapshotId: string,
  network: string
): Promise<void> {
  const keypair = getActiveSuiKeypair();
  const suiPulse = new SuiPulse(keypair, network as any);

  try {
    const streamId = await suiPulse.getSnapshotStreamId(snapshotId);
    console.log("Snapshot stream ID:", streamId);
  } finally {
    suiPulse.cleanup();
  }
}
