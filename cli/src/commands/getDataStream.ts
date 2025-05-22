import { Network, SuiPulse } from "@suipulse/sdk";
import { getActiveSuiKeypair } from "../utils";

export async function getDataStream(
  streamId: string,
  network: string
): Promise<void> {
  const keypair = getActiveSuiKeypair();
  const suiPulse = new SuiPulse(keypair, network as Network);

  try {
    const stream = await suiPulse.getDataStream(streamId);
    console.log("Stream data:", JSON.stringify(stream, null, 2));
  } finally {
    suiPulse.cleanup();
  }
}
