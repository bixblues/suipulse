import { SuiPulse, Network } from "@suipulse/sdk";
import chalk from "chalk";
import ora from "ora";
import { getActiveSuiKeypair } from "../utils";

export async function watchStream(
  streamId: string,
  eventType?: string,
  network: string = "mainnet"
): Promise<void> {
  const spinner = ora("Setting up stream watch...").start();

  try {
    // Get keypair from Sui CLI active account
    const keypair = getActiveSuiKeypair();

    // Initialize SuiPulse
    const suiPulse = new SuiPulse(
      keypair,
      network === "mainnet" ? Network.MAINNET : Network.TESTNET
    );

    spinner.text = "Subscribing to stream updates...";

    // Subscribe to stream updates
    const unsubscribe = suiPulse.events.subscribeToStreamUpdates((event) => {
      if (event.stream_id === streamId) {
        console.log(chalk.blue("\nReceived Stream Update Event:"));
        console.log("Stream ID:", event.stream_id);
        console.log("Timestamp:", event.timestamp);
      }
    });

    spinner.succeed(chalk.green("Watching stream events successfully!"));
    console.log(chalk.blue("\nListening for events... Press Ctrl+C to exit"));

    // Keep the process running
    process.on("SIGINT", () => {
      unsubscribe();
      process.exit(0);
    });
  } catch (error: unknown) {
    spinner.fail(chalk.red("Failed to watch stream events"));
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}
