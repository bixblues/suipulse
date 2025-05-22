import { Network, SuiPulse } from "@suipulse/sdk";
import chalk from "chalk";
import ora from "ora";
import { getActiveSuiKeypair } from "../utils";

export async function getSnapshotData(
  snapshotId: string,
  network: string = "mainnet"
): Promise<void> {
  const spinner = ora("Getting snapshot data...").start();

  try {
    // Get keypair from Sui CLI active account
    const keypair = getActiveSuiKeypair();

    // Initialize SuiPulse
    const suiPulse = new SuiPulse(keypair, network as Network);

    spinner.text = "Retrieving snapshot data...";

    // Get the snapshot data using SDK
    const snapshot = await suiPulse.getSnapshotData(snapshotId);

    spinner.succeed(chalk.green("Snapshot data retrieved successfully!"));
    console.log(chalk.blue("\nSnapshot Details:"));
    console.log(chalk.white("ID:"), snapshot.id);
    console.log(chalk.white("Stream ID:"), snapshot.streamId);
    console.log(chalk.white("Timestamp:"), snapshot.timestamp);
    console.log(chalk.white("Version:"), snapshot.version);
    console.log(chalk.white("Metadata:"), snapshot.metadata);
    console.log(chalk.white("Creator:"), snapshot.creator);
    console.log(chalk.white("Data:"), snapshot.data);
  } catch (error: unknown) {
    spinner.fail(chalk.red("Failed to get snapshot data"));
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}
