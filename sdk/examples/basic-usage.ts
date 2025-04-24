import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiPulse } from "../src";

// Network configurations
const NETWORKS = {
  mainnet: {
    packageId: "0x...", // Mainnet package ID
    fullnode: "https://fullnode.mainnet.sui.io:443",
  },
  testnet: {
    packageId:
      "0x94d890a5677922d1f2e51724ba9439a422235bc8e8de0ad7d8b4e06827c8d750", // Your testnet package ID
    fullnode: "https://fullnode.testnet.sui.io:443",
  },
};

async function main() {
  try {
    // Initialize with testnet configuration
    const network = "testnet";
    const config = NETWORKS[network];

    // Create Sui client
    const client = new SuiClient({ url: config.fullnode });

    // Import keypair from private key (replace with your private key)
    const privateKey =
      "53cf1d0167e860510c638241bcee690085432af368a44871b20673d46b4f3af7"; // Replace with your private key
    const keypair = Ed25519Keypair.fromSecretKey(
      Buffer.from(privateKey, "hex")
    );

    // Initialize SuiPulse SDK
    const suiPulse = new SuiPulse(client, config.packageId, keypair);

    // Create a new data stream
    const streamResponse = await suiPulse.createStream({
      name: "Test Stream",
      description: "A test data stream",
      isPublic: true,
      metadata: new Uint8Array([1, 2, 3]),
      // Remove tags for now as it's causing issues with tx.pure()
    });
    console.log("Stream created:", streamResponse);

    // Extract stream ID from the response
    const streamId = streamResponse.effects?.created?.[0]?.reference?.objectId;
    if (!streamId) {
      throw new Error("Failed to get stream ID from response");
    }
    console.log("Stream ID:", streamId);

    // Update stream data
    await suiPulse.updateStream(streamId, new Uint8Array([4, 5, 6]));
    console.log("Stream data updated successfully");

    // Create a snapshot
    const snapshotResponse = await suiPulse.createSnapshot(streamId, {
      metadata: "Test snapshot",
    });
    console.log("Snapshot created:", snapshotResponse);

    // Get stream data
    const streamData = await suiPulse.getDataStream(streamId);
    console.log("Stream data:", streamData);

    suiPulse.cleanup();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run example
main().catch(console.error);
