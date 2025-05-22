import { readFileSync } from "fs";
import { Network, SuiPulse } from "@suipulse/sdk";
import chalk from "chalk";
import ora from "ora";
import { getActiveSuiKeypair } from "../utils";

export async function createStream(
  metadataPath: string,
  network: string = "mainnet"
): Promise<void> {
  const spinner = ora("Creating stream...").start();

  try {
    // Read metadata file
    const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));

    // Get keypair from Sui CLI active account
    const keypair = getActiveSuiKeypair();

    // Initialize SuiPulse
    const suiPulse = new SuiPulse(keypair, network as Network);

    spinner.text = "Creating stream with metadata...";

    // Create the stream using SDK
    const result = await suiPulse.createStream(metadata);

    // Get the stream ID from the created objects
    const streamId = result.effects?.created?.[0]?.reference?.objectId;
    if (!streamId) {
      throw new Error("Failed to get stream ID from transaction response");
    }

    spinner.succeed(chalk.green("Stream created successfully!"));
    console.log(chalk.blue("\nStream Details:"));
    console.log(chalk.white("Stream ID:"), streamId);
  } catch (error: unknown) {
    spinner.fail(chalk.red("Failed to create stream"));
    if (error instanceof Error) {
      if ("code" in error && error.code === "ENOENT") {
        throw new Error(`Metadata file not found at: ${metadataPath}`);
      }
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}
