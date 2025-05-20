import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { Network, SuiPulse } from "../src";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  // Initialize with your private key
  const privateKey =
    "53cf1d0167e860510c638241bcee690085432af368a44871b20673d46b4f3af7"; // Replace with your private key
  const keypair = Ed25519Keypair.fromSecretKey(Buffer.from(privateKey, "hex"));

  // Initialize SuiPulse with mainnet
  const suiPulse = new SuiPulse(keypair, Network.MAINNET);
  console.log("Network:", Network.MAINNET);

  let unsubscribe: (() => void) | undefined;

  try {
    console.log("\n=== Creating a New Stream ===");
    const streamResponse = await suiPulse.createStream({
      name: "Test Stream",
      description: "A test stream for event handling",
      isPublic: true,
      metadata: new Uint8Array([1, 2, 3]),
      tags: ["test", "events"],
    });

    const streamId = streamResponse.effects?.created?.[0]?.reference?.objectId;
    if (!streamId) {
      throw new Error("Failed to get stream ID from response");
    }
    console.log("Created Stream ID:", streamId);

    console.log("\n=== Waiting for stream to be indexed (5s) ===");
    await sleep(5000);

    console.log("\n=== Subscribing to All Events ===");

    unsubscribe = suiPulse.events.subscribeToStreamUpdates(async (event) => {
      if (event.stream_id === streamId) {
        console.log("\nReceived Stream Update Event:");
        console.log("Stream ID:", event.stream_id);
        console.log("Timestamp:", event.timestamp);
      }
    });

    console.log("\n=== Waiting for subscription to be established (5s) ===");
    await sleep(5000);

    console.log("\n=== Updating Stream Data ===");
    const updateResponse = await suiPulse.updateStream(
      streamId,
      new Uint8Array([4, 5, 6])
    );
    console.log("Update Transaction:", updateResponse.digest);

    console.log("\n=== Waiting for update to be processed (10s) ===");
    await sleep(10000);

    console.log("\n=== Creating Snapshot ===");
    const snapshotResponse = await suiPulse.createSnapshot(streamId, {
      metadata: "Test snapshot metadata",
    });
    console.log("Snapshot Transaction:", snapshotResponse.digest);

    // Keep the script running to receive events
    console.log("\n=== Waiting for events (30s) ===");
    await sleep(30000);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Cleanup
    if (unsubscribe) {
      unsubscribe();
    }
    await suiPulse.events.cleanup();
  }
}

main().catch(console.error);
