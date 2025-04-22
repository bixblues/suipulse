import { SuiClient } from "@mysten/sui.js/client";
import { EventManager } from "../events";
import { SuiPulseError } from "../types";

jest.mock("@mysten/sui.js/client");

describe("EventManager", () => {
  let eventManager: EventManager;
  let mockClient: jest.Mocked<SuiClient>;

  beforeEach(() => {
    mockClient = new SuiClient({ url: "mock" }) as jest.Mocked<SuiClient>;
    eventManager = new EventManager(mockClient, "0xpackageId");
  });

  afterEach(() => {
    eventManager.cleanup();
    jest.clearAllMocks();
  });

  describe("Event Subscriptions", () => {
    it("should subscribe to stream creation events", async () => {
      const mockEvent = {
        id: {
          txDigest: "123",
          eventSeq: "1",
        },
        packageId: "0xpackageId",
        transactionModule: "data_stream",
        type: "0xpackageId::data_stream::StreamCreated",
        sender: "0x123",
        parsedJson: {
          streamId: "0x456",
          owner: "0x123",
          name: "Test Stream",
        },
        bcs: "0x123",
        timestampMs: "123456789",
      };

      const mockUnsubscribe = jest.fn();
      mockClient.subscribeEvent.mockResolvedValue(mockUnsubscribe);

      const mockCallback = jest.fn();
      eventManager.subscribeToStreamCreation(mockCallback);

      // Simulate event emission
      const subscribeEventCall = mockClient.subscribeEvent.mock.calls[0][0];
      subscribeEventCall.onMessage(mockEvent);

      expect(mockCallback).toHaveBeenCalledWith(mockEvent.parsedJson);
    });

    it("should handle multiple subscriptions", async () => {
      const mockEvent = {
        id: {
          txDigest: "123",
          eventSeq: "1",
        },
        packageId: "0xpackageId",
        transactionModule: "data_stream",
        type: "0xpackageId::data_stream::StreamUpdated",
        sender: "0x123",
        parsedJson: {
          streamId: "0x456",
          version: "2",
        },
        bcs: "0x123",
        timestampMs: "123456789",
      };

      const mockUnsubscribe = jest.fn();
      mockClient.subscribeEvent.mockResolvedValue(mockUnsubscribe);

      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const unsubscribe1 = eventManager.subscribeToStreamUpdates(callback1);
      eventManager.subscribeToStreamUpdates(callback2);

      // Simulate event emission
      const subscribeEventCall = mockClient.subscribeEvent.mock.calls[0][0];
      subscribeEventCall.onMessage(mockEvent);

      expect(callback1).toHaveBeenCalledWith(mockEvent.parsedJson);
      expect(callback2).toHaveBeenCalledWith(mockEvent.parsedJson);

      // Test unsubscribe
      unsubscribe1();
      subscribeEventCall.onMessage(mockEvent);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(2);
    });
  });

  describe("Polling Configuration", () => {
    it("should set polling interval", () => {
      const interval = 5000;
      expect(() => eventManager.setPollingInterval(interval)).not.toThrow();
    });

    it("should throw error for invalid polling interval", () => {
      expect(() => eventManager.setPollingInterval(-1000)).toThrow(
        SuiPulseError
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      const mockCallback = jest.fn();
      eventManager.subscribeToStreamCreation(mockCallback);

      // Simulate network error by rejecting the subscription promise
      mockClient.subscribeEvent.mockRejectedValue(new Error("Network error"));

      // Wait for error handling
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("should handle callback errors without breaking event processing", () => {
      const mockEvent = {
        id: {
          txDigest: "123",
          eventSeq: "1",
        },
        packageId: "0xpackageId",
        transactionModule: "data_stream",
        type: "0xpackageId::data_stream::StreamCreated",
        sender: "0x123",
        parsedJson: {
          streamId: "0x456",
          owner: "0x123",
          name: "Test Stream",
        },
        bcs: "0x123",
        timestampMs: "123456789",
      };

      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error("Callback error");
      });
      const successCallback = jest.fn();

      eventManager.subscribeToStreamCreation(errorCallback);
      eventManager.subscribeToStreamCreation(successCallback);

      // This should not throw
      expect(() => {
        mockClient.subscribeEvent.mock.calls[0][0].onMessage(mockEvent);
      }).not.toThrow();

      expect(errorCallback).toHaveBeenCalled();
      expect(successCallback).toHaveBeenCalled();
    });
  });
});
