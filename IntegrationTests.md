# SuiPulse SDK Integration Tests

## Overview

This document outlines comprehensive integration test cases for the SuiPulse SDK, demonstrating real-world usage scenarios and implementation patterns. These tests verify the SDK's functionality in various decentralized data streaming applications.

## Test Environment Setup

```typescript
import { SuiPulse } from "@suipulse/sdk";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiClient } from "@mysten/sui.js/client";

const client = new SuiClient({ url: "https://fullnode.testnet.sui.io" });
const keypair = Ed25519Keypair.generate();
const suiPulse = new SuiPulse(client, PACKAGE_ID, keypair);
```

## 1. Real-time DeFi Dashboard Integration

### Test Case: Create and Update Price Feed Stream

**Objective**: Implement real-time token price updates with historical snapshots.

**Steps**:

1. Create price feed stream

```typescript
const priceStream = await suiPulse.createStream({
  name: "ETH/USD Price Feed",
  description: "Real-time ETH/USD price updates",
  isPublic: true,
  tags: ["defi", "prices", "eth"],
});
```

2. Set up price update mechanism

```typescript
const updatePrice = async (price: number) => {
  const data = new TextEncoder().encode(price.toString());
  await suiPulse.updateStream(priceStream.id, data);
};
```

3. Subscribe to price updates

```typescript
suiPulse.events.subscribeToStreamUpdates((event) => {
  console.log(`New price: ${event.data}`);
});
```

4. Create periodic snapshots

```typescript
setInterval(async () => {
  await suiPulse.createSnapshot(priceStream.id, {
    metadata: `Daily snapshot ${new Date().toISOString()}`,
  });
}, 86400000); // Daily snapshots
```

**Verification Points**:

- Price updates are received in real-time
- Multiple subscribers receive the same data
- Snapshots are created successfully
- Historical data is retrievable

## 2. Gaming Leaderboard System

### Test Case: Manage Game Score Updates

**Objective**: Implement a decentralized gaming leaderboard with real-time updates.

**Steps**:

1. Create leaderboard stream

```typescript
const leaderboardStream = await suiPulse.createStream({
  name: "Game Leaderboard",
  description: "Real-time game scores",
  isPublic: true,
  tags: ["gaming", "scores"],
});
```

2. Update player scores

```typescript
interface Score {
  player: string;
  score: number;
  timestamp: number;
}

const updateScore = async (scoreData: Score) => {
  const data = new TextEncoder().encode(JSON.stringify(scoreData));
  await suiPulse.updateStream(leaderboardStream.id, data);
};
```

3. Set up permissions

```typescript
await suiPulse.addPermission(
  leaderboardStream.id,
  GAME_SERVER_ADDRESS,
  2 // Admin level
);
```

**Verification Points**:

- Only authorized addresses can update scores
- Score updates are received in real-time
- Leaderboard data is consistent
- Historical rankings are preserved in snapshots

## 3. Social Feed Integration

### Test Case: Decentralized Content Distribution

**Objective**: Create a decentralized social content distribution system.

**Steps**:

1. Create content streams

```typescript
const postStream = await suiPulse.createStream({
  name: "User Posts",
  description: "Main post feed",
  isPublic: true,
  tags: ["social", "posts"],
});

const commentStream = await suiPulse.createStream({
  name: "Post Comments",
  description: "Comment feed",
  isPublic: true,
  tags: ["social", "comments"],
});
```

2. Compose streams

```typescript
await suiPulse.composeStreams(postStream.id, commentStream.id);
```

3. Subscribe to content updates

```typescript
suiPulse.events.subscribeToStreamUpdates((event) => {
  if (event.type.includes("post")) {
    handleNewPost(event);
  } else if (event.type.includes("comment")) {
    handleNewComment(event);
  }
});
```

**Verification Points**:

- Content updates are distributed to all subscribers
- Stream composition works correctly
- Permissions are properly enforced
- Content moderation is effective

## 4. Cross-Chain Data Bridge

### Test Case: Multi-Chain Data Synchronization

**Objective**: Implement cross-chain asset data synchronization.

**Steps**:

1. Create bridge streams

```typescript
const bridgeStream = await suiPulse.createStream({
  name: "Cross-Chain Bridge",
  description: "Asset bridge status",
  isPublic: false,
  tags: ["bridge", "cross-chain"],
});
```

2. Update bridge status

```typescript
interface BridgeUpdate {
  sourceChain: string;
  targetChain: string;
  asset: string;
  amount: string;
  status: "pending" | "completed" | "failed";
}

const updateBridgeStatus = async (update: BridgeUpdate) => {
  const data = new TextEncoder().encode(JSON.stringify(update));
  await suiPulse.updateStream(bridgeStream.id, data);
};
```

**Verification Points**:

- Bridge updates are atomic
- Data consistency across chains
- Proper error handling
- Audit trail preservation

## 5. IoT Device Data Management

### Test Case: Sensor Data Collection

**Objective**: Manage IoT sensor data streams with batch updates.

**Steps**:

1. Create sensor streams

```typescript
const sensorStreams = await suiPulse.createStreamsBatch({
  streams: [
    {
      name: "Temperature Sensor",
      description: "Temperature readings",
      isPublic: true,
      tags: ["iot", "temperature"],
    },
    {
      name: "Humidity Sensor",
      description: "Humidity readings",
      isPublic: true,
      tags: ["iot", "humidity"],
    },
  ],
});
```

2. Batch update sensor data

```typescript
const updateSensorData = async (
  readings: Array<{ id: string; data: Uint8Array }>
) => {
  await suiPulse.updateStreamsBatch({
    updates: readings,
  });
};
```

**Verification Points**:

- Batch operations work efficiently
- Real-time data processing
- Proper error handling for failed sensors
- Historical data aggregation

## 6. NFT Marketplace Analytics

### Test Case: Track NFT Trading Activity

**Objective**: Monitor and analyze NFT trading patterns.

**Steps**:

1. Create analytics stream

```typescript
const nftStream = await suiPulse.createStream({
  name: "NFT Analytics",
  description: "Real-time NFT trading data",
  isPublic: true,
  tags: ["nft", "trading"],
});
```

2. Track sales

```typescript
interface NFTSale {
  collection: string;
  tokenId: string;
  price: string;
  buyer: string;
  seller: string;
}

const recordSale = async (sale: NFTSale) => {
  const data = new TextEncoder().encode(JSON.stringify(sale));
  await suiPulse.updateStream(nftStream.id, data);
};
```

**Verification Points**:

- Sale data is recorded accurately
- Price history is maintained
- Analytics are computed correctly
- Historical trends are accessible

## 7. Decentralized Oracle Network

### Test Case: Oracle Data Distribution

**Objective**: Implement a decentralized oracle network.

**Steps**:

1. Create oracle streams

```typescript
const oracleStream = await suiPulse.createStream({
  name: "Price Oracle",
  description: "Decentralized price oracle",
  isPublic: true,
  tags: ["oracle", "prices"],
});
```

2. Update oracle data

```typescript
interface OracleData {
  asset: string;
  price: string;
  timestamp: number;
  signatures: string[];
}

const updateOracleData = async (data: OracleData) => {
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  await suiPulse.updateStream(oracleStream.id, encoded);
};
```

**Verification Points**:

- Data validation works correctly
- Consensus is achieved
- Updates are properly signed
- Historical data is preserved

## 8. Supply Chain Tracking

### Test Case: Product Journey Tracking

**Objective**: Track product movement through supply chain.

**Steps**:

1. Create tracking stream

```typescript
const trackingStream = await suiPulse.createStream({
  name: "Product Tracking",
  description: "Supply chain product tracking",
  isPublic: false,
  tags: ["supply-chain", "tracking"],
});
```

2. Update product status

```typescript
interface ProductStatus {
  productId: string;
  location: string;
  status: string;
  timestamp: number;
}

const updateStatus = async (status: ProductStatus) => {
  const data = new TextEncoder().encode(JSON.stringify(status));
  await suiPulse.updateStream(trackingStream.id, data);
};
```

**Verification Points**:

- Product updates are tracked accurately
- Chain of custody is maintained
- Status changes are timestamped
- Historical tracking data is preserved

## 9. Collaborative Document Editing

### Test Case: Real-time Document Collaboration

**Objective**: Implement collaborative document editing.

**Steps**:

1. Create document stream

```typescript
const documentStream = await suiPulse.createStream({
  name: "Shared Document",
  description: "Collaborative document editing",
  isPublic: false,
  tags: ["document", "collaboration"],
});
```

2. Handle document updates

```typescript
interface DocumentUpdate {
  version: number;
  patch: string;
  author: string;
  timestamp: number;
}

const updateDocument = async (update: DocumentUpdate) => {
  const data = new TextEncoder().encode(JSON.stringify(update));
  await suiPulse.updateStream(documentStream.id, data);
};
```

**Verification Points**:

- Real-time updates are synchronized
- Version control works correctly
- Conflicts are resolved properly
- Document history is maintained

## 10. Decentralized Identity Verification

### Test Case: Credential Management

**Objective**: Manage decentralized identity credentials.

**Steps**:

1. Create identity stream

```typescript
const identityStream = await suiPulse.createStream({
  name: "Identity Credentials",
  description: "Decentralized identity management",
  isPublic: false,
  tags: ["identity", "credentials"],
});
```

2. Update credentials

```typescript
interface Credential {
  holder: string;
  type: string;
  issuer: string;
  status: "active" | "revoked";
  timestamp: number;
}

const updateCredential = async (credential: Credential) => {
  const data = new TextEncoder().encode(JSON.stringify(credential));
  await suiPulse.updateStream(identityStream.id, data);
};
```

**Verification Points**:

- Credential updates are secure
- Privacy is maintained
- Revocation works correctly
- Audit trail is preserved

## General Verification Points

For all test cases, verify:

1. Stream Creation

   - Streams are created with correct configuration
   - Tags and metadata are properly set
   - Permissions are correctly initialized

2. Data Updates

   - Updates are processed in real-time
   - Data integrity is maintained
   - Batch updates work efficiently

3. Subscriptions

   - Subscribers receive updates promptly
   - Multiple subscribers work correctly
   - Unsubscribe functionality works

4. Snapshots

   - Snapshots are created successfully
   - Historical data is retrievable
   - Snapshot metadata is accurate

5. Permissions

   - Access control works as expected
   - Permission changes are enforced
   - Unauthorized access is prevented

6. Error Handling

   - Network errors are handled gracefully
   - Invalid data is rejected
   - Recovery mechanisms work

7. Performance

   - System handles high update frequency
   - Batch operations are efficient
   - Resource usage is optimized

8. Cleanup
   - Resources are properly released
   - Subscriptions are cleaned up
   - Memory usage is managed
