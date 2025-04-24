import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiPulse } from "../src";

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

    // Example 1: Create multiple streams in batch
    console.log("Creating multiple streams in batch...");
    const createResult = await suiPulse.createStreamsBatch({
      streams: [
        {
          name: "Batch Stream 1",
          description: "First stream in batch",
          isPublic: true,
          metadata: new Uint8Array([1, 2, 3]),
          tags: ["batch", "test"],
        },
        {
          name: "Batch Stream 2",
          description: "Second stream in batch",
          isPublic: true,
          metadata: new Uint8Array([4, 5, 6]),
          tags: ["batch", "test"],
        },
      ],
      options: {
        parallel: true, // Process streams in parallel
      },
    });

    console.log("Batch creation results:");
    console.log(`Total streams: ${createResult.summary.total}`);
    console.log(`Successful: ${createResult.summary.succeeded}`);
    console.log(`Failed: ${createResult.summary.failed}`);

    // Example 2: Update multiple streams in batch
    console.log("\nUpdating multiple streams in batch...");
    const streamIds = createResult.successful
      .map((stream) => {
        // Each successful stream creation returns a SuiTransactionBlockResponse
        const response = stream as any;
        const createdObject = response.effects?.created?.[0];
        if (!createdObject) {
          console.warn("No created object found in response");
          return null;
        }
        return createdObject.reference.objectId;
      })
      .filter(Boolean);

    if (streamIds.length === 0) {
      console.log("No valid stream IDs found for updates");
      return;
    }

    console.log(`Found ${streamIds.length} streams to update`);
    console.log("Stream IDs:", streamIds);

    const updateResult = await suiPulse.updateStreamsBatch({
      updates: streamIds.map((id) => ({
        streamId: id,
        data: new Uint8Array([7, 8, 9]),
      })),
      options: {
        parallel: true,
        retryCount: 3, // Retry failed updates up to 3 times
      },
    });

    console.log("Batch update results:");
    console.log(`Total updates: ${updateResult.summary.total}`);
    console.log(`Successful: ${updateResult.summary.succeeded}`);
    console.log(`Failed: ${updateResult.summary.failed}`);

    if (updateResult.failed.length > 0) {
      console.log("\nFailed updates:");
      updateResult.failed.forEach((failure) => {
        console.log(`Stream ID: ${failure.item.streamId}`);
        console.log(`Error: ${failure.error.message}`);
      });
    }

    // Cleanup
    suiPulse.cleanup();
    console.log("\nBatch operations example completed successfully!");
  } catch (error) {
    console.error("Error in batch operations example:", error);
  }
}

// Run the example
main().catch(console.error);
