# SuiPulse SDK

A powerful TypeScript SDK for building real-time data streaming applications on the Sui blockchain. SuiPulse SDK provides a developer-friendly interface for creating, managing, and subscribing to high-performance data streams with enterprise-grade security.

## 🌟 Features

- **Real-time Data Streaming**: Create and manage data streams with sub-second latency
- **Type-safe API**: Full TypeScript support with comprehensive type definitions
- **Event System**: Real-time event subscriptions with WebSocket support
- **Batch Operations**: Efficient bulk stream creation and updates
- **Snapshot Management**: Create and manage point-in-time data snapshots
- **Permission Control**: Granular access management for stream subscribers
- **Stream Composition**: Build hierarchical relationships between streams
- **Built-in Validation**: Comprehensive input validation and error handling

## 📦 Installation

```bash
# Using npm
npm install @suipulse/sdk

# Using yarn
yarn add @suipulse/sdk

# Using pnpm
pnpm add @suipulse/sdk
```

## 🚀 Quick Start

```typescript
import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiPulse } from "@suipulse/sdk";

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

## ⚙️ Configuration

### Network Configuration

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

### Stream Configuration

```typescript
const streamConfig = {
  name: "My Stream",
  description: "Example stream",
  isPublic: true,
  metadata: new Uint8Array([1, 2, 3]),
  tags: ["example"],
  parentStreamId: "optional_parent_stream_id", // For stream composition
  accessControl: {
    allowedSubscribers: ["address1", "address2"],
    requireApproval: true,
  },
};
```

## 🔄 Stream Operations

### Create Stream

```typescript
const stream = await suiPulse.createStream(streamConfig);
```

### Update Stream

```typescript
await suiPulse.updateStream(streamId, {
  data: new Uint8Array([4, 5, 6]),
  metadata: new Uint8Array([7, 8, 9]),
});
```

### Get Stream Data

```typescript
const streamData = await suiPulse.getDataStream(streamId);
```

### Batch Operations

```typescript
const streams = await suiPulse.createStreamsBatch([
  streamConfig1,
  streamConfig2,
]);
```

## 📊 Snapshot Management

### Create Snapshot

```typescript
const snapshot = await suiPulse.createSnapshot(streamId);
```

### Get Snapshot Data

```typescript
const snapshotData = await suiPulse.getSnapshotData(snapshotId);
```

## 🔐 Permission Management

### Add Subscriber

```typescript
await suiPulse.addPermission(streamId, subscriberAddress);
```

### Check Subscription

```typescript
const hasAccess = await suiPulse.checkSubscription(streamId, address);
```

## ⚠️ Error Handling

The SDK provides detailed error messages and validation:

```typescript
try {
  await suiPulse.updateStream(streamId, data);
} catch (error) {
  if (error instanceof SuiPulseError) {
    console.error("SDK Error:", error.message);
    console.error("Error Type:", error.type);
    console.error("Error Code:", error.code);
  }
}
```

## 📚 Examples

Check out the `examples` directory for detailed usage examples:

- Basic usage: `examples/basic-usage.ts`
- Event handling: `examples/events.ts`
- Batch operations: `examples/batch-operations.ts`

## 🧪 Testing

```bash
# Run tests
npm test

# Run linter
npm run lint
```

## 📖 Documentation

For detailed documentation, visit our [documentation site](https://suipulse.xyz/docs/sdk).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
