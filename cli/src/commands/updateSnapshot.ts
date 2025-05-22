import { readFileSync } from "fs";
import { Network, SuiPulse } from "@suipulse/sdk";
import chalk from "chalk";
import ora from "ora";
import { getActiveSuiKeypair } from "../utils";

export async function updateSnapshot(
  snapshotId: string,
  dataPath: string,
  network: string = "mainnet"
): Promise<void> {
  const spinner = ora("Updating snapshot...").start();

  try {
    // Read data file
    const data = JSON.parse(readFileSync(dataPath, "utf-8"));

    // Get keypair from Sui CLI active account
    const keypair = getActiveSuiKeypair();

    // Initialize SuiPulse
    const suiPulse = new SuiPulse(keypair, network as Network);

    spinner.text = "Updating snapshot with data...";

    // Update the snapshot using SDK
    const result = await suiPulse.updateSnapshot(
      snapshotId,
      new Uint8Array(data)
    );

    spinner.succeed(chalk.green("Snapshot updated successfully!"));
    console.log(chalk.blue("\nUpdate Details:"));
    console.log(chalk.white("Transaction:"), result.digest);
  } catch (error: unknown) {
    spinner.fail(chalk.red("Failed to update snapshot"));
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}
