import { readFileSync } from "fs";
import { Network, SuiPulse } from "@suipulse/sdk";
import chalk from "chalk";
import ora from "ora";
import { getActiveSuiKeypair } from "../utils";

export async function updateStream(
  streamId: string,
  dataPath: string,
  network: string = "mainnet"
): Promise<void> {
  const spinner = ora("Updating stream...").start();

  try {
    // Read data file
    const data = JSON.parse(readFileSync(dataPath, "utf-8"));
    const dataString = JSON.stringify(data);
    const dataArray = new Uint8Array(Buffer.from(dataString));

    // Get keypair from Sui CLI active account
    const keypair = getActiveSuiKeypair();

    // Initialize SuiPulse
    const suiPulse = new SuiPulse(keypair, network as Network);

    spinner.text = "Updating stream with data...";

    // Update the stream using SDK
    const result = await suiPulse.updateStream(streamId, dataArray);

    spinner.succeed(chalk.green("Stream updated successfully!"));
    console.log(chalk.blue("\nUpdate Details:"));
    console.log(chalk.white("Transaction:"), result.digest);
  } catch (error: unknown) {
    spinner.fail(chalk.red("Failed to update stream"));
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}
