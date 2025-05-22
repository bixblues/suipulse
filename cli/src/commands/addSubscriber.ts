import { Network, SuiPulse } from "@suipulse/sdk";
import chalk from "chalk";
import ora from "ora";
import { getActiveSuiKeypair } from "../utils";

export async function joinStream(
  streamId: string,
  network: string = "mainnet"
): Promise<void> {
  const spinner = ora("Joining stream...").start();

  try {
    // Get keypair from Sui CLI active account
    const keypair = getActiveSuiKeypair();

    // Initialize SuiPulse with network
    const suiPulse = new SuiPulse(keypair, network as Network);

    spinner.text = "Adding your address as a subscriber...";

    // Add the subscriber using SDK
    const result = await suiPulse.subscribeToStream(streamId);

    spinner.succeed(chalk.green("Successfully joined the stream!"));
    console.log(chalk.blue("\nTransaction Details:"));
    console.log(chalk.white("Transaction:"), result.digest);
  } catch (error: unknown) {
    spinner.fail(chalk.red("Failed to join stream"));
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}
