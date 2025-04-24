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

export enum EventType {
  StreamCreated = "StreamCreated",
  StreamUpdated = "StreamUpdated",
  SnapshotCreated = "SnapshotCreated",
  SubscriberAdded = "SubscriberAdded",
  StreamsComposed = "StreamsComposed",
}

type EventTypeMap = {
  [EventType.StreamCreated]: DataStreamCreatedEvent;
  [EventType.StreamUpdated]: DataStreamUpdatedEvent;
  [EventType.SnapshotCreated]: SnapshotCreatedEvent;
  [EventType.SubscriberAdded]: SubscriberAddedEvent;
  [EventType.StreamsComposed]: StreamsComposedEvent;
};

export class EventManager {
  private subscriptions: Map<EventType, Set<EventCallback<any>>> = new Map();
  private eventPollingInterval: number = 1000; // 1 second default
  private subscriptionHandles: Map<EventType, Promise<Unsubscribe>> = new Map();
  private readonly MIN_POLLING_INTERVAL = 500;

  constructor(private client: SuiClient, private packageId: string) {}

  /**
   * Subscribe to stream creation events
   */
  public subscribeToStreamCreation(
    callback: EventCallback<EventTypeMap[EventType.StreamCreated]>
  ): () => void {
    return this.subscribe(EventType.StreamCreated, callback);
  }

  /**
   * Subscribe to stream update events
   */
  public subscribeToStreamUpdates(
    callback: EventCallback<EventTypeMap[EventType.StreamUpdated]>
  ): () => void {
    return this.subscribe(EventType.StreamUpdated, callback);
  }

  /**
   * Subscribe to snapshot creation events
   */
  public subscribeToSnapshotCreation(
    callback: EventCallback<EventTypeMap[EventType.SnapshotCreated]>
  ): () => void {
    return this.subscribe(EventType.SnapshotCreated, callback);
  }

  /**
   * Subscribe to subscriber added events
   */
  public subscribeToSubscriberAdded(
    callback: EventCallback<EventTypeMap[EventType.SubscriberAdded]>
  ): () => void {
    return this.subscribe(EventType.SubscriberAdded, callback);
  }

  /**
   * Subscribe to streams composed events
   */
  public subscribeToStreamsComposed(
    callback: EventCallback<EventTypeMap[EventType.StreamsComposed]>
  ): () => void {
    return this.subscribe(EventType.StreamsComposed, callback);
  }

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
   * Set the polling interval for reconnection attempts
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
