/**
 * @packageDocumentation
 * @module @suipulse/sdk
 *
 * SuiPulse SDK - A TypeScript SDK for interacting with the SuiPulse data mesh protocol
 *
 * @example
 * ```typescript
 * import { SuiPulse, Network, EventManager } from '@suipulse/sdk';
 *
 * // Create a new SuiPulse instance
 * const suiPulse = new SuiPulse(keypair);
 *
 * // Use the EventManager for event handling
 * const eventManager = new EventManager(client, packageId);
 * ```
 */

/**
 * Main SDK class for interacting with the SuiPulse protocol
 * @see {@link SuiPulse}
 */
export { SuiPulse } from "./suipulse";

/**
 * Event management system for handling SuiPulse events
 * @see {@link EventManager}
 */
export { EventManager } from "./events";

/**
 * Validation utilities for input validation
 * @see {@link validation}
 */
export * from "./validation";

/**
 * Type definitions for the SuiPulse protocol
 * @see {@link types}
 */
export * from "./types";

/**
 * Network configuration and types
 * @see {@link Network}
 * @see {@link NetworkConfig}
 * @see {@link SuiPulseConfig}
 */
export { Network, NetworkConfig, SuiPulseConfig } from "./config";
