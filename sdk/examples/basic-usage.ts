import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiPulse } from "../src/suipulse";
import { DataStreamCreatedEvent, DataStreamUpdatedEvent } from "../src/types";

async function main() {
  // Initialize client and keypair
  const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
  const keypair = Ed25519Keypair.generate();
  
  // Initialize SuiPulse with your package ID
  const packageId = "0x..."; // Your deployed package ID
  const suiPulse = new SuiPulse(client, packageId, keypair);

  try {
    // Create a new stream
    const stream = await suiPulse.createStream({
      name: "Test Stream",
      description: "A test data stream",
      isPublic: true,
      tags: ["test", "example"]
    });
    console.log("Stream created:", stream);

    // Subscribe to stream creation events
    const subscription = suiPulse.events.onStreamCreated(
      (event: DataStreamCreatedEvent) => {
        console.log("New stream created:", event);
      }
    );

    // Update stream data
    await suiPulse.updateStream(
      stream.effects?.created?.[0].reference.objectId || '',
      new TextEncoder().encode("Hello, World!")
    );

    // Create a snapshot
    await suiPulse.createSnapshot(
      stream.effects?.created?.[0].reference.objectId || '',
      { metadata: "Initial snapshot" }
    );

    // Batch create streams
    const batchResult = await suiPulse.createStreamsBatch({
      streams: [
        {
          name: "Batch Stream 1",
          description: "First batch stream",
          isPublic: true
        },
        {
          name: "Batch Stream 2",
          description: "Second batch stream",
          isPublic: true
        }
      ],
      options: {
        parallel: true
      }
    });
    console.log("Batch creation results:", batchResult);

    // Clean up
    subscription.unsubscribe();
    suiPulse.cleanup();
  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch(console.error);
