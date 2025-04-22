import {
  StreamConfig,
  SnapshotConfig,
  ValidationResult,
  SuiPulseError,
  SuiPulseErrorType,
} from "./types";

export function validateStreamConfig(config: StreamConfig): ValidationResult {
  const errors: string[] = [];

  if (!config.name || config.name.trim().length === 0) {
    errors.push("Stream name is required");
  }

  if (!config.description || config.description.trim().length === 0) {
    errors.push("Stream description is required");
  }

  if (typeof config.isPublic !== "boolean") {
    errors.push("isPublic must be a boolean value");
  }

  if (config.metadata && !(config.metadata instanceof Uint8Array)) {
    errors.push("metadata must be a Uint8Array");
  }

  if (config.tags && !Array.isArray(config.tags)) {
    errors.push("tags must be an array of strings");
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateSnapshotConfig(
  config: SnapshotConfig
): ValidationResult {
  const errors: string[] = [];

  if (!config.metadata || config.metadata.trim().length === 0) {
    errors.push("Snapshot metadata is required");
  } else if (typeof config.metadata !== "string") {
    errors.push("Snapshot metadata must be a string");
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateAddress(address: string): ValidationResult {
  const errors: string[] = [];

  if (!address || !/^0x[a-fA-F0-9]{64}$/.test(address)) {
    errors.push("Invalid Sui address format");
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validatePermissionLevel(level: number): ValidationResult {
  const errors: string[] = [];

  if (typeof level !== "number" || level < 0 || level > 2) {
    errors.push("Permission level must be 0 (read), 1 (write), or 2 (admin)");
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function throwIfInvalid(validation: ValidationResult): void {
  if (!validation.isValid) {
    throw new SuiPulseError(
      SuiPulseErrorType.VALIDATION_ERROR,
      "Validation failed",
      validation.errors
    );
  }
}

export function validateStreamId(streamId: string): ValidationResult {
  const errors: string[] = [];

  if (!streamId || !streamId.startsWith("0x")) {
    errors.push("Invalid stream ID format");
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function validateBatchSize(
  size: number,
  maxBatchSize = 50
): ValidationResult {
  const errors: string[] = [];

  if (size <= 0) {
    errors.push("Batch size must be greater than 0");
  }

  if (size > maxBatchSize) {
    errors.push(`Batch size cannot exceed ${maxBatchSize}`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
