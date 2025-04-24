# SuiPulse SDK

A TypeScript SDK for interacting with the SuiPulse protocol on the Sui blockchain.

## Installation

```bash
npm install suipulse-sdk
# or
yarn add suipulse-sdk
```

## Quick Start

```typescript
import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiPulse } from "suipulse-sdk";

// Initialize SDK
const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
const keypair = Ed25519Keypair.generate(); // Or import your own keypair
const packageId = "YOUR_PACKAGE_ID"; // Use appropriate package ID for the network

const suiPulse = new SuiPulse(client, packageId, keypair);

// Create a data stream
const stream = await suiPulse.createStream({
  name: "My Stream",
  description: "Example stream",
  isPublic: true,
  metadata: new Uint8Array([1, 2, 3]),
  tags: ["example"],
});

// Subscribe to updates
const unsubscribe = suiPulse.events.subscribeToStreamUpdates((event) => {
  console.log("Stream updated:", event);
});

// Cleanup when done
unsubscribe();
suiPulse.cleanup();
```

## Features

- Create and manage data streams
- Real-time event subscriptions
- Batch operations support
- Snapshot creation and management
- Type-safe API with comprehensive validation

## Configuration

The SDK supports different network configurations:

```typescript
const config = {
  packageId: "YOUR_PACKAGE_ID",
  network: "testnet", // or "mainnet", "devnet", "localnet"
  endpoints: {
    fullnode: "https://fullnode.testnet.sui.io:443",
    websocket: "wss://fullnode.testnet.sui.io/websocket",
  },
};

const suiPulse = new SuiPulse(client, config);
```

## Error Handling

The SDK provides detailed error messages and validation:

```typescript
try {
  await suiPulse.updateStream(streamId, data);
} catch (error) {
  if (error instanceof SuiPulseError) {
    console.error("SDK Error:", error.message);
    console.error("Error Type:", error.type);
  }
}
```

## Examples

Check out the `examples` directory for more detailed usage examples:

- Basic usage: `examples/basic-usage.ts`
- Event handling: `examples/events.ts`
- Batch operations: `examples/batch-operations.ts`

## Contributing

Contributions are welcome! Please check out our contributing guidelines for details.

## License

MIT
