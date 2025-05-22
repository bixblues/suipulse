import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiPulse, SuiPulseConfig } from "../src";

// Helper function to wait for a specified time
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to retry an operation
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  delayMs: number
): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        console.log(`Retry ${i + 1}/${maxRetries} after error:`, error);
        await wait(delayMs);
      }
    }
  }
  throw lastError;
}

async function main() {
  try {
    // Initialize SDK with testnet configuration
    const config = SuiPulseConfig.getInstance().getConfig();

    // Create Sui client
    const client = new SuiClient({ url: config.url });

    // Import keypair from private key (replace with your private key)
    const privateKey = "53cf1d0167e860510c638241b...."; // Replace with your private key
    const keypair = Ed25519Keypair.fromSecretKey(
      Buffer.from(privateKey, "hex")
    );

    // Initialize SuiPulse SDK
    const suiPulse = new SuiPulse(keypair);

    // Example 1: Create multiple streams in batch
    console.log("\n=== Creating Multiple Streams in Batch ===");
    const createResult = await suiPulse.createStreamsBatch({
      streams: [
        {
          name: "Batch Stream 1",
          description: "First stream in batch",
          isPublic: true,
          metadata: new Uint8Array([1, 2, 3]),
          schema: "test_schema_1",
          tags: ["batch", "test", "stream1"],
        },
        {
          name: "Batch Stream 2",
          description: "Second stream in batch",
          isPublic: true,
          metadata: new Uint8Array([4, 5, 6]),
          schema: "test_schema_2",
          tags: ["batch", "test", "stream2"],
        },
        {
          name: "Batch Stream 3",
          description: "Third stream in batch",
          isPublic: false,
          metadata: new Uint8Array([7, 8, 9]),
          schema: "test_schema_3",
          tags: ["batch", "test", "stream3"],
        },
      ],
      options: {
        parallel: false, // Process streams sequentially to avoid conflicts
      },
    });

    console.log("\nBatch Creation Results:");
    console.log(`Total streams attempted: ${createResult.summary.total}`);
    console.log(`Successfully created: ${createResult.summary.succeeded}`);
    console.log(`Failed to create: ${createResult.summary.failed}`);

    if (createResult.failed.length > 0) {
      console.log("\nFailed Streams:");
      createResult.failed.forEach((failure) => {
        console.log(`Config: ${JSON.stringify(failure.item)}`);
        console.log(`Error: ${failure.error.message}`);
      });
    }

    // Get stream IDs from successful creations
    const signerAddress = keypair.getPublicKey().toSuiAddress();
    const streams = await client.getOwnedObjects({
      owner: signerAddress,
      options: {
        showContent: true,
      },
    });

    const streamIds: string[] = [];
    for (const streamConfig of createResult.successful) {
      const matchingStream = streams.data.find((obj) => {
        if (!obj.data?.content || obj.data.content.dataType !== "moveObject") {
          return false;
        }
        const fields = (obj.data.content as any).fields;
        return (
          fields.name === streamConfig.name &&
          fields.description === streamConfig.description
        );
      });

      if (matchingStream?.data?.objectId) {
        streamIds.push(matchingStream.data.objectId);
      } else {
        console.warn(
          `No matching stream found for config: ${JSON.stringify(streamConfig)}`
        );
      }
    }

    if (streamIds.length === 0) {
      console.log("\nNo valid stream IDs found for updates");
      return;
    }

    console.log("\nCreated Stream IDs:", streamIds);

    // Wait for transactions to be finalized
    console.log("\nWaiting for transactions to be finalized...");
    await wait(5000); // Wait 5 seconds for transactions to be finalized

    // Example 2: Update multiple streams in batch
    console.log("\n=== Updating Multiple Streams in Batch ===");
    const updateResult = await suiPulse.updateStreamsBatch({
      updates: streamIds.map((id) => ({
        streamId: id,
        data: new Uint8Array([10, 11, 12]),
      })),
      options: {
        parallel: false, // Process updates sequentially
      },
    });

    console.log("\nBatch Update Results:");
    console.log(`Total updates attempted: ${updateResult.summary.total}`);
    console.log(`Successfully updated: ${updateResult.summary.succeeded}`);
    console.log(`Failed to update: ${updateResult.summary.failed}`);

    if (updateResult.failed.length > 0) {
      console.log("\nFailed Updates:");
      updateResult.failed.forEach((failure) => {
        console.log(`Stream ID: ${failure.item.streamId}`);
        console.log(`Error: ${failure.error.message}`);
      });
    }

    // Wait for update transactions to be finalized
    console.log("\nWaiting for update transactions to be finalized...");
    await wait(5000);

    // Verify the updates
    console.log("\n=== Verifying Stream Updates ===");
    for (const streamId of streamIds) {
      try {
        const stream = await retryOperation(
          () => suiPulse.getDataStream(streamId),
          3,
          2000
        );
        console.log(`\nStream ${streamId}:`);
        console.log(`Version: ${stream.version}`);
        console.log(`Data: ${Array.from(stream.data)}`);
        console.log(`Last Updated: ${stream.last_updated}`);
      } catch (error) {
        console.error(`Failed to verify stream ${streamId}:`, error);
      }
    }

    // Cleanup
    console.log("\n=== Cleaning Up ===");
    suiPulse.cleanup();
    console.log("Batch operations example completed successfully!");
  } catch (error) {
    console.error("Error in batch operations example:", error);
  }
}

// Run the example
main().catch(console.error);
