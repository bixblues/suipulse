import { SuiClient } from "@mysten/sui.js/client";
import { SuiEvent } from "@mysten/sui.js/client";
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
 * SubscriptionInfo - Tracks subscription state
 */
interface SubscriptionInfo {
  callback: (event: unknown) => void;
  cursor: string | null;
  lastProcessedTimestamp: number;
}

/**
 * EventManager - Handles event polling and notifications for SuiPulse events
 */
export class EventManager {
  private subscriptions: Map<EventType, Set<SubscriptionInfo>> = new Map();
  private pollingIntervals: Map<EventType, NodeJS.Timeout> = new Map();
  private readonly POLLING_INTERVAL = 2000; // 2 seconds

  /**
   * Creates a new EventManager instance
   *
   * @param client - The SuiClient instance to use for event polling
   * @param packageId - The package ID of the SuiPulse contract
   */
  constructor(private client: SuiClient, private packageId: string) {}

  /**
   * Subscribes to stream creation events
   */
  public subscribeToStreamCreation(
    callback: EventCallback<EventTypeMap[EventType.DataStreamCreated]>
  ): () => void {
    return this.subscribe(EventType.DataStreamCreated, callback);
  }

  /**
   * Subscribes to stream update events
   */
  public subscribeToStreamUpdates(
    callback: EventCallback<EventTypeMap[EventType.DataStreamUpdated]>
  ): () => void {
    return this.subscribe(EventType.DataStreamUpdated, callback);
  }

  /**
   * Subscribes to snapshot creation events
   */
  public subscribeToSnapshotCreation(
    callback: EventCallback<EventTypeMap[EventType.SnapshotCreated]>
  ): () => void {
    return this.subscribe(EventType.SnapshotCreated, callback);
  }

  /**
   * Subscribes to subscriber added events
   */
  public subscribeToSubscriberAdded(
    callback: EventCallback<EventTypeMap[EventType.SubscriberAdded]>
  ): () => void {
    return this.subscribe(EventType.SubscriberAdded, callback);
  }

  /**
   * Subscribes to streams composed events
   */
  public subscribeToStreamsComposed(
    callback: EventCallback<EventTypeMap[EventType.StreamsComposed]>
  ): () => void {
    return this.subscribe(EventType.StreamsComposed, callback);
  }

  /**
   * Internal method to handle event subscriptions
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
      this.startPolling(eventType);
    }

    const subscriptionInfo: SubscriptionInfo = {
      callback: callback as (event: unknown) => void,
      cursor: null,
      lastProcessedTimestamp: Date.now(),
    };

    this.subscriptions.get(eventType)!.add(subscriptionInfo);

    return () => {
      const subscriptions = this.subscriptions.get(eventType);
      if (subscriptions) {
        subscriptions.delete(subscriptionInfo);
        if (subscriptions.size === 0) {
          this.subscriptions.delete(eventType);
          this.stopPolling(eventType);
        }
      }
    };
  }

  /**
   * Starts polling for events of a specific type
   */
  private startPolling(eventType: EventType): void {
    if (this.pollingIntervals.has(eventType)) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const subscriptions = this.subscriptions.get(eventType);
        if (!subscriptions) return;

        for (const subscription of subscriptions) {
          const events = await this.fetchEvents(eventType, subscription.cursor);
          if (events.data.length > 0) {
            this.processEvents(eventType, events.data, subscription);

            // Update cursor to the latest event
            const latestEvent = events.data[0];
            subscription.cursor = `${latestEvent.id.txDigest}-${latestEvent.id.eventSeq}`;
          }
        }
      } catch (error) {
        console.error(`Error polling for ${eventType} events:`, error);
      }
    }, this.POLLING_INTERVAL);

    this.pollingIntervals.set(eventType, interval);
  }

  /**
   * Stops polling for events of a specific type
   */
  private stopPolling(eventType: EventType): void {
    const interval = this.pollingIntervals.get(eventType);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(eventType);
    }
  }

  /**
   * Fetches events of a specific type
   */
  private async fetchEvents(
    eventType: EventType,
    cursor: string | null
  ): Promise<{ data: SuiEvent[] }> {
    const eventName = this.getEventName(eventType);

    try {
      const query: {
        MoveModule: {
          package: string;
          module: string;
          cursor?: {
            txDigest: string;
            eventSeq: number;
          };
        };
      } = {
        MoveModule: {
          package: this.packageId,
          module: "data_stream",
        },
      };

      // If we have a cursor, add it to the query
      if (cursor) {
        const [txDigest, eventSeq] = cursor.split("-");
        query.MoveModule.cursor = {
          txDigest,
          eventSeq: parseInt(eventSeq),
        };
      }

      const events = await this.client.queryEvents({
        query,
        limit: 100,
        order: "descending",
      });

      // Filter events by type
      return {
        data: events.data.filter((event) => event.type.includes(eventName)),
      };
    } catch (error) {
      console.error(`Error fetching ${eventType} events:`, error);
      return { data: [] };
    }
  }

  /**
   * Processes received events
   */
  private processEvents(
    eventType: EventType,
    events: SuiEvent[],
    subscription: SubscriptionInfo
  ): void {
    for (const event of events) {
      try {
        const eventData = this.transformEventData(eventType, event.parsedJson);
        subscription.callback(eventData);
        subscription.lastProcessedTimestamp = Date.now();
      } catch (error) {
        console.error(`Error processing ${eventType} event:`, error);
      }
    }
  }

  /**
   * Gets the event name for a given event type
   */
  private getEventName(eventType: EventType): string {
    switch (eventType) {
      case EventType.DataStreamUpdated:
        return "DataStreamUpdated";
      case EventType.DataStreamCreated:
        return "DataStreamCreated";
      case EventType.SnapshotCreated:
        return "SnapshotCreated";
      case EventType.SubscriberAdded:
        return "SubscriberAdded";
      case EventType.StreamsComposed:
        return "StreamsComposed";
      default:
        throw new Error(`Unknown event type: ${eventType}`);
    }
  }

  private transformEventData(eventType: EventType, data: unknown): unknown {
    const d = data as Record<string, unknown>;
    switch (eventType) {
      case EventType.DataStreamUpdated:
        return {
          stream_id: d.stream_id,
          timestamp: d.timestamp,
        };
      case EventType.DataStreamCreated:
        return {
          stream_id: d.stream_id,
          name: d.name,
          owner: d.owner,
        };
      case EventType.SubscriberAdded:
        return {
          stream_id: d.stream_id,
          subscriber: d.subscriber,
        };
      case EventType.StreamsComposed:
        return {
          parent_stream_id: d.parent_stream_id,
          child_stream_id: d.child_stream_id,
        };
      default:
        return data;
    }
  }

  /**
   * Cleans up all polling intervals and resources
   */
  public async cleanup(): Promise<void> {
    for (const [eventType] of this.pollingIntervals) {
      this.stopPolling(eventType);
    }
    this.subscriptions.clear();
  }
}
