import { SuiClient } from "@mysten/sui.js/client";
import { SuiEvent, Unsubscribe } from "@mysten/sui.js/client";
import {
  EventCallback,
  EventSubscription,
  EventFilters,
  DataStreamCreatedEvent,
  DataStreamUpdatedEvent,
  SnapshotCreatedEvent,
  SubscriberAddedEvent,
  StreamsComposedEvent,
  SuiPulseError,
  SuiPulseErrorType,
} from "./types";

export class EventManager {
  private subscriptions: Map<string, Set<EventCallback<any>>> = new Map();
  private eventPollingInterval: number = 1000; // 1 second default
  private subscriptionHandles: Map<string, Promise<Unsubscribe>> = new Map();

  constructor(private client: SuiClient, private packageId: string) {}

  /**
   * Subscribe to stream creation events
   */
  public subscribeToStreamCreation(
    callback: EventCallback<DataStreamCreatedEvent>
  ): () => void {
    return this.subscribe("StreamCreated", callback);
  }

  /**
   * Subscribe to stream update events
   */
  public subscribeToStreamUpdates(
    callback: EventCallback<DataStreamUpdatedEvent>
  ): () => void {
    return this.subscribe("StreamUpdated", callback);
  }

  /**
   * Subscribe to snapshot creation events
   */
  public subscribeToSnapshotCreation(
    callback: EventCallback<SnapshotCreatedEvent>
  ): () => void {
    return this.subscribe("SnapshotCreated", callback);
  }

  /**
   * Subscribe to subscriber added events
   */
  public subscribeToSubscriberAdded(
    callback: EventCallback<SubscriberAddedEvent>
  ): () => void {
    return this.subscribe("SubscriberAdded", callback);
  }

  /**
   * Subscribe to streams composed events
   */
  public subscribeToStreamsComposed(
    callback: EventCallback<StreamsComposedEvent>
  ): () => void {
    return this.subscribe("StreamsComposed", callback);
  }

  private subscribe<T>(
    eventType: string,
    callback: EventCallback<T>
  ): () => void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
      this.startSubscription(eventType);
    }

    this.subscriptions.get(eventType)!.add(callback);

    return () => {
      const callbacks = this.subscriptions.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(eventType);
          this.stopSubscription(eventType);
        }
      }
    };
  }

  private async startSubscription(eventType: string): Promise<void> {
    try {
      const unsubscribePromise = this.client.subscribeEvent({
        filter: {
          MoveEventType: `${this.packageId}::data_stream::${eventType}`,
        },
        onMessage: (event: SuiEvent) => {
          const callbacks = this.subscriptions.get(eventType);
          if (callbacks) {
            for (const callback of callbacks) {
              try {
                callback(event.parsedJson);
              } catch (error) {
                console.error(
                  `Error in event callback for ${eventType}:`,
                  error
                );
              }
            }
          }
        },
      });

      this.subscriptionHandles.set(eventType, unsubscribePromise);

      // Handle subscription errors
      try {
        await unsubscribePromise;
      } catch (error) {
        console.error(`Subscription error for ${eventType}:`, error);
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (this.subscriptions.has(eventType)) {
            this.stopSubscription(eventType);
            this.startSubscription(eventType);
          }
        }, this.eventPollingInterval);
      }
    } catch (error) {
      console.error(`Failed to start subscription for ${eventType}:`, error);
    }
  }

  private async stopSubscription(eventType: string): Promise<void> {
    const unsubscribePromise = this.subscriptionHandles.get(eventType);
    if (unsubscribePromise) {
      try {
        const unsubscribe = await unsubscribePromise;
        await unsubscribe();
      } catch (error) {
        console.error(`Error unsubscribing from ${eventType}:`, error);
      }
      this.subscriptionHandles.delete(eventType);
    }
  }

  /**
   * Set the polling interval for reconnection attempts
   */
  public setPollingInterval(interval: number): void {
    if (interval < 500) {
      throw new SuiPulseError(
        SuiPulseErrorType.INVALID_INPUT,
        "Polling interval cannot be less than 500ms"
      );
    }
    this.eventPollingInterval = interval;
  }

  /**
   * Clean up all subscriptions
   */
  public async cleanup(): Promise<void> {
    const stopPromises = Array.from(this.subscriptionHandles.keys()).map(
      (eventType) => this.stopSubscription(eventType)
    );
    await Promise.all(stopPromises);
    this.subscriptions.clear();
  }
}
