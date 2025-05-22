import { readFileSync } from "fs";
import { Network, SuiPulse } from "@suipulse/sdk";
import { SuiClient } from "@mysten/sui.js/client";
import chalk from "chalk";
import ora from "ora";
import { getActiveSuiKeypair } from "../utils";

interface StreamConfig {
  name: string;
  description: string;
  metadata: string | Uint8Array;
}

interface BatchConfig {
  streams: StreamConfig[];
}

export async function createStreamsBatch(
  configPath: string,
  parallel: boolean = false,
  network: string = "mainnet"
): Promise<void> {
  const spinner = ora("Creating streams in batch...").start();

  try {
    // Read batch configuration file
    const config = JSON.parse(readFileSync(configPath, "utf-8")) as BatchConfig;

    // Convert metadata to Uint8Array if it's a string
    const processedStreams = config.streams.map((stream: StreamConfig) => {
      if (typeof stream.metadata === "string") {
        return {
          ...stream,
          metadata: new Uint8Array(Buffer.from(stream.metadata, "utf-8")),
        };
      }
      return stream;
    });

    // Get keypair from Sui CLI active account
    const keypair = getActiveSuiKeypair();

    // Initialize SuiPulse
    const suiPulse = new SuiPulse(keypair, network as Network);

    spinner.text = "Creating streams...";

    // Create streams in batch using SDK
    const result = await suiPulse.createStreamsBatch({
      streams: processedStreams,
      options: { parallel },
    });

    spinner.succeed(chalk.green("Batch stream creation completed!"));
    console.log(chalk.blue("\nBatch Operation Summary:"));
    console.log(chalk.white("Total:"), result.summary.total);
    console.log(chalk.white("Succeeded:"), result.summary.succeeded);
    console.log(chalk.white("Failed:"), result.summary.failed);

    if (result.failed.length > 0) {
      console.log(chalk.yellow("\nFailed Operations:"));
      result.failed.forEach((failure) => {
        console.log(chalk.red("Stream:"), failure.item.name);
        console.log(chalk.red("Error:"), failure.error.message);
      });
    }

    // Get stream IDs from successful creations
    const signerAddress = keypair.getPublicKey().toSuiAddress();
    const client = new SuiClient({
      url:
        network === "mainnet"
          ? "https://fullnode.mainnet.sui.io"
          : "https://fullnode.testnet.sui.io",
    });
    const streams = await client.getOwnedObjects({
      owner: signerAddress,
      options: {
        showContent: true,
      },
    });

    const createdStreams: { name: string; id: string }[] = [];
    for (const streamConfig of result.successful) {
      const matchingStream = streams.data.find((obj) => {
        if (!obj.data?.content || obj.data.content.dataType !== "moveObject") {
          return false;
        }
        const fields = obj.data.content.fields as {
          name: string;
          description: string;
        };
        return (
          fields.name === streamConfig.name &&
          fields.description === streamConfig.description
        );
      });

      if (matchingStream?.data?.objectId) {
        createdStreams.push({
          name: streamConfig.name,
          id: matchingStream.data.objectId,
        });
      } else {
        console.warn(
          `No matching stream found for config: ${JSON.stringify(streamConfig)}`
        );
      }
    }

    if (createdStreams.length === 0) {
      console.log("\nNo valid stream IDs found for updates");
      return;
    }

    console.log("\nCreated Streams:");
    createdStreams.forEach(({ name, id }) => {
      console.log(chalk.white(`${name}: ${id}`));
    });
  } catch (error: unknown) {
    spinner.fail(chalk.red("Failed to create streams in batch"));
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}
