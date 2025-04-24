import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiPulse } from "../src";
import {
  DataStreamCreatedEvent,
  DataStreamUpdatedEvent,
  SnapshotCreatedEvent,
} from "../src/types";

const NETWORKS = {
  mainnet: {
    packageId: "0x...", // Replace with mainnet package ID
    fullnode: "https://fullnode.mainnet.sui.io:443",
  },
  testnet: {
    packageId: "0x...", // Replace with testnet package ID
    fullnode: "https://fullnode.testnet.sui.io:443",
  },
};

async function main() {
  try {
    // Initialize SDK with testnet configuration
    const client = new SuiClient({ url: NETWORKS.testnet.fullnode });
    const keypair = Ed25519Keypair.generate();
    const suiPulse = new SuiPulse(client, NETWORKS.testnet.packageId, keypair);

    // Create an event handler for stream updates
    const handleStreamEvent = (
      event:
        | DataStreamCreatedEvent
        | DataStreamUpdatedEvent
        | SnapshotCreatedEvent
    ) => {
      if ("stream_id" in event) {
        console.log("Stream event:", event.stream_id);
      }
    };

    // Subscribe to stream events
    console.log("Subscribing to stream events...");
    const unsubscribe =
      suiPulse.events.subscribeToStreamUpdates(handleStreamEvent);

    // Create a stream to trigger events
    console.log("Creating a new stream...");
    const streamResponse = await suiPulse.createStream({
      name: "Event Test Stream",
      description: "Testing event handling",
      isPublic: true,
      metadata: new Uint8Array([1, 2, 3]),
      tags: ["test", "events"],
    });

    // Extract stream ID from the created object
    const streamId = streamResponse.effects?.created?.[0]?.reference?.objectId;
    if (!streamId) {
      throw new Error("Failed to get stream ID from response");
    }

    // Update stream data to trigger events
    console.log("Updating stream data...");
    await suiPulse.updateStream(streamId, new Uint8Array([4, 5, 6]));

    // Create a snapshot to trigger events
    console.log("Creating a snapshot...");
    await suiPulse.createSnapshot(streamId, { metadata: "Test snapshot" });

    // Wait for events to process
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Cleanup subscriptions
    console.log("Cleaning up...");
    unsubscribe();
    suiPulse.cleanup();

    console.log("Event handling example completed successfully!");
  } catch (error) {
    console.error("Error in event handling example:", error);
  }
}

// Run the example
main().catch(console.error);
