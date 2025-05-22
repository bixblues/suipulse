import { readFileSync } from "fs";
import { Network, SuiPulse } from "@suipulse/sdk";
import chalk from "chalk";
import ora from "ora";
import { getActiveSuiKeypair } from "../utils";

interface StreamUpdate {
  streamId: string;
  data: string | Uint8Array;
}

interface BatchUpdateConfig {
  updates: StreamUpdate[];
}

export async function updateStreamsBatch(
  configPath: string,
  parallel: boolean = false,
  network: string = "mainnet"
): Promise<void> {
  const spinner = ora("Updating streams in batch...").start();

  try {
    // Read batch configuration file
    const config = JSON.parse(
      readFileSync(configPath, "utf-8")
    ) as BatchUpdateConfig;

    // Get keypair from Sui CLI active account
    const keypair = getActiveSuiKeypair();

    // Initialize SuiPulse
    const suiPulse = new SuiPulse(keypair, network as Network);

    spinner.text = "Updating streams...";

    // Update streams in batch using SDK
    const result = await suiPulse.updateStreamsBatch({
      updates: config.updates.map((update: StreamUpdate) => ({
        streamId: update.streamId,
        data:
          typeof update.data === "string"
            ? new Uint8Array(Buffer.from(update.data, "utf-8"))
            : update.data,
      })),
      options: { parallel },
    });

    spinner.succeed(chalk.green("Batch stream update completed!"));
    console.log(chalk.blue("\nBatch Operation Summary:"));
    console.log(chalk.white("Total:"), result.summary.total);
    console.log(chalk.white("Succeeded:"), result.summary.succeeded);
    console.log(chalk.white("Failed:"), result.summary.failed);

    if (result.failed.length > 0) {
      console.log(chalk.yellow("\nFailed Operations:"));
      result.failed.forEach((failure) => {
        console.log(chalk.red("Stream:"), failure.item.streamId);
        console.log(chalk.red("Error:"), failure.error.message);
      });
    }
  } catch (error: unknown) {
    spinner.fail(chalk.red("Failed to update streams in batch"));
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}
