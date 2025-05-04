import { SuiClient, SuiHTTPTransport } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiPulse } from "../src";

const NETWORKS = {
  mainnet: {
    packageId: "0x...", // Replace with mainnet package ID
    url: "https://fullnode.mainnet.sui.io:443",
  },
  testnet: {
    packageId:
      "0x94d890a5677922d1f2e51724ba9439a422235bc8e8de0ad7d8b4e06827c8d750",
    url: "https://fullnode.testnet.sui.io:443",
  },
  devnet: {
    packageId: "0x...", // Replace with devnet package ID
    url: "https://fullnode.devnet.sui.io:443",
  },
} as const;

const NETWORK = "testnet";
const network = NETWORKS[NETWORK];

// Initialize the client
const client = new SuiClient({
  transport: new SuiHTTPTransport({
    url: network.url,
  }),
});

// Helper function to wait for a specified time
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function pollEvents(
  client: SuiClient,
  packageId: string,
  streamId: string,
  suiPulse: SuiPulse
) {
  let lastEventId: { txDigest: string; eventSeq: string } | null = null;

  while (true) {
    try {
      console.log("\nPolling for events...");
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${packageId}::data_stream::DataStreamUpdated`,
        },
        cursor: lastEventId,
        limit: 10,
      });

      const eventsData = events.data.find((event) => {
        const eventData = event.parsedJson as {
          stream_id: string;
          timestamp: string;
        };
        return eventData.stream_id === streamId;
      });
      if (eventsData) {
        console.log("\n=== Found our stream's update event! Fetching data ===");
        // Fetch the updated stream data
        try {
          const updatedStream = await suiPulse.getDataStream(streamId);
          console.log("\nUpdated Stream Data:", Array.from(updatedStream.data));
          console.log("Stream Version:", updatedStream.version);
          console.log("Last Updated:", updatedStream.last_updated);
        } catch (error) {
          console.error("Error fetching updated stream data:", error);
        }
      } else {
        console.log("No update events found for stream", streamId);
      }
    } catch (error) {
      console.error("Error polling events:", error);
    }
    await wait(10000); // Poll every 10 seconds
  }
}

async function main() {
  try {
    const privateKey =
      "53cf1d0167e860510c638241bcee690085432af368a44871b20673d46b4f3af7";
    const keypair = Ed25519Keypair.fromSecretKey(
      Buffer.from(privateKey, "hex")
    );

    const suiPulse = new SuiPulse(client, network.packageId, keypair);

    // Create a stream to trigger events
    console.log("\n=== Creating a New Stream ===");
    const streamResponse = await suiPulse.createStream({
      name: "Event Test Stream",
      description: "Testing event handling",
      isPublic: true,
      metadata: new Uint8Array([1, 2, 3]),
      tags: ["test", "events"],
    });

    const streamId = streamResponse.effects?.created?.[0]?.reference?.objectId;
    if (!streamId) {
      throw new Error("Failed to get stream ID from response");
    }
    console.log("Created Stream ID:", streamId);

    // Start polling for events in the background
    console.log("\n=== Starting Event Polling ===");
    pollEvents(client, network.packageId, streamId, suiPulse);

    // Update stream data to trigger events version 1
    console.log("\n=== Updating Stream Data ===");
    await suiPulse.updateStream(streamId, new Uint8Array([4, 5, 6]));

    // Create a snapshot to trigger events
    console.log("\n=== Creating a Snapshot ===");
    const snapshotData = { metadata: "Test snapshot", timestamp: Date.now() };
    await suiPulse.createSnapshot(streamId, snapshotData);

    // Keep the script running to receive events
    console.log("\n=== Waiting for Events (Press Ctrl+C to exit) ===");
  } catch (error) {
    console.error("Error in event handling example:", error);
    process.exit(1);
  }
}

// Run the example
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
