import { Network, SuiPulse } from "@suipulse/sdk";
import chalk from "chalk";
import ora from "ora";
import { getActiveSuiKeypair } from "../utils";

export async function verifySnapshotStream(
  snapshotId: string,
  streamId: string,
  network: string = "mainnet"
): Promise<void> {
  const spinner = ora("Verifying snapshot stream relationship...").start();

  try {
    // Get keypair from Sui CLI active account
    const keypair = getActiveSuiKeypair();

    // Initialize SuiPulse
    const suiPulse = new SuiPulse(keypair, network as Network);

    spinner.text = "Verifying relationship...";

    // Verify the snapshot stream relationship using SDK
    const isValid = await suiPulse.verifySnapshotStream(snapshotId, streamId);

    if (isValid) {
      spinner.succeed(chalk.green("Snapshot belongs to the specified stream!"));
    } else {
      spinner.fail(
        chalk.red("Snapshot does not belong to the specified stream")
      );
    }
  } catch (error: unknown) {
    spinner.fail(chalk.red("Failed to verify snapshot stream relationship"));
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}
