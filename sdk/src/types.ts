import { SuiEvent } from "@mysten/sui.js/client";

// Base Types
export interface DataStreamObject {
  type: string;
  owner: string;
  subscribers: string[];
  data: string;
  version: string;
  timestamp: string;
  schema?: string;
}

export interface DataStream {
  id: string;
  name: string;
  description: string;
  owner: string;
  subscribers: string[];
  lastUpdated: string;
  data: Uint8Array;
  isPublic: boolean;
  parentStreams: string[];
  permissions: Permission[];
  metadata: Uint8Array;
  walrusId?: string;
  version: string;
  tags: string[];
  schema?: string;
  lastSnapshotVersion: string;
  lastSnapshotTimestamp: string;
}

export interface StreamSnapshot {
  id: string;
  streamId: string;
  data: Uint8Array;
  timestamp: string;
  version: string;
  metadata: string;
  creator: string;
}

export interface Permission {
  address: string;
  level: number; // 0: read, 1: write, 2: admin
}

// Event Types
export interface DataStreamCreatedEvent extends SuiEvent {
  stream_id: string;
  name: string;
  owner: string;
}

export interface DataStreamUpdatedEvent extends SuiEvent {
  stream_id: string;
  timestamp: string;
}

export interface SnapshotCreatedEvent extends SuiEvent {
  stream_id: string;
  snapshot_id: string;
  timestamp: string;
  version: string;
  creator: string;
}

export interface SubscriberAddedEvent extends SuiEvent {
  stream_id: string;
  subscriber: string;
}

export interface StreamsComposedEvent extends SuiEvent {
  parent_stream_id: string;
  child_stream_id: string;
}

// Configuration Types
export interface StreamConfig {
  name: string;
  description: string;
  isPublic: boolean;
  metadata?: Uint8Array;
  schema?: string;
  tags?: string[];
}

export interface SnapshotConfig {
  metadata: string;
}

export interface BatchStreamConfig {
  streams: StreamConfig[];
  options?: {
    parallel?: boolean;
    retryCount?: number;
  };
}

export interface BatchUpdateConfig {
  updates: {
    streamId: string;
    data: Uint8Array;
  }[];
  options?: {
    parallel?: boolean;
    retryCount?: number;
  };
}

// Error Types
export enum SuiPulseErrorType {
  INVALID_INPUT = "INVALID_INPUT",
  NETWORK_ERROR = "NETWORK_ERROR",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  NOT_FOUND = "NOT_FOUND",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  BATCH_OPERATION_FAILED = "BATCH_OPERATION_FAILED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  QUERY_FAILED = "QUERY_FAILED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class SuiPulseError extends Error {
  constructor(
    public type: SuiPulseErrorType,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "SuiPulseError";
  }
}

// Event Listener Types
export type EventCallback<T> = (event: T) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe: () => void;
}

export interface EventFilters {
  fromTimestamp?: string;
  toTimestamp?: string;
  creator?: string;
  streamId?: string;
}

// Query Types
export interface StreamQueryOptions {
  includeData?: boolean;
  includeSubscribers?: boolean;
  includePermissions?: boolean;
  includeMetadata?: boolean;
}

export interface SnapshotQueryOptions {
  includeData?: boolean;
  includeMetadata?: boolean;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

// Response Types
export interface BatchOperationResult<T> {
  successful: T[];
  failed: Array<{
    item: T;
    error: SuiPulseError;
  }>;
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
}
