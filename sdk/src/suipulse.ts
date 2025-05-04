import {
  SuiClient,
  SuiTransactionBlockResponse,
  SuiMoveObject,
  SuiHTTPTransport,
} from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Keypair } from "@mysten/sui.js/cryptography";
import {
  StreamConfig,
  SnapshotConfig,
  DataStreamObject,
  StreamSnapshot,
  BatchStreamConfig,
  BatchUpdateConfig,
  BatchOperationResult,
  SnapshotQueryOptions,
  SuiPulseError,
  SuiPulseErrorType,
} from "./types";
import { EventManager } from "./events";
import {
  validateStreamConfig,
  validateSnapshotConfig,
  validateStreamId,
  validateAddress,
  validateBatchSize,
  throwIfInvalid,
  validateData,
} from "./validation";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { Network, NetworkConfig, SuiPulseConfig } from "./config";

/**
 * SuiPulse SDK - A TypeScript SDK for interacting with the SuiPulse data mesh protocol
 *
 * @example
 * ```typescript
 * import { SuiPulse, Network } from '@suipulse/sdk';
 * import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
 *
 * const keypair = Ed25519Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));
 * const suiPulse = new SuiPulse(keypair);
 * ```
 */
export class SuiPulse {
  private client: SuiClient;
  private keypair: Ed25519Keypair;
  private config: SuiPulseConfig;
  private packageId: string;
  public events: EventManager;

  /**
   * Creates a new instance of the SuiPulse SDK
   *
   * @param keypair - The Ed25519 keypair used for signing transactions
   * @param network - The network to connect to (defaults to TESTNET)
   * @throws {SuiPulseError} If the keypair is invalid
   */
  constructor(keypair: Ed25519Keypair, network: Network = Network.TESTNET) {
    this.config = SuiPulseConfig.getInstance();
    this.config.setNetwork(network);

    this.client = new SuiClient({
      transport: new SuiHTTPTransport({
        url: this.config.getUrl(),
      }),
    });

    this.keypair = keypair;
    this.packageId = this.config.getPackageId();
    this.events = new EventManager(this.client, this.packageId);
  }

  /**
   * Changes the network configuration
   *
   * @param network - The network to switch to
   * @throws {SuiPulseError} If the network configuration is invalid
   */
  public setNetwork(network: Network): void {
    this.config.setNetwork(network);
    this.client = new SuiClient({
      transport: new SuiHTTPTransport({
        url: this.config.getUrl(),
      }),
    });
  }

  /**
   * Sets a custom network configuration
   *
   * @param config - The custom network configuration
   * @throws {SuiPulseError} If the configuration is invalid
   */
  public setCustomConfig(config: NetworkConfig): void {
    this.config.setCustomConfig(config);
    this.client = new SuiClient({
      transport: new SuiHTTPTransport({
        url: this.config.getUrl(),
      }),
    });
  }

  /**
   * Creates a new data stream
   *
   * @param config - The stream configuration
   * @returns A promise that resolves to the transaction response
   * @throws {SuiPulseError} If the stream creation fails
   *
   * @example
   * ```typescript
   * const response = await suiPulse.createStream({
   *   name: "My Stream",
   *   description: "A test stream",
   *   isPublic: true,
   *   metadata: new Uint8Array([1, 2, 3]),
   *   tags: ["test"]
   * });
   * ```
   */
  async createStream(
    config: StreamConfig
  ): Promise<SuiTransactionBlockResponse> {
    try {
      throwIfInvalid(validateStreamConfig(config));

      const tx = new TransactionBlock();

      // Convert metadata to Uint8Array if it's not already
      const metadataBytes = config.metadata
        ? ArrayBuffer.isView(config.metadata)
          ? config.metadata
          : new Uint8Array(
              Array.isArray(config.metadata) ? config.metadata : []
            )
        : new Uint8Array([]);

      // Convert schema to Uint8Array if it's not already
      const schemaBytes = config.schema
        ? ArrayBuffer.isView(config.schema)
          ? config.schema
          : new Uint8Array(Array.isArray(config.schema) ? config.schema : [])
        : new Uint8Array([]);

      // Ensure tags is an array of strings
      const tags = Array.isArray(config.tags) ? config.tags : [];

      const result = tx.moveCall({
        target: `${this.packageId}::data_stream::create_data_stream`,
        arguments: [
          tx.pure(config.name),
          tx.pure(config.description),
          tx.pure(config.isPublic),
          tx.pure(Array.from(metadataBytes as Uint8Array)),
          tx.pure(Array.from(schemaBytes as Uint8Array)),
          tx.pure(tags),
        ],
      });

      // Transfer the created stream to the signer's address
      const signerAddress = this.keypair.getPublicKey().toSuiAddress();
      tx.transferObjects([result], tx.pure(signerAddress));

      const response = await this.client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: this.keypair,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      // Verify the stream was created and transferred
      const createdObjects = response.effects?.created;
      if (!createdObjects || createdObjects.length === 0) {
        throw new SuiPulseError(
          SuiPulseErrorType.TRANSACTION_FAILED,
          "Failed to create stream: No objects were created"
        );
      }

      // Get the stream ID from the created objects
      const streamId = createdObjects[0].reference.objectId;
      if (!streamId) {
        throw new SuiPulseError(
          SuiPulseErrorType.TRANSACTION_FAILED,
          "Failed to create stream: No stream ID found"
        );
      }

      // Wait for the stream to be accessible
      let retries = 5;
      while (retries > 0) {
        try {
          await this.getDataStream(streamId);
          break;
        } catch (error) {
          retries--;
          if (retries === 0) {
            throw new SuiPulseError(
              SuiPulseErrorType.TRANSACTION_FAILED,
              `Failed to create stream: Stream not accessible after creation. Error: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
          // Wait for 1 second before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return response;
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.TRANSACTION_FAILED,
        `Failed to create stream: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Creates multiple streams in a batch operation
   *
   * @param config - The batch stream configuration
   * @returns A promise that resolves to the batch operation result
   * @throws {SuiPulseError} If the batch operation fails
   *
   * @example
   * ```typescript
   * const result = await suiPulse.createStreamsBatch({
   *   streams: [
   *     { name: "Stream 1", ... },
   *     { name: "Stream 2", ... }
   *   ],
   *   options: { parallel: true }
   * });
   * ```
   */
  async createStreamsBatch(
    config: BatchStreamConfig
  ): Promise<BatchOperationResult<StreamConfig>> {
    throwIfInvalid(validateBatchSize(config.streams.length));

    const result: BatchOperationResult<StreamConfig> = {
      successful: [],
      failed: [],
      summary: {
        total: config.streams.length,
        succeeded: 0,
        failed: 0,
      },
    };

    if (config.options?.parallel) {
      const promises = config.streams.map(async (streamConfig) => {
        try {
          await this.createStream(streamConfig);
          result.successful.push(streamConfig);
          result.summary.succeeded++;
        } catch (error) {
          result.failed.push({
            item: streamConfig,
            error:
              error instanceof SuiPulseError
                ? error
                : new SuiPulseError(
                    SuiPulseErrorType.UNKNOWN_ERROR,
                    String(error)
                  ),
          });
          result.summary.failed++;
        }
      });

      await Promise.all(promises);
    } else {
      for (const streamConfig of config.streams) {
        try {
          await this.createStream(streamConfig);
          result.successful.push(streamConfig);
          result.summary.succeeded++;
        } catch (error) {
          result.failed.push({
            item: streamConfig,
            error:
              error instanceof SuiPulseError
                ? error
                : new SuiPulseError(
                    SuiPulseErrorType.UNKNOWN_ERROR,
                    String(error)
                  ),
          });
          result.summary.failed++;
        }
      }
    }

    return result;
  }

  /**
   * Updates data in multiple streams in a batch operation
   *
   * @param config - The batch update configuration
   * @returns A promise that resolves to the batch operation result
   * @throws {SuiPulseError} If the batch operation fails
   *
   * @example
   * ```typescript
   * const result = await suiPulse.updateStreamsBatch({
   *   updates: [
   *     { streamId: "0x123", data: new Uint8Array([1, 2, 3]) },
   *     { streamId: "0x456", data: new Uint8Array([4, 5, 6]) }
   *   ],
   *   options: { parallel: true }
   * });
   * ```
   */
  async updateStreamsBatch(
    config: BatchUpdateConfig
  ): Promise<BatchOperationResult<{ streamId: string; data: Uint8Array }>> {
    throwIfInvalid(validateBatchSize(config.updates.length));

    const result: BatchOperationResult<{ streamId: string; data: Uint8Array }> =
      {
        successful: [],
        failed: [],
        summary: {
          total: config.updates.length,
          succeeded: 0,
          failed: 0,
        },
      };

    if (config.options?.parallel) {
      const promises = config.updates.map(async (update) => {
        try {
          await this.updateStream(update.streamId, update.data);
          result.successful.push(update);
          result.summary.succeeded++;
        } catch (error) {
          result.failed.push({
            item: update,
            error:
              error instanceof SuiPulseError
                ? error
                : new SuiPulseError(
                    SuiPulseErrorType.UNKNOWN_ERROR,
                    String(error)
                  ),
          });
          result.summary.failed++;
        }
      });

      await Promise.all(promises);
    } else {
      for (const update of config.updates) {
        try {
          await this.updateStream(update.streamId, update.data);
          result.successful.push(update);
          result.summary.succeeded++;
        } catch (error) {
          result.failed.push({
            item: update,
            error:
              error instanceof SuiPulseError
                ? error
                : new SuiPulseError(
                    SuiPulseErrorType.UNKNOWN_ERROR,
                    String(error)
                  ),
          });
          result.summary.failed++;
        }
      }
    }

    return result;
  }

  /**
   * Creates a snapshot of a stream
   *
   * @param streamId - The ID of the stream to snapshot
   * @param config - The snapshot configuration
   * @returns A promise that resolves to the transaction response
   * @throws {SuiPulseError} If the snapshot creation fails
   *
   * @example
   * ```typescript
   * const response = await suiPulse.createSnapshot("0x123", {
   *   metadata: "Snapshot metadata"
   * });
   * ```
   */
  async createSnapshot(
    streamId: string,
    config: SnapshotConfig
  ): Promise<SuiTransactionBlockResponse> {
    try {
      throwIfInvalid(validateStreamId(streamId));
      throwIfInvalid(validateSnapshotConfig(config));

      let retries = 3;
      let lastError: Error | null = null;

      while (retries > 0) {
        try {
          const tx = new TransactionBlock();

          // Get the latest version of the stream right before creating the transaction
          const stream = await this.client.getObject({
            id: streamId,
            options: {
              showContent: true,
            },
          });

          if (!stream.data?.version || !stream.data?.digest) {
            throw new SuiPulseError(
              SuiPulseErrorType.TRANSACTION_FAILED,
              "Failed to create snapshot: Stream not found or has no version/digest"
            );
          }

          // Use the latest version of the stream
          const streamRef = tx.objectRef({
            objectId: streamId,
            version: stream.data.version,
            digest: stream.data.digest,
          });

          const result = tx.moveCall({
            target: `${this.packageId}::storage::create_snapshot`,
            arguments: [streamRef, tx.pure(config.metadata)],
          });

          // Transfer the created snapshot to the signer's address
          const signerAddress = this.keypair.getPublicKey().toSuiAddress();
          tx.transferObjects([result], tx.pure(signerAddress));

          // Execute the transaction immediately after getting the latest version
          return await this.client.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            signer: this.keypair,
            options: {
              showEffects: true,
              showEvents: true,
            },
          });
        } catch (error) {
          lastError = error as Error;
          if (
            error instanceof Error &&
            error.message.includes("is not available for consumption")
          ) {
            retries--;
            if (retries === 0) {
              break;
            }
            // Wait for a short time before retrying
            await new Promise((resolve) => setTimeout(resolve, 500));
            continue;
          }
          throw error;
        }
      }

      throw new SuiPulseError(
        SuiPulseErrorType.TRANSACTION_FAILED,
        `Failed to create snapshot after ${retries} retries: ${
          lastError?.message || "Unknown error"
        }`
      );
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.TRANSACTION_FAILED,
        `Failed to create snapshot: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Retrieves snapshot data
   *
   * @param snapshotId - The ID of the snapshot
   * @param options - Optional query parameters
   * @returns A promise that resolves to the snapshot data
   * @throws {SuiPulseError} If the snapshot retrieval fails
   *
   * @example
   * ```typescript
   * const snapshot = await suiPulse.getSnapshotData("0x123");
   * ```
   */
  async getSnapshotData(
    snapshotId: string,
    options?: SnapshotQueryOptions
  ): Promise<StreamSnapshot> {
    try {
      throwIfInvalid(validateStreamId(snapshotId));

      const snapshot = await this.client.getObject({
        id: snapshotId,
        options: {
          showContent: true,
        },
      });

      if (
        !snapshot.data?.content ||
        snapshot.data.content.dataType !== "moveObject"
      ) {
        throw new SuiPulseError(
          SuiPulseErrorType.NOT_FOUND,
          "Snapshot not found or invalid type"
        );
      }

      return this.parseSnapshotData(snapshot.data.content as SuiMoveObject);
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.NOT_FOUND,
        `Failed to get snapshot: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Updates snapshot metadata
   *
   * @param snapshotId - The ID of the snapshot
   * @param newMetadata - The new metadata string
   * @returns A promise that resolves to the transaction response
   * @throws {SuiPulseError} If the update fails
   *
   * @example
   * ```typescript
   * const response = await suiPulse.updateSnapshotMetadata("0x123", "New metadata");
   * ```
   */
  async updateSnapshotMetadata(
    snapshotId: string,
    newMetadata: string
  ): Promise<SuiTransactionBlockResponse> {
    try {
      throwIfInvalid(validateStreamId(snapshotId));

      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${this.packageId}::storage::update_snapshot_metadata`,
        arguments: [tx.object(snapshotId), tx.pure(newMetadata)],
      });

      return await this.client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: this.keypair,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.TRANSACTION_FAILED,
        `Failed to update snapshot metadata: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Retrieves the schema of a stream
   *
   * @param streamId - The ID of the stream
   * @returns A promise that resolves to the schema string or null
   * @throws {SuiPulseError} If the schema retrieval fails
   *
   * @example
   * ```typescript
   * const schema = await suiPulse.getStreamSchema("0x123");
   * ```
   */
  async getStreamSchema(streamId: string): Promise<string | null> {
    try {
      const stream = await this.getDataStream(streamId);
      return stream.schema || null;
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.NOT_FOUND,
        `Failed to get stream schema: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Retrieves the version of a stream
   *
   * @param streamId - The ID of the stream
   * @returns A promise that resolves to the version string
   * @throws {SuiPulseError} If the version retrieval fails
   *
   * @example
   * ```typescript
   * const version = await suiPulse.getStreamVersion("0x123");
   * ```
   */
  async getStreamVersion(streamId: string): Promise<string> {
    try {
      const stream = await this.getDataStream(streamId);
      return stream.version;
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.NOT_FOUND,
        `Failed to get stream version: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Updates data in a stream
   *
   * @param streamId - The ID of the stream to update
   * @param data - The new data to add to the stream
   * @returns A promise that resolves to the transaction response
   * @throws {SuiPulseError} If the update fails
   *
   * @example
   * ```typescript
   * const response = await suiPulse.updateStream("0x123", new Uint8Array([1, 2, 3]));
   * ```
   */
  async updateStream(
    streamId: string,
    data: Uint8Array
  ): Promise<SuiTransactionBlockResponse> {
    try {
      throwIfInvalid(validateStreamId(streamId));
      throwIfInvalid(validateData(data));

      let retries = 3;
      let lastError: Error | null = null;

      while (retries > 0) {
        try {
          // Get the stream object to verify ownership
          const stream = await this.getDataStream(streamId);
          const signerAddress = this.keypair.getPublicKey().toSuiAddress();

          if (stream.owner !== signerAddress) {
            throw new SuiPulseError(
              SuiPulseErrorType.PERMISSION_DENIED,
              `You do not own the stream. Owner: ${stream.owner}, Your address: ${signerAddress}`
            );
          }

          const tx = new TransactionBlock();

          // Get the latest version of the stream right before creating the transaction
          const latestStream = await this.client.getObject({
            id: streamId,
            options: {
              showContent: true,
            },
          });

          if (!latestStream.data?.version || !latestStream.data?.digest) {
            throw new SuiPulseError(
              SuiPulseErrorType.TRANSACTION_FAILED,
              "Failed to update stream: Stream not found or has no version/digest"
            );
          }

          // Use the latest version of the stream
          const streamRef = tx.objectRef({
            objectId: streamId,
            version: latestStream.data.version,
            digest: latestStream.data.digest,
          });

          tx.moveCall({
            target: `${this.packageId}::data_stream::update_data_stream`,
            arguments: [streamRef, tx.pure(Array.from(data))],
          });

          return await this.client.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            signer: this.keypair,
            options: {
              showEffects: true,
              showEvents: true,
            },
          });
        } catch (error) {
          lastError = error as Error;
          if (
            error instanceof Error &&
            error.message.includes("is not available for consumption")
          ) {
            retries--;
            if (retries === 0) {
              break;
            }
            // Wait for a short time before retrying
            await new Promise((resolve) => setTimeout(resolve, 500));
            continue;
          }
          throw error;
        }
      }

      throw new SuiPulseError(
        SuiPulseErrorType.TRANSACTION_FAILED,
        `Failed to update stream after ${retries} retries: ${
          lastError?.message || "Unknown error"
        }`
      );
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.TRANSACTION_FAILED,
        `Failed to update stream: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Subscribes to a stream
   *
   * @param streamId - The ID of the stream to subscribe to
   * @returns A promise that resolves to the transaction response
   * @throws {SuiPulseError} If the subscription fails
   *
   * @example
   * ```typescript
   * const response = await suiPulse.subscribeToStream("0x123");
   * ```
   */
  async subscribeToStream(
    streamId: string
  ): Promise<SuiTransactionBlockResponse> {
    const tx = new TransactionBlock();

    tx.moveCall({
      target: `${this.packageId}::data_stream::subscribe_to_stream`,
      arguments: [tx.object(streamId)],
    });

    return await this.client.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      signer: this.keypair,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });
  }

  /**
   * Adds a permission for an address to a stream
   *
   * @param streamId - The ID of the stream
   * @param address - The address to grant permission to
   * @param level - The permission level (0: read, 1: write, 2: admin)
   * @returns A promise that resolves to the transaction response
   * @throws {SuiPulseError} If the permission addition fails
   *
   * @example
   * ```typescript
   * const response = await suiPulse.addPermission("0x123", "0x456", 1);
   * ```
   */
  async addPermission(
    streamId: string,
    address: string,
    level: number
  ): Promise<SuiTransactionBlockResponse> {
    const tx = new TransactionBlock();

    tx.moveCall({
      target: `${this.packageId}::data_stream::add_permission`,
      arguments: [tx.object(streamId), tx.pure(address), tx.pure(level)],
    });

    return await this.client.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      signer: this.keypair,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });
  }

  /**
   * Composes streams by adding a child stream to a parent
   *
   * @param parentId - The ID of the parent stream
   * @param childId - The ID of the child stream
   * @returns A promise that resolves to the transaction response
   * @throws {SuiPulseError} If the composition fails
   *
   * @example
   * ```typescript
   * const response = await suiPulse.composeStreams("0x123", "0x456");
   * ```
   */
  async composeStreams(
    parentId: string,
    childId: string
  ): Promise<SuiTransactionBlockResponse> {
    const tx = new TransactionBlock();

    tx.moveCall({
      target: `${this.packageId}::data_stream::compose_streams`,
      arguments: [tx.object(parentId), tx.pure(childId)],
    });

    return await this.client.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      signer: this.keypair,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });
  }

  /**
   * Retrieves a data stream by ID
   *
   * @param streamId - The ID of the stream
   * @returns A promise that resolves to the data stream object
   * @throws {SuiPulseError} If the stream retrieval fails
   *
   * @example
   * ```typescript
   * const stream = await suiPulse.getDataStream("0x123");
   * ```
   */
  async getDataStream(streamId: string): Promise<DataStreamObject> {
    try {
      const stream = await this.client.getObject({
        id: streamId,
        options: {
          showContent: true,
        },
      });

      if (
        !stream.data ||
        !stream.data.content ||
        stream.data.content.dataType !== "moveObject"
      ) {
        throw new Error("Stream not found or has no content");
      }

      const fields = (
        stream.data.content as { fields: Record<string, unknown> }
      ).fields;

      if (!this.validateDataStream(fields)) {
        throw new Error("Invalid data stream format");
      }

      // Convert data field to Uint8Array if it's an array
      const dataField = fields.data;
      if (Array.isArray(dataField)) {
        return {
          ...fields,
          data: new Uint8Array(dataField),
        } as unknown as DataStreamObject;
      }

      return fields as unknown as DataStreamObject;
    } catch (error) {
      throw new Error(
        `Failed to get data stream: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private validateDataStream(data: unknown): data is DataStreamObject {
    const record = data as Record<string, unknown>;
    return (
      typeof data === "object" &&
      data !== null &&
      typeof record.id === "object" &&
      typeof record.owner === "string" &&
      typeof record.name === "string" &&
      typeof record.description === "string" &&
      typeof record.is_public === "boolean" &&
      Array.isArray(record.metadata) &&
      (record.schema === null || typeof record.schema === "object") &&
      Array.isArray(record.tags) &&
      typeof record.version === "string" &&
      typeof record.last_updated === "string" &&
      Array.isArray(record.subscribers) &&
      Array.isArray(record.parent_streams) &&
      Array.isArray(record.permissions) &&
      (record.walrus_id === null || typeof record.walrus_id === "string")
    );
  }

  /**
   * Checks if an address is subscribed to a stream
   *
   * @param streamId - The ID of the stream
   * @param address - The address to check
   * @returns A promise that resolves to a boolean indicating subscription status
   * @throws {SuiPulseError} If the check fails
   *
   * @example
   * ```typescript
   * const isSubscribed = await suiPulse.isSubscribed("0x123", "0x456");
   * ```
   */
  async isSubscribed(streamId: string, address: string): Promise<boolean> {
    try {
      const stream = await this.getDataStream(streamId);
      return stream.subscribers.includes(address);
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.QUERY_FAILED,
        `Failed to check subscription status: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Transfers ownership of a stream to a new address
   *
   * @param streamId - The ID of the stream
   * @param newOwner - The address of the new owner
   * @returns A promise that resolves to the transaction response
   * @throws {SuiPulseError} If the transfer fails
   *
   * @example
   * ```typescript
   * const response = await suiPulse.transferOwnership("0x123", "0x456");
   * ```
   */
  async transferOwnership(
    streamId: string,
    newOwner: string
  ): Promise<SuiTransactionBlockResponse> {
    try {
      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${this.packageId}::data_stream::transfer_ownership`,
        arguments: [tx.object(streamId), tx.pure(newOwner)],
      });

      return await this.client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: this.keypair,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.TRANSACTION_FAILED,
        `Failed to transfer ownership: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private validateSnapshotData(data: Record<string, any>): boolean {
    try {
      return (
        typeof data === "object" &&
        data !== null &&
        data.id?.id &&
        data.streamId?.id &&
        Array.isArray(data.data) &&
        typeof data.timestamp === "string" &&
        typeof data.version === "string" &&
        typeof data.metadata === "string" &&
        typeof data.creator === "string"
      );
    } catch {
      return false;
    }
  }

  private parseSnapshotData(content: SuiMoveObject): StreamSnapshot {
    if (!content.fields || typeof content.fields !== "object") {
      throw new SuiPulseError(
        SuiPulseErrorType.VALIDATION_ERROR,
        "Invalid snapshot data structure"
      );
    }

    const fields = content.fields as Record<string, any>;

    if (!this.validateSnapshotData(fields)) {
      throw new SuiPulseError(
        SuiPulseErrorType.VALIDATION_ERROR,
        "Invalid snapshot data format"
      );
    }

    return {
      id: fields.id || "",
      streamId: fields.streamId || "",
      data: new Uint8Array(fields.data || []),
      timestamp: fields.timestamp?.toString() || "0",
      version: fields.version?.toString() || "0",
      metadata: fields.metadata || "",
      creator: fields.creator || "",
    };
  }

  /**
   * Cleans up resources and subscriptions
   *
   * @example
   * ```typescript
   * suiPulse.cleanup();
   * ```
   */
  public cleanup(): void {
    this.events.cleanup();
  }

  /**
   * Transfers a snapshot to a new owner
   *
   * @param snapshotId - The ID of the snapshot
   * @param recipient - The address of the recipient
   * @returns A promise that resolves to the transaction response
   * @throws {SuiPulseError} If the transfer fails
   *
   * @example
   * ```typescript
   * const response = await suiPulse.transferSnapshot("0x123", "0x456");
   * ```
   */
  async transferSnapshot(
    snapshotId: string,
    recipient: string
  ): Promise<SuiTransactionBlockResponse> {
    try {
      throwIfInvalid(validateAddress(recipient));

      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${this.packageId}::storage::transfer_snapshot`,
        arguments: [tx.object(snapshotId), tx.pure(recipient)],
      });

      return await this.client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: this.keypair,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.TRANSACTION_FAILED,
        `Failed to transfer snapshot: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Updates a snapshot with new data
   *
   * @param snapshotId - The ID of the snapshot
   * @param newData - The new data to update the snapshot with
   * @returns A promise that resolves to the transaction response
   * @throws {SuiPulseError} If the update fails
   *
   * @example
   * ```typescript
   * const response = await suiPulse.updateSnapshot("0x123", new Uint8Array([1, 2, 3]));
   * ```
   */
  async updateSnapshot(
    snapshotId: string,
    newData: Uint8Array
  ): Promise<SuiTransactionBlockResponse> {
    try {
      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${this.packageId}::storage::update_snapshot`,
        arguments: [tx.object(snapshotId), tx.pure(newData)],
      });

      return await this.client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: this.keypair,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.TRANSACTION_FAILED,
        `Failed to update snapshot: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Retrieves the creator address of a snapshot
   *
   * @param snapshotId - The ID of the snapshot
   * @returns A promise that resolves to the creator's address
   * @throws {SuiPulseError} If the retrieval fails
   *
   * @example
   * ```typescript
   * const creator = await suiPulse.getSnapshotCreator("0x123");
   * ```
   */
  async getSnapshotCreator(snapshotId: string): Promise<string> {
    try {
      const snapshot = await this.getSnapshotData(snapshotId);
      return snapshot.creator;
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.QUERY_FAILED,
        `Failed to get snapshot creator: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Retrieves the timestamp when the snapshot was created
   *
   * @param snapshotId - The ID of the snapshot
   * @returns A promise that resolves to the timestamp string
   * @throws {SuiPulseError} If the retrieval fails
   *
   * @example
   * ```typescript
   * const timestamp = await suiPulse.getSnapshotTimestamp("0x123");
   * ```
   */
  async getSnapshotTimestamp(snapshotId: string): Promise<string> {
    try {
      const snapshot = await this.getSnapshotData(snapshotId);
      return snapshot.timestamp;
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.QUERY_FAILED,
        `Failed to get snapshot timestamp: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Retrieves the version of the stream when the snapshot was taken
   *
   * @param snapshotId - The ID of the snapshot
   * @returns A promise that resolves to the version string
   * @throws {SuiPulseError} If the retrieval fails
   *
   * @example
   * ```typescript
   * const version = await suiPulse.getSnapshotVersion("0x123");
   * ```
   */
  async getSnapshotVersion(snapshotId: string): Promise<string> {
    try {
      const snapshot = await this.getSnapshotData(snapshotId);
      return snapshot.version;
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.QUERY_FAILED,
        `Failed to get snapshot version: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Verifies if a snapshot belongs to a specific stream
   *
   * @param snapshotId - The ID of the snapshot
   * @param streamId - The ID of the stream
   * @returns A promise that resolves to a boolean indicating verification status
   * @throws {SuiPulseError} If the verification fails
   *
   * @example
   * ```typescript
   * const isValid = await suiPulse.verifySnapshotStream("0x123", "0x456");
   * ```
   */
  async verifySnapshotStream(
    snapshotId: string,
    streamId: string
  ): Promise<boolean> {
    try {
      const tx = new TransactionBlock();

      tx.moveCall({
        target: `${this.packageId}::storage::verify_snapshot_stream`,
        arguments: [tx.object(snapshotId), tx.object(streamId)],
      });

      const response = await this.client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: this.keypair,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      // Parse response to get boolean result
      return response.effects?.status.status === "success";
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.QUERY_FAILED,
        `Failed to verify snapshot stream: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Retrieves the stream ID associated with a snapshot
   *
   * @param snapshotId - The ID of the snapshot
   * @returns A promise that resolves to the stream ID
   * @throws {SuiPulseError} If the retrieval fails
   *
   * @example
   * ```typescript
   * const streamId = await suiPulse.getSnapshotStreamId("0x123");
   * ```
   */
  async getSnapshotStreamId(snapshotId: string): Promise<string> {
    try {
      const snapshot = await this.getSnapshotData(snapshotId);
      return snapshot.streamId;
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.QUERY_FAILED,
        `Failed to get snapshot stream ID: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
