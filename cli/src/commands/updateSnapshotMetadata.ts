import { Network, SuiPulse } from "@suipulse/sdk";
import chalk from "chalk";
import ora from "ora";
import { getActiveSuiKeypair } from "../utils";

export async function updateSnapshotMetadata(
  snapshotId: string,
  metadata: string,
  network: string = "mainnet"
): Promise<void> {
  const spinner = ora("Updating snapshot metadata...").start();

  try {
    // Get keypair from Sui CLI active account
    const keypair = getActiveSuiKeypair();

    // Initialize SuiPulse
    const suiPulse = new SuiPulse(keypair, network as Network);

    spinner.text = "Updating snapshot metadata...";

    // Update the snapshot metadata using SDK
    const result = await suiPulse.updateSnapshotMetadata(snapshotId, metadata);

    spinner.succeed(chalk.green("Snapshot metadata updated successfully!"));
    console.log(chalk.blue("\nUpdate Details:"));
    console.log(chalk.white("Transaction:"), result.digest);
  } catch (error: unknown) {
    spinner.fail(chalk.red("Failed to update snapshot metadata"));
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}
