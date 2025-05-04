import { SuiEvent } from "@mysten/sui.js/client";

/**
 * Base object representing a data stream in the SuiPulse protocol
 */
export interface DataStreamObject {
  /** The type of the data stream */
  type: string;
  /** The address of the stream owner */
  owner: string;
  /** List of subscriber addresses */
  subscribers: string[];
  /** The actual data content of the stream */
  data: Uint8Array;
  /** Current version of the stream */
  version: string;
  /** Timestamp of the last update */
  last_updated: string;
  /** Optional schema definition for the data */
  schema?: string;
  /** Name of the stream */
  name: string;
  /** Description of the stream */
  description: string;
  /** Whether the stream is publicly accessible */
  is_public: boolean;
  /** Additional metadata associated with the stream */
  metadata: Uint8Array;
  /** Tags for categorizing the stream */
  tags: string[];
  /** List of parent stream IDs if this stream is composed */
  parent_streams: string[];
  /** List of permissions for different addresses */
  permissions: Permission[];
  /** Optional Walrus ID for external integration */
  walrus_id?: string;
}

/**
 * Simplified representation of a data stream
 */
export interface DataStream {
  /** Unique identifier of the stream */
  id: string;
  /** Name of the stream */
  name: string;
  /** Description of the stream */
  description: string;
  /** Address of the stream owner */
  owner: string;
  /** List of subscriber addresses */
  subscribers: string[];
  /** Timestamp of the last update */
  lastUpdated: string;
  /** The actual data content */
  data: Uint8Array;
  /** Whether the stream is publicly accessible */
  isPublic: boolean;
  /** List of parent stream IDs */
  parentStreams: string[];
  /** List of permissions */
  permissions: Permission[];
  /** Additional metadata */
  metadata: Uint8Array;
  /** Optional Walrus ID */
  walrusId?: string;
  /** Current version of the stream */
  version: string;
  /** Tags for categorization */
  tags: string[];
  /** Optional schema definition */
  schema?: string;
  /** Version of the last snapshot */
  lastSnapshotVersion: string;
  /** Timestamp of the last snapshot */
  lastSnapshotTimestamp: string;
}

/**
 * Represents a snapshot of a stream at a specific point in time
 */
export interface StreamSnapshot {
  /** Unique identifier of the snapshot */
  id: string;
  /** ID of the stream this snapshot belongs to */
  streamId: string;
  /** The data content at the time of snapshot */
  data: Uint8Array;
  /** Timestamp when the snapshot was created */
  timestamp: string;
  /** Version of the stream when the snapshot was taken */
  version: string;
  /** Additional metadata for the snapshot */
  metadata: string;
  /** Address of the snapshot creator */
  creator: string;
}

/**
 * Represents a permission level for an address
 */
export interface Permission {
  /** The address that has the permission */
  address: string;
  /** The permission level (0: read, 1: write, 2: admin) */
  level: number;
}

/**
 * Event emitted when a new data stream is created
 */
export interface DataStreamCreatedEvent extends SuiEvent {
  /** ID of the created stream */
  stream_id: string;
  /** Name of the created stream */
  name: string;
  /** Address of the stream owner */
  owner: string;
}

/**
 * Event emitted when a data stream is updated
 */
export interface DataStreamUpdatedEvent extends SuiEvent {
  /** ID of the updated stream */
  stream_id: string;
  /** Timestamp of the update */
  timestamp: string;
}

/**
 * Event emitted when a snapshot is created
 */
export interface SnapshotCreatedEvent extends SuiEvent {
  /** ID of the stream the snapshot belongs to */
  stream_id: string;
  /** ID of the created snapshot */
  snapshot_id: string;
  /** Timestamp when the snapshot was created */
  timestamp: string;
  /** Version of the stream when the snapshot was taken */
  version: string;
  /** Address of the snapshot creator */
  creator: string;
}

/**
 * Event emitted when a new subscriber is added to a stream
 */
export interface SubscriberAddedEvent extends SuiEvent {
  /** ID of the stream */
  stream_id: string;
  /** Address of the new subscriber */
  subscriber: string;
}

/**
 * Event emitted when streams are composed
 */
export interface StreamsComposedEvent extends SuiEvent {
  /** ID of the parent stream */
  parent_stream_id: string;
  /** ID of the child stream */
  child_stream_id: string;
}

/**
 * Configuration for creating a new stream
 */
export interface StreamConfig {
  /** Name of the stream */
  name: string;
  /** Description of the stream */
  description: string;
  /** Whether the stream is publicly accessible */
  isPublic: boolean;
  /** Optional metadata for the stream */
  metadata?: Uint8Array;
  /** Optional schema definition */
  schema?: string;
  /** Optional tags for categorization */
  tags?: string[];
}

/**
 * Configuration for creating a snapshot
 */
export interface SnapshotConfig {
  /** Metadata to associate with the snapshot */
  metadata: string;
}

/**
 * Configuration for batch stream creation
 */
export interface BatchStreamConfig {
  /** List of stream configurations to create */
  streams: StreamConfig[];
  /** Options for the batch operation */
  options?: {
    /** Whether to create streams in parallel */
    parallel?: boolean;
    /** Number of retry attempts for failed operations */
    retryCount?: number;
  };
}

/**
 * Configuration for batch stream updates
 */
export interface BatchUpdateConfig {
  /** List of stream updates to perform */
  updates: {
    /** ID of the stream to update */
    streamId: string;
    /** New data to add to the stream */
    data: Uint8Array;
  }[];
  /** Options for the batch operation */
  options?: {
    /** Whether to perform updates in parallel */
    parallel?: boolean;
    /** Number of retry attempts for failed operations */
    retryCount?: number;
  };
}

/**
 * Types of errors that can occur in the SuiPulse SDK
 */
export enum SuiPulseErrorType {
  /** Input validation failed */
  INVALID_INPUT = "INVALID_INPUT",
  /** Network communication error */
  NETWORK_ERROR = "NETWORK_ERROR",
  /** Operation not permitted */
  PERMISSION_DENIED = "PERMISSION_DENIED",
  /** Resource not found */
  NOT_FOUND = "NOT_FOUND",
  /** Transaction failed */
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  /** Batch operation failed */
  BATCH_OPERATION_FAILED = "BATCH_OPERATION_FAILED",
  /** Data validation failed */
  VALIDATION_ERROR = "VALIDATION_ERROR",
  /** Query operation failed */
  QUERY_FAILED = "QUERY_FAILED",
  /** Event subscription failed */
  SUBSCRIPTION_FAILED = "SUBSCRIPTION_FAILED",
  /** Unknown error occurred */
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Custom error class for SuiPulse SDK errors
 */
export class SuiPulseError extends Error {
  constructor(
    /** Type of error that occurred */
    public type: SuiPulseErrorType,
    /** Error message */
    message: string,
    /** Additional error details */
    public details?: unknown
  ) {
    super(message);
    this.name = "SuiPulseError";
  }
}

/**
 * Callback function type for event handlers
 */
export type EventCallback<T> = (event: T) => void | Promise<void>;

/**
 * Interface for event subscriptions
 */
export interface EventSubscription {
  /** Function to unsubscribe from events */
  unsubscribe: () => void;
}

/**
 * Filters for querying events
 */
export interface EventFilters {
  /** Start timestamp for event range */
  fromTimestamp?: string;
  /** End timestamp for event range */
  toTimestamp?: string;
  /** Filter by creator address */
  creator?: string;
  /** Filter by stream ID */
  streamId?: string;
}

/**
 * Options for querying streams
 */
export interface StreamQueryOptions {
  /** Whether to include stream data in the response */
  includeData?: boolean;
  /** Whether to include subscriber list in the response */
  includeSubscribers?: boolean;
  /** Whether to include permission list in the response */
  includePermissions?: boolean;
  /** Whether to include metadata in the response */
  includeMetadata?: boolean;
}

/**
 * Options for querying snapshots
 */
export interface SnapshotQueryOptions {
  /** Whether to include snapshot data in the response */
  includeData?: boolean;
  /** Whether to include metadata in the response */
  includeMetadata?: boolean;
}

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** List of validation errors if any */
  errors?: string[];
}

/**
 * Result of a batch operation
 */
export interface BatchOperationResult<T> {
  /** List of successful operations */
  successful: T[];
  /** List of failed operations with error details */
  failed: Array<{
    /** The item that failed */
    item: T;
    /** The error that occurred */
    error: SuiPulseError;
  }>;
  /** Summary of the batch operation */
  summary: {
    /** Total number of operations */
    total: number;
    /** Number of successful operations */
    succeeded: number;
    /** Number of failed operations */
    failed: number;
  };
}
