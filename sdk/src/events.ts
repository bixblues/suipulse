import { SuiClient } from "@mysten/sui.js/client";
import { SuiEvent, Unsubscribe } from "@mysten/sui.js/client";
import {
  EventCallback,
  DataStreamCreatedEvent,
  DataStreamUpdatedEvent,
  SnapshotCreatedEvent,
  SubscriberAddedEvent,
  StreamsComposedEvent,
  SuiPulseError,
  SuiPulseErrorType,
} from "./types";

/**
 * Enum representing different types of events that can be subscribed to
 */
export enum EventType {
  /** Event emitted when a new data stream is created */
  DataStreamCreated = "DataStreamCreated",
  /** Event emitted when a data stream is updated */
  DataStreamUpdated = "DataStreamUpdated",
  /** Event emitted when a snapshot is created */
  SnapshotCreated = "SnapshotCreated",
  /** Event emitted when a new subscriber is added to a stream */
  SubscriberAdded = "SubscriberAdded",
  /** Event emitted when streams are composed */
  StreamsComposed = "StreamsComposed",
}

/**
 * Type mapping event types to their corresponding event data types
 */
type EventTypeMap = {
  [EventType.DataStreamCreated]: DataStreamCreatedEvent;
  [EventType.DataStreamUpdated]: DataStreamUpdatedEvent;
  [EventType.SnapshotCreated]: SnapshotCreatedEvent;
  [EventType.SubscriberAdded]: SubscriberAddedEvent;
  [EventType.StreamsComposed]: StreamsComposedEvent;
};

/**
 * EventManager - Handles event subscriptions and notifications for SuiPulse events
 *
 * @example
 * ```typescript
 * const eventManager = new EventManager(client, packageId);
 *
 * // Subscribe to stream updates
 * const unsubscribe = eventManager.subscribeToStreamUpdates((event) => {
 *   console.log('Stream updated:', event);
 * });
 *
 * // Later, when done
 * unsubscribe();
 * ```
 */
export class EventManager {
  private subscriptions: Map<EventType, Set<EventCallback<any>>> = new Map();
  private eventPollingInterval: number = 1000; // 1 second default
  private subscriptionHandles: Map<EventType, Promise<Unsubscribe>> = new Map();
  private readonly MIN_POLLING_INTERVAL = 500;

  /**
   * Creates a new EventManager instance
   *
   * @param client - The SuiClient instance to use for event subscriptions
   * @param packageId - The package ID of the SuiPulse contract
   */
  constructor(private client: SuiClient, private packageId: string) {}

  /**
   * Subscribes to stream creation events
   *
   * @param callback - Function to be called when a stream is created
   * @returns A function to unsubscribe from the events
   * @throws {SuiPulseError} If the subscription fails
   *
   * @example
   * ```typescript
   * const unsubscribe = eventManager.subscribeToStreamCreation((event) => {
   *   console.log('New stream created:', event);
   * });
   * ```
   */
  public subscribeToStreamCreation(
    callback: EventCallback<EventTypeMap[EventType.DataStreamCreated]>
  ): () => void {
    return this.subscribe(EventType.DataStreamCreated, callback);
  }

  /**
   * Subscribes to stream update events
   *
   * @param callback - Function to be called when a stream is updated
   * @returns A function to unsubscribe from the events
   * @throws {SuiPulseError} If the subscription fails
   *
   * @example
   * ```typescript
   * const unsubscribe = eventManager.subscribeToStreamUpdates((event) => {
   *   console.log('Stream updated:', event);
   * });
   * ```
   */
  public subscribeToStreamUpdates(
    callback: EventCallback<EventTypeMap[EventType.DataStreamUpdated]>
  ): () => void {
    return this.subscribe(EventType.DataStreamUpdated, callback);
  }

  /**
   * Subscribes to snapshot creation events
   *
   * @param callback - Function to be called when a snapshot is created
   * @returns A function to unsubscribe from the events
   * @throws {SuiPulseError} If the subscription fails
   *
   * @example
   * ```typescript
   * const unsubscribe = eventManager.subscribeToSnapshotCreation((event) => {
   *   console.log('Snapshot created:', event);
   * });
   * ```
   */
  public subscribeToSnapshotCreation(
    callback: EventCallback<EventTypeMap[EventType.SnapshotCreated]>
  ): () => void {
    return this.subscribe(EventType.SnapshotCreated, callback);
  }

  /**
   * Subscribes to subscriber added events
   *
   * @param callback - Function to be called when a subscriber is added
   * @returns A function to unsubscribe from the events
   * @throws {SuiPulseError} If the subscription fails
   *
   * @example
   * ```typescript
   * const unsubscribe = eventManager.subscribeToSubscriberAdded((event) => {
   *   console.log('New subscriber added:', event);
   * });
   * ```
   */
  public subscribeToSubscriberAdded(
    callback: EventCallback<EventTypeMap[EventType.SubscriberAdded]>
  ): () => void {
    return this.subscribe(EventType.SubscriberAdded, callback);
  }

  /**
   * Subscribes to streams composed events
   *
   * @param callback - Function to be called when streams are composed
   * @returns A function to unsubscribe from the events
   * @throws {SuiPulseError} If the subscription fails
   *
   * @example
   * ```typescript
   * const unsubscribe = eventManager.subscribeToStreamsComposed((event) => {
   *   console.log('Streams composed:', event);
   * });
   * ```
   */
  public subscribeToStreamsComposed(
    callback: EventCallback<EventTypeMap[EventType.StreamsComposed]>
  ): () => void {
    return this.subscribe(EventType.StreamsComposed, callback);
  }

  /**
   * Internal method to handle event subscriptions
   *
   * @param eventType - The type of event to subscribe to
   * @param callback - The callback function to be called when the event occurs
   * @returns A function to unsubscribe from the events
   * @throws {SuiPulseError} If the event type is invalid or subscription fails
   */
  private subscribe<T extends EventType>(
    eventType: T,
    callback: EventCallback<EventTypeMap[T]>
  ): () => void {
    if (!Object.values(EventType).includes(eventType)) {
      throw new SuiPulseError(
        SuiPulseErrorType.INVALID_INPUT,
        `Invalid event type: ${eventType}`
      );
    }

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
      this.startSubscription(eventType).catch((error) => {
        console.error(`Failed to start subscription: ${error}`);
        this.subscriptions.delete(eventType);
      });
    }

    this.subscriptions.get(eventType)!.add(callback);

    return () => {
      const callbacks = this.subscriptions.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(eventType);
          this.stopSubscription(eventType).catch(console.error);
        }
      }
    };
  }

  /**
   * Starts a subscription for a specific event type
   *
   * @param eventType - The type of event to subscribe to
   * @throws {SuiPulseError} If the subscription fails
   */
  private async startSubscription(eventType: EventType): Promise<void> {
    try {
      const unsubscribePromise = this.client.subscribeEvent({
        filter: {
          MoveEventType: `${this.packageId}::data_stream::${eventType}`,
        },
        onMessage: this.createMessageHandler(eventType),
      });

      this.subscriptionHandles.set(eventType, unsubscribePromise);

      try {
        await unsubscribePromise;
      } catch (error) {
        this.handleSubscriptionError(eventType, error);
      }
    } catch (error) {
      throw new SuiPulseError(
        SuiPulseErrorType.SUBSCRIPTION_FAILED,
        `Failed to start subscription for ${eventType}: ${error}`
      );
    }
  }

  /**
   * Creates a message handler for a specific event type
   *
   * @param eventType - The type of event to handle
   * @returns A function that handles incoming events
   */
  private createMessageHandler(eventType: EventType) {
    return (event: SuiEvent) => {
      const callbacks = this.subscriptions.get(eventType);
      if (callbacks) {
        for (const callback of callbacks) {
          try {
            callback(event.parsedJson);
          } catch (error) {
            console.error(`Error in event callback for ${eventType}:`, error);
          }
        }
      }
    };
  }

  /**
   * Handles subscription errors and attempts to reconnect
   *
   * @param eventType - The type of event that encountered an error
   * @param error - The error that occurred
   */
  private handleSubscriptionError(eventType: EventType, error: unknown): void {
    console.error(`Subscription error for ${eventType}:`, error);
    setTimeout(() => {
      if (this.subscriptions.has(eventType)) {
        this.stopSubscription(eventType)
          .then(() => this.startSubscription(eventType))
          .catch(console.error);
      }
    }, this.eventPollingInterval);
  }

  /**
   * Stops a subscription for a specific event type
   *
   * @param eventType - The type of event to unsubscribe from
   * @throws {SuiPulseError} If unsubscribing fails
   */
  private async stopSubscription(eventType: EventType): Promise<void> {
    const unsubscribePromise = this.subscriptionHandles.get(eventType);
    if (unsubscribePromise) {
      try {
        const unsubscribe = await unsubscribePromise;
        await unsubscribe();
      } catch (error) {
        throw new SuiPulseError(
          SuiPulseErrorType.SUBSCRIPTION_FAILED,
          `Error unsubscribing from ${eventType}: ${error}`
        );
      }
      this.subscriptionHandles.delete(eventType);
    }
  }

  /**
   * Sets the polling interval for reconnection attempts
   *
   * @param interval - The interval in milliseconds (must be >= 500ms)
   * @throws {SuiPulseError} If the interval is less than the minimum allowed
   *
   * @example
   * ```typescript
   * eventManager.setPollingInterval(2000); // Set to 2 seconds
   * ```
   */
  public setPollingInterval(interval: number): void {
    if (interval < this.MIN_POLLING_INTERVAL) {
      throw new SuiPulseError(
        SuiPulseErrorType.INVALID_INPUT,
        `Polling interval cannot be less than ${this.MIN_POLLING_INTERVAL}ms`
      );
    }
    this.eventPollingInterval = interval;
  }

  /**
   * Cleans up all subscriptions and resources
   *
   * @example
   * ```typescript
   * await eventManager.cleanup();
   * ```
   */
  public async cleanup(): Promise<void> {
    const stopPromises = Array.from(this.subscriptionHandles.keys()).map(
      (eventType) => this.stopSubscription(eventType)
    );
    await Promise.all(stopPromises);
    this.subscriptions.clear();
  }
}
