# SuiPulse CLI

A command-line interface for the SuiPulse SDK, providing easy access to all SuiPulse features.

## Prerequisites

- Node.js >= 16.0.0
- Sui CLI installed and configured
- SUI_PRIVATE_KEY environment variable set with your base64-encoded private key

## Installation

```bash
npm install -g @suipulse/cli
```

## Usage

### Create a Stream

```bash
suipulse create --metadata=./data.json --network=mainnet
```

The metadata file should be a JSON file containing the stream configuration.

### Subscribe to Events

```bash
suipulse subscribe --stream-id=<STREAM_ID> --event-type=DataStreamUpdated --network=mainnet
```

### Update a Stream

```bash
suipulse update --stream-id=<STREAM_ID> --data=./update.json --network=mainnet
```

### Create a Snapshot

```bash
suipulse snapshot --stream-id=<STREAM_ID> --network=mainnet
```

### Add a Subscriber

```bash
suipulse subscribe --stream-id=<STREAM_ID> --subscriber=<ADDRESS> --network=mainnet
```

### Compose Streams

```bash
suipulse compose --parent-id=<PARENT_STREAM_ID> --child-id=<CHILD_STREAM_ID> --network=mainnet
```

## Environment Variables

- `SUI_PRIVATE_KEY`: Your base64-encoded private key (required)

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Link the package locally:
   ```bash
   npm link
   ```

## License

MIT
