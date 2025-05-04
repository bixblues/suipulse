import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiPulse } from "../src";

async function main() {
  try {
    // Import keypair from private key (replace with your private key)
    const privateKey =
      "53cf1d0167e860510c638241bcee690085432af368a44871b20673d46b4f3af7"; // Replace with your private key
    const keypair = Ed25519Keypair.fromSecretKey(
      Buffer.from(privateKey, "hex")
    );

    // Initialize SuiPulse SDK
    const suiPulse = new SuiPulse(keypair);

    // Create a new data stream
    console.log("Creating a new data stream...");
    const streamResponse = await suiPulse.createStream({
      name: "Test Stream",
      description: "A test data stream",
      isPublic: true,
      metadata: new Uint8Array([1, 2, 3]),
      schema: "test_schema",
      tags: ["test", "example", "sdk"],
    });

    // Get the stream ID from the response
    const streamId = streamResponse.effects?.created?.[0]?.reference?.objectId;
    if (!streamId) {
      throw new Error("Failed to get stream ID from response");
    }
    console.log("Stream created with ID:", streamId);

    // Get the initial stream data
    console.log("Getting initial stream data...");
    const initialStream = await suiPulse.getDataStream(streamId);
    console.log("Initial stream data:", {
      ...initialStream,
      data: initialStream.data ? Array.from(initialStream.data) : null,
    });

    // Subscribe to stream updates
    console.log("Subscribing to stream updates...");
    try {
      await suiPulse.subscribeToStream(streamId);
      console.log("Successfully subscribed to stream updates");
    } catch (error) {
      console.warn("Warning: Failed to subscribe to stream updates:", error);
    }

    // Update the stream data
    console.log("Updating stream data...");
    const updateResponse = await suiPulse.updateStream(
      streamId,
      new Uint8Array([4, 5, 6])
    );
    console.log("Update transaction:", {
      digest: updateResponse.digest,
      status: updateResponse.effects?.status?.status,
      gasUsed: updateResponse.effects?.gasUsed,
    });

    // Wait for the update to be finalized
    console.log("Waiting for update to be finalized...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get the updated stream data
    console.log("Getting updated stream data...");
    const updatedStream = await suiPulse.getDataStream(streamId);
    console.log("Updated stream data:", {
      ...updatedStream,
      data: updatedStream.data ? Array.from(updatedStream.data) : null,
    });

    // Create a snapshot
    console.log("Creating a snapshot...");
    const snapshotResponse = await suiPulse.createSnapshot(streamId, {
      metadata: "Test snapshot metadata",
    });
    console.log("Snapshot transaction:", {
      digest: snapshotResponse.digest,
      status: snapshotResponse.effects?.status?.status,
      gasUsed: snapshotResponse.effects?.gasUsed,
    });

    // Cleanup
    console.log("Cleaning up...");
    suiPulse.cleanup();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run example
main().catch(console.error);
