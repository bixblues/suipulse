import { Network, SuiPulse } from "@suipulse/sdk";
import chalk from "chalk";
import ora from "ora";
import { getActiveSuiKeypair } from "../utils";

export async function composeStreams(
  parentId: string,
  childId: string,
  network: string = "mainnet"
): Promise<void> {
  const spinner = ora("Composing streams...").start();

  try {
    // Get keypair from Sui CLI active account
    const keypair = getActiveSuiKeypair();

    // Initialize SuiPulse
    const suiPulse = new SuiPulse(keypair, network as Network);

    spinner.text = "Composing streams...";

    // Compose the streams using SDK
    const result = await suiPulse.composeStreams(parentId, childId);

    spinner.succeed(chalk.green("Streams composed successfully!"));
    console.log(chalk.blue("\nTransaction Details:"));
    console.log(chalk.white("Transaction:"), result.digest);
  } catch (error: unknown) {
    spinner.fail(chalk.red("Failed to compose streams"));
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}
