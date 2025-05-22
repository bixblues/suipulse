#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { createStream } from "./commands/createStream";
import { watchStream } from "./commands/subscribeToEvents";
import { updateStream } from "./commands/updateStream";
import { createSnapshot } from "./commands/createSnapshot";
import { joinStream } from "./commands/addSubscriber";
import { composeStreams } from "./commands/composeStreams";
import { getSnapshotData } from "./commands/getSnapshotData";
import { updateSnapshot } from "./commands/updateSnapshot";
import { updateSnapshotMetadata } from "./commands/updateSnapshotMetadata";
import { verifySnapshotStream } from "./commands/verifySnapshotStream";
import { createStreamsBatch } from "./commands/createStreamsBatch";
import { updateStreamsBatch } from "./commands/updateStreamsBatch";
import {
  CreateOptions,
  SubscribeOptions,
  UpdateOptions,
  SnapshotOptions,
  SubscriberOptions,
  ComposeOptions,
  SnapshotDataOptions,
  SnapshotUpdateOptions,
  SnapshotVerifyOptions,
  BatchCreateOptions,
  BatchUpdateOptions,
} from "./types";
import { addPermission } from "./commands/addPermission";
import { getDataStream } from "./commands/getDataStream";
import { isSubscribed } from "./commands/isSubscribed";
import { transferSnapshot } from "./commands/transferSnapshot";
import { getSnapshotStreamId } from "./commands/getSnapshotStreamId";
import { setNetwork } from "./commands/setNetwork";
import { setCustomConfig } from "./commands/setCustomConfig";

const program = new Command();

// Custom help formatter
program.configureHelp({
  sortSubcommands: true,
  sortOptions: true,
  showGlobalOptions: true,
  formatHelp: (cmd, helper) => {
    const termWidth = process.stdout.columns || 80;
    const helpWidth = Math.min(termWidth, 120);
    const indent = "  ";

    // Header
    let output = chalk.bold.blue(
      "\nSuiPulse CLI - Data Stream Management Tool\n"
    );
    output += chalk.gray("=".repeat(helpWidth)) + "\n\n";

    // Description
    if (cmd.description()) {
      output += chalk.white(cmd.description()) + "\n\n";
    }

    // Usage
    output += chalk.bold("Usage:\n");
    output += indent + chalk.white(helper.commandUsage(cmd)) + "\n\n";

    // Options
    const options = helper.visibleOptions(cmd);
    if (options.length > 0) {
      output += chalk.bold("Options:\n");
      options.forEach((option) => {
        const flags = option.flags;
        const description = option.description;
        output += indent + chalk.cyan(flags);
        output += " ".repeat(Math.max(1, 30 - flags.length));
        output += chalk.white(description) + "\n";
      });
      output += "\n";
    }

    // Commands
    const commands = helper.visibleCommands(cmd);
    if (commands.length > 0) {
      output += chalk.bold("Commands:\n");

      // Custom sorting function to prioritize stream commands
      const commandOrder: Record<string, number> = {
        stream: 1,
        snapshot: 2,
        permission: 3,
        batch: 4,
        config: 5,
      };

      const sortedCommands = [...commands].sort((a, b) => {
        const orderA = commandOrder[a.name()] || 99;
        const orderB = commandOrder[b.name()] || 99;
        return orderA - orderB;
      });

      sortedCommands.forEach((command) => {
        const name = command.name();
        const description = command.description();
        output += indent + chalk.green(name);
        output += " ".repeat(Math.max(1, 30 - name.length));
        output += chalk.white(description) + "\n";

        // Add subcommands if they exist
        const subcommands = command.commands;
        if (subcommands && subcommands.length > 0) {
          // Sort subcommands alphabetically
          const sortedSubcommands = [...subcommands].sort((a, b) =>
            a.name().localeCompare(b.name())
          );
          sortedSubcommands.forEach((subcmd) => {
            const subName = subcmd.name();
            const subDesc = subcmd.description();
            output += indent + "  " + chalk.green(name + " " + subName);
            output += " ".repeat(
              Math.max(1, 28 - (name.length + subName.length + 1))
            );
            output += chalk.white(subDesc) + "\n";
          });
        }
      });
      output += "\n";
    }

    // Examples
    if (cmd.name() === "suipulse") {
      output += chalk.bold("Examples:\n");
      // Stream examples first
      output +=
        indent +
        chalk.white("suipulse stream create --metadata path/to/metadata.json") +
        "\n";
      output +=
        indent + chalk.white("suipulse stream watch --id <stream-id>") + "\n";
      output +=
        indent +
        chalk.white(
          "suipulse stream update --id <stream-id> --data path/to/data.json"
        ) +
        "\n";
      // Snapshot examples
      output +=
        indent +
        chalk.white("suipulse snapshot create --stream-id <stream-id>") +
        "\n";
      // Permission examples
      output +=
        indent +
        chalk.white(
          "suipulse permission add --id <stream-id> --address <address> --level 1"
        ) +
        "\n";
      // Config examples
      output +=
        indent +
        chalk.white("suipulse config set-network --network testnet") +
        "\n";
      output += "\n";
    }

    // Footer
    output += chalk.gray(
      "For more information, visit: https://github.com/suipulse/suipulse\n"
    );
    output += chalk.gray("=".repeat(helpWidth)) + "\n";

    return output;
  },
});

// Global error handler
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(chalk.red("Error:"), error.message);
  }
  process.exit(1);
};

program
  .name("suipulse")
  .description(
    chalk.white(
      "A powerful CLI tool for managing data streams on the Sui blockchain.\n\n" +
        "Features:\n" +
        "  • Create and manage data streams\n" +
        "  • Create and verify snapshots\n" +
        "  • Manage stream permissions\n" +
        "  • Batch operations\n" +
        "  • Network configuration\n\n" +
        "Use 'suipulse <command> --help' for more information about a command."
    )
  )
  .version("0.1.0")
  .option("--network <network>", "Network to use (mainnet/testnet)", "mainnet");

// Stream commands
const streamCommands = program
  .command("stream")
  .description(
    chalk.white(
      "Stream management commands for creating, updating, and monitoring data streams.\n\n" +
        "Streams are the primary data structure in SuiPulse, allowing you to:\n" +
        "  • Create new data streams with metadata\n" +
        "  • Update stream data\n" +
        "  • Subscribe to stream events\n" +
        "  • Manage stream permissions\n" +
        "  • Query stream information"
    )
  );

streamCommands
  .command("create")
  .description(
    chalk.white(
      "Create a new data stream with specified metadata.\n\n" +
        "The metadata file should be a JSON file containing:\n" +
        "  • name: Stream name\n" +
        "  • description: Stream description\n" +
        "  • tags: Array of tags\n" +
        "  • version: Initial version\n\n" +
        "Example metadata.json:\n" +
        "  {\n" +
        '    "name": "My Stream",\n' +
        '    "description": "A test data stream",\n' +
        '    "tags": ["test", "example"],\n' +
        '    "version": "1.0.0"\n' +
        "  }"
    )
  )
  .requiredOption("--metadata <path>", "Path to metadata JSON file")
  .action(async (options: CreateOptions) => {
    try {
      await createStream(options.metadata, program.opts().network);
    } catch (error) {
      handleError(error);
    }
  });

streamCommands
  .command("watch")
  .description(
    chalk.white(
      "Subscribe to stream events in real-time.\n\n" +
        "This command allows you to:\n" +
        "  • Monitor stream updates\n" +
        "  • Watch for new subscribers\n" +
        "  • Track permission changes\n" +
        "  • Receive event notifications\n\n" +
        "Press Ctrl+C to stop watching."
    )
  )
  .requiredOption("--id <id>", "Stream ID to subscribe to")
  .option("--event-type <type>", "Type of event to subscribe to")
  .action(async (options: SubscribeOptions) => {
    try {
      await watchStream(options.id, options.eventType, program.opts().network);
    } catch (error) {
      handleError(error);
    }
  });

streamCommands
  .command("update")
  .description(
    chalk.white(
      "Update a data stream with new data.\n\n" +
        "The data file should be a JSON file containing the new data to append.\n" +
        "Only stream owners can update the stream.\n\n" +
        "Example data.json:\n" +
        "  {\n" +
        '    "timestamp": "2024-03-20T12:00:00Z",\n' +
        '    "value": 42,\n' +
        '    "metadata": "Update metadata"\n' +
        "  }"
    )
  )
  .requiredOption("--id <id>", "Stream ID to update")
  .requiredOption("--data <path>", "Path to data JSON file")
  .action(async (options: UpdateOptions) => {
    try {
      await updateStream(options.id, options.data, program.opts().network);
    } catch (error) {
      handleError(error);
    }
  });

streamCommands
  .command("join")
  .description(
    chalk.white(
      "Add your address as a subscriber to a stream.\n\n" +
        "This command:\n" +
        "  • Adds your address to the stream's subscribers\n" +
        "  • Allows you to receive stream updates\n" +
        "  • Enables stream event notifications\n\n" +
        "Note: Some streams may require permission to join."
    )
  )
  .requiredOption("--id <id>", "Stream ID")
  .action(async (options: SubscriberOptions) => {
    try {
      await joinStream(options.id, program.opts().network);
    } catch (error) {
      handleError(error);
    }
  });

streamCommands
  .command("compose")
  .description(
    chalk.white(
      "Compose multiple streams into a parent-child relationship.\n\n" +
        "This command:\n" +
        "  • Links a child stream to a parent stream\n" +
        "  • Enables hierarchical data organization\n" +
        "  • Maintains stream relationships\n\n" +
        "Note: Both streams must exist and you must have permission to compose them."
    )
  )
  .requiredOption("--parent-id <id>", "Parent stream ID")
  .requiredOption("--child-id <id>", "Child stream ID")
  .action(async (options: ComposeOptions) => {
    try {
      await composeStreams(
        options.parentId,
        options.childId,
        program.opts().network
      );
    } catch (error) {
      handleError(error);
    }
  });

streamCommands
  .command("get")
  .description(
    "Get stream data and metadata\n\n" +
      "Retrieves the complete stream object including:\n" +
      "- Stream data\n" +
      "- Metadata\n" +
      "- Owner information\n" +
      "- Subscriber list\n" +
      "- Version information\n\n" +
      "Example:\n" +
      "  suipulse stream get --id 0x123"
  )
  .requiredOption("--id <id>", "Stream ID")
  .action(async (options: { id: string }) => {
    try {
      await getDataStream(options.id, program.opts().network);
    } catch (error) {
      handleError(error);
    }
  });

streamCommands
  .command("check-subscription")
  .description(
    "Check if an address is subscribed to a stream\n\n" +
      "Verifies whether a given address has subscribed to the specified stream.\n" +
      "Useful for checking subscription status before performing operations.\n\n" +
      "Example:\n" +
      "  suipulse stream check-subscription --id 0x123 --address 0x456"
  )
  .requiredOption("--id <id>", "Stream ID")
  .requiredOption("--address <address>", "Address to check")
  .action(async (options: { id: string; address: string }) => {
    try {
      await isSubscribed(options.id, options.address, program.opts().network);
    } catch (error) {
      handleError(error);
    }
  });

// Add examples to each command group
streamCommands.addHelpText(
  "after",
  "\nExamples:\n" +
    "  suipulse stream create --metadata path/to/metadata.json\n" +
    "  suipulse stream watch --id 0x123\n" +
    "  suipulse stream update --id 0x123 --data path/to/data.json"
);

// Snapshot commands
const snapshotCommands = program
  .command("snapshot")
  .description(
    chalk.white(
      "Snapshot management commands for creating and managing stream snapshots.\n\n" +
        "Snapshots allow you to:\n" +
        "  • Capture stream state at a point in time\n" +
        "  • Verify stream integrity\n" +
        "  • Transfer snapshot ownership\n" +
        "  • Update snapshot data and metadata"
    )
  );

snapshotCommands
  .command("create")
  .description(
    chalk.white(
      "Create a snapshot of a stream's current state.\n\n" +
        "This command:\n" +
        "  • Captures the current stream data\n" +
        "  • Records the stream version\n" +
        "  • Creates a new snapshot object\n" +
        "  • Transfers ownership to the creator\n\n" +
        "Note: You must have read access to the stream."
    )
  )
  .requiredOption("--stream-id <id>", "Stream ID to snapshot")
  .action(async (options: SnapshotOptions) => {
    try {
      await createSnapshot(options.streamId, program.opts().network);
    } catch (error) {
      handleError(error);
    }
  });

snapshotCommands
  .command("get")
  .description(
    chalk.white(
      "Get snapshot data and metadata.\n\n" +
        "This command retrieves:\n" +
        "  • Snapshot data\n" +
        "  • Creation timestamp\n" +
        "  • Stream version\n" +
        "  • Metadata\n" +
        "  • Creator information"
    )
  )
  .requiredOption("--id <id>", "Snapshot ID")
  .action(async (options: SnapshotDataOptions) => {
    try {
      await getSnapshotData(options.id, program.opts().network);
    } catch (error) {
      handleError(error);
    }
  });

snapshotCommands
  .command("update")
  .description(
    chalk.white(
      "Update snapshot data.\n\n" +
        "This command:\n" +
        "  • Updates the snapshot's data\n" +
        "  • Preserves the original timestamp\n" +
        "  • Maintains version information\n\n" +
        "Note: Only the snapshot owner can update the data."
    )
  )
  .requiredOption("--id <id>", "Snapshot ID")
  .requiredOption("--data <path>", "Path to data JSON file")
  .action(async (options: SnapshotUpdateOptions) => {
    try {
      if (!options.data) {
        throw new Error("Data path is required");
      }
      await updateSnapshot(options.id, options.data, program.opts().network);
    } catch (error) {
      handleError(error);
    }
  });

snapshotCommands
  .command("update-metadata")
  .description(
    chalk.white(
      "Update snapshot metadata.\n\n" +
        "This command:\n" +
        "  • Updates the snapshot's metadata\n" +
        "  • Preserves all other snapshot data\n" +
        "  • Maintains version information\n\n" +
        "Note: Only the snapshot owner can update the metadata."
    )
  )
  .requiredOption("--id <id>", "Snapshot ID")
  .requiredOption("--metadata <metadata>", "New metadata")
  .action(async (options: SnapshotUpdateOptions) => {
    try {
      if (!options.metadata) {
        throw new Error("Metadata is required");
      }
      await updateSnapshotMetadata(
        options.id,
        options.metadata,
        program.opts().network
      );
    } catch (error) {
      handleError(error);
    }
  });

snapshotCommands
  .command("verify")
  .description(
    chalk.white(
      "Verify if a snapshot belongs to a stream.\n\n" +
        "This command:\n" +
        "  • Validates snapshot-stream relationship\n" +
        "  • Checks version compatibility\n" +
        "  • Verifies data integrity\n\n" +
        "Useful for ensuring snapshot authenticity."
    )
  )
  .requiredOption("--id <id>", "Snapshot ID")
  .requiredOption("--stream-id <id>", "Stream ID")
  .action(async (options: SnapshotVerifyOptions) => {
    try {
      await verifySnapshotStream(
        options.id,
        options.streamId,
        program.opts().network
      );
    } catch (error) {
      handleError(error);
    }
  });

snapshotCommands
  .command("transfer")
  .description(
    "Transfer a snapshot to a new owner\n\n" +
      "Transfers ownership of a snapshot to another address.\n" +
      "Only the current owner can transfer the snapshot.\n\n" +
      "Example:\n" +
      "  suipulse snapshot transfer --id 0x123 --recipient 0x456"
  )
  .requiredOption("--id <id>", "Snapshot ID")
  .requiredOption("--recipient <address>", "Recipient address")
  .action(async (options: { id: string; recipient: string }) => {
    try {
      await transferSnapshot(
        options.id,
        options.recipient,
        program.opts().network
      );
    } catch (error) {
      handleError(error);
    }
  });

snapshotCommands
  .command("get-stream-id")
  .description(
    "Get the stream ID associated with a snapshot\n\n" +
      "Retrieves the ID of the stream that a snapshot belongs to.\n" +
      "Useful for verifying snapshot ownership and relationships.\n\n" +
      "Example:\n" +
      "  suipulse snapshot get-stream-id --id 0x123"
  )
  .requiredOption("--id <id>", "Snapshot ID")
  .action(async (options: { id: string }) => {
    try {
      await getSnapshotStreamId(options.id, program.opts().network);
    } catch (error) {
      handleError(error);
    }
  });

// Add examples to each command group
snapshotCommands.addHelpText(
  "after",
  "\nExamples:\n" +
    "  suipulse snapshot create --stream-id 0x123\n" +
    "  suipulse snapshot get --id 0x456\n" +
    "  suipulse snapshot update --id 0x456 --data path/to/data.json"
);

// Batch commands
const batchCommands = program
  .command("batch")
  .description(
    chalk.white(
      "Batch operation commands for managing multiple streams.\n\n" +
        "Batch operations allow you to:\n" +
        "  • Create multiple streams in one transaction\n" +
        "  • Update multiple streams efficiently\n" +
        "  • Process operations in parallel\n" +
        "  • Handle large-scale stream management"
    )
  );

batchCommands
  .command("create")
  .description(
    chalk.white(
      "Create multiple streams in batch.\n\n" +
        "The config file should be a JSON file containing:\n" +
        "  • streams: Array of stream configurations\n" +
        "  • options: Batch operation options\n\n" +
        "Example config.json:\n" +
        "  {\n" +
        '    "streams": [\n' +
        "      {\n" +
        '        "name": "Stream 1",\n' +
        '        "description": "First stream"\n' +
        "      },\n" +
        "      {\n" +
        '        "name": "Stream 2",\n' +
        '        "description": "Second stream"\n' +
        "      }\n" +
        "    ],\n" +
        '    "options": {\n' +
        '      "parallel": true\n' +
        "    }\n" +
        "  }"
    )
  )
  .requiredOption("--config <path>", "Path to batch configuration JSON file")
  .option("--parallel", "Run operations in parallel", false)
  .action(async (options: BatchCreateOptions) => {
    try {
      await createStreamsBatch(
        options.config,
        options.parallel,
        program.opts().network
      );
    } catch (error) {
      handleError(error);
    }
  });

batchCommands
  .command("update")
  .description(
    chalk.white(
      "Update multiple streams in batch.\n\n" +
        "The config file should be a JSON file containing:\n" +
        "  • updates: Array of stream updates\n" +
        "  • options: Batch operation options\n\n" +
        "Example config.json:\n" +
        "  {\n" +
        '    "updates": [\n' +
        "      {\n" +
        '        "streamId": "0x123",\n' +
        '        "data": "path/to/data1.json"\n' +
        "      },\n" +
        "      {\n" +
        '        "streamId": "0x456",\n' +
        '        "data": "path/to/data2.json"\n' +
        "      }\n" +
        "    ],\n" +
        '    "options": {\n' +
        '      "parallel": true\n' +
        "    }\n" +
        "  }"
    )
  )
  .requiredOption(
    "--config <path>",
    "Path to batch update configuration JSON file"
  )
  .option("--parallel", "Run operations in parallel", false)
  .action(async (options: BatchUpdateOptions) => {
    try {
      await updateStreamsBatch(
        options.config,
        options.parallel,
        program.opts().network
      );
    } catch (error) {
      handleError(error);
    }
  });

// Add examples to each command group
batchCommands.addHelpText(
  "after",
  "\nExamples:\n" +
    "  suipulse batch create --config path/to/batch-config.json\n" +
    "  suipulse batch update --config path/to/batch-update-config.json"
);

// Permission commands
const permissionCommands = program
  .command("permission")
  .description(
    chalk.white(
      "Permission management commands for controlling stream access.\n\n" +
        "Permissions allow you to:\n" +
        "  • Grant read access to streams\n" +
        "  • Allow write operations\n" +
        "  • Assign admin privileges\n" +
        "  • Manage access control"
    )
  );

permissionCommands
  .command("add")
  .description(
    chalk.white(
      "Add permission for an address to a stream.\n\n" +
        "Permission levels:\n" +
        "  0: Read-only access\n" +
        "    • Can view stream data\n" +
        "    • Can create snapshots\n" +
        "    • Cannot modify stream\n\n" +
        "  1: Write access\n" +
        "    • Can update stream data\n" +
        "    • Can modify metadata\n" +
        "    • Cannot manage permissions\n\n" +
        "  2: Admin access\n" +
        "    • Full control over stream\n" +
        "    • Can manage permissions\n" +
        "    • Can transfer ownership"
    )
  )
  .requiredOption("--id <id>", "Stream ID")
  .requiredOption("--address <address>", "Address to grant permission to")
  .requiredOption(
    "--level <level>",
    "Permission level (0: read, 1: write, 2: admin)"
  )
  .action(async (options: { id: string; address: string; level: string }) => {
    try {
      await addPermission(
        options.id,
        options.address,
        parseInt(options.level),
        program.opts().network
      );
    } catch (error) {
      handleError(error);
    }
  });

// Add examples to each command group
permissionCommands.addHelpText(
  "after",
  "\nExamples:\n" +
    "  suipulse permission add --id 0x123 --address 0x456 --level 1\n" +
    "  suipulse permission add --id 0x123 --address 0x456 --level 2"
);

// Network configuration commands
const configCommands = program
  .command("config")
  .description(
    chalk.white(
      "Network configuration commands for managing SuiPulse connections.\n\n" +
        "Configuration options:\n" +
        "  • Switch between networks\n" +
        "  • Set custom network parameters\n" +
        "  • Configure package IDs\n" +
        "  • Manage network settings"
    )
  );

configCommands
  .command("set-network")
  .description(
    chalk.white(
      "Set the network configuration.\n\n" +
        "Available networks:\n" +
        "  mainnet: Production network\n" +
        "    • Stable and reliable\n" +
        "    • Real SUI tokens\n" +
        "    • Production package IDs\n\n" +
        "  testnet: Testing network\n" +
        "    • Free test tokens\n" +
        "    • Development package IDs\n" +
        "    • Testing environment\n\n" +
        "  custom: Custom network\n" +
        "    • Requires URL and package ID\n" +
        "    • For private deployments"
    )
  )
  .requiredOption(
    "--network <network>",
    "Network to use (mainnet/testnet/custom)"
  )
  .action(async (options: { network: string }) => {
    try {
      await setNetwork(options.network);
    } catch (error) {
      handleError(error);
    }
  });

configCommands
  .command("set-custom")
  .description(
    chalk.white(
      "Set a custom network configuration.\n\n" +
        "This command allows you to:\n" +
        "  • Connect to private networks\n" +
        "  • Use custom package IDs\n" +
        "  • Configure development environments\n\n" +
        "Note: Custom networks must be compatible with SuiPulse protocol."
    )
  )
  .requiredOption("--url <url>", "Custom network URL")
  .requiredOption("--package-id <id>", "Custom package ID")
  .action(async (options: { url: string; packageId: string }) => {
    try {
      await setCustomConfig(options.url, options.packageId);
    } catch (error) {
      handleError(error);
    }
  });

// Add examples to each command group
configCommands.addHelpText(
  "after",
  "\nExamples:\n" +
    "  suipulse config set-network --network testnet\n" +
    "  suipulse config set-custom --url https://custom.network --package-id 0x789"
);

program.parse();
