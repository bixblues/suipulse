import { SuiPulse } from "@suipulse/sdk";
import { getActiveSuiKeypair } from "../utils";

export async function isSubscribed(
  streamId: string,
  address: string,
  network: string
): Promise<void> {
  const keypair = getActiveSuiKeypair();
  const suiPulse = new SuiPulse(keypair, network as any);

  try {
    const subscribed = await suiPulse.isSubscribed(streamId, address);
    console.log(
      `Address ${address} is ${
        subscribed ? "" : "not "
      }subscribed to stream ${streamId}`
    );
  } finally {
    suiPulse.cleanup();
  }
}
