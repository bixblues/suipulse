import { Network, SuiPulse } from "@suipulse/sdk";
import chalk from "chalk";
import ora from "ora";
import { getActiveSuiKeypair } from "../utils";

interface SnapshotCreatedEvent {
  parsedJson: {
    snapshot_id: string;
  };
}

export async function createSnapshot(
  streamId: string,
  network: string = "mainnet"
): Promise<void> {
  const spinner = ora("Creating snapshot...").start();

  try {
    // Get keypair from Sui CLI active account
    const keypair = getActiveSuiKeypair();

    // Initialize SuiPulse
    const suiPulse = new SuiPulse(keypair, network as Network);

    spinner.text = "Creating snapshot...";

    // Create the snapshot using SDK with default metadata
    const result = await suiPulse.createSnapshot(streamId, {
      metadata: `Snapshot for stream ${streamId} - Created via CLI`,
    });

    // Get the snapshot ID from the SnapshotCreated event
    const snapshotCreatedEvent = result.events?.find(
      (event) =>
        event.type === `${suiPulse.packageId}::storage::SnapshotCreated`
    ) as SnapshotCreatedEvent | undefined;

    if (!snapshotCreatedEvent) {
      throw new Error("Snapshot created event not found");
    }

    const snapshotId = snapshotCreatedEvent.parsedJson.snapshot_id;

    spinner.succeed(chalk.green("Snapshot created successfully!"));
    console.log(chalk.blue("\nSnapshot Details:"));
    console.log(chalk.white("Snapshot ID:"), snapshotId);
    console.log(chalk.white("Transaction:"), result.digest);
  } catch (error: unknown) {
    spinner.fail(chalk.red("Failed to create snapshot"));
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}
