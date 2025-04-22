import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  SuiTransactionBlockResponse,
  type SuiObjectResponse,
} from "@mysten/sui.js/client";
import { SuiPulse } from "../suipulse";
import { SuiPulseError, SuiPulseErrorType } from "../types";

jest.mock("@mysten/sui.js/client");
jest.mock("@mysten/sui.js/transactions");

describe("SuiPulse", () => {
  let suiPulse: SuiPulse;
  let mockClient: jest.Mocked<SuiClient>;
  let mockKeypair: Ed25519Keypair;

  beforeEach(() => {
    mockClient = new SuiClient({ url: "mock" }) as jest.Mocked<SuiClient>;
    mockKeypair = Ed25519Keypair.generate();
    suiPulse = new SuiPulse(mockClient, "0xpackageId", mockKeypair);
  });

  afterEach(() => {
    suiPulse.cleanup();
    jest.clearAllMocks();
  });

  describe("Stream Operations", () => {
    it("should create a stream successfully", async () => {
      const mockTxResponse: SuiTransactionBlockResponse = {
        digest: "123",
        transaction: {
          data: {
            gasData: {
              payment: [],
              owner: "0x123",
              price: "1",
              budget: "1000",
            },
            sender: "0x123",
            messageVersion: "v1",
            transaction: {
              kind: "ProgrammableTransaction",
              inputs: [],
              transactions: [],
            },
          },
          txSignatures: [],
        },
        effects: {
          messageVersion: "v1",
          status: { status: "success" },
          executedEpoch: "0",
          gasUsed: {
            computationCost: "0",
            storageCost: "0",
            storageRebate: "0",
            nonRefundableStorageFee: "0",
          },
          modifiedAtVersions: [],
          sharedObjects: [],
          transactionDigest: "123",
          created: [
            {
              owner: { AddressOwner: "0x123" },
              reference: { objectId: "0x123", version: "1", digest: "123" },
            },
          ],
          mutated: [],
          deleted: [],
          unwrapped: [],
          wrapped: [],
          gasObject: {
            owner: { AddressOwner: "0x456" },
            reference: { objectId: "0x456", version: "1", digest: "456" },
          },
        },
        events: [],
        objectChanges: [],
        balanceChanges: [],
        timestampMs: null,
        checkpoint: null,
      };

      mockClient.signAndExecuteTransactionBlock.mockResolvedValue(
        mockTxResponse
      );

      const result = await suiPulse.createStream({
        name: "Test Stream",
        description: "Test Description",
        isPublic: true,
        tags: ["test"],
      });

      expect(result).toEqual(mockTxResponse);
      expect(mockClient.signAndExecuteTransactionBlock).toHaveBeenCalled();
    });

    it("should handle stream creation errors", async () => {
      mockClient.signAndExecuteTransactionBlock.mockRejectedValue(
        new Error("Transaction failed")
      );

      await expect(
        suiPulse.createStream({
          name: "Test Stream",
          description: "Test Description",
          isPublic: true,
        })
      ).rejects.toThrow(SuiPulseError);
    });

    it("should create streams in batch", async () => {
      const mockTxResponse: SuiTransactionBlockResponse = {
        digest: "123",
        transaction: {
          data: {
            gasData: {
              payment: [],
              owner: "0x123",
              price: "1",
              budget: "1000",
            },
            sender: "0x123",
            messageVersion: "v1",
            transaction: {
              kind: "ProgrammableTransaction",
              inputs: [],
              transactions: [],
            },
          },
          txSignatures: [],
        },
        effects: {
          messageVersion: "v1",
          status: { status: "success" },
          executedEpoch: "0",
          gasUsed: {
            computationCost: "0",
            storageCost: "0",
            storageRebate: "0",
            nonRefundableStorageFee: "0",
          },
          modifiedAtVersions: [],
          sharedObjects: [],
          transactionDigest: "123",
          created: [
            {
              owner: { AddressOwner: "0x123" },
              reference: { objectId: "0x123", version: "1", digest: "123" },
            },
          ],
          mutated: [],
          deleted: [],
          unwrapped: [],
          wrapped: [],
          gasObject: {
            owner: { AddressOwner: "0x456" },
            reference: { objectId: "0x456", version: "1", digest: "456" },
          },
        },
        events: [],
        objectChanges: [],
        balanceChanges: [],
        timestampMs: null,
        checkpoint: null,
      };

      mockClient.signAndExecuteTransactionBlock.mockResolvedValue(
        mockTxResponse
      );

      const result = await suiPulse.createStreamsBatch({
        streams: [
          {
            name: "Stream 1",
            description: "Description 1",
            isPublic: true,
          },
          {
            name: "Stream 2",
            description: "Description 2",
            isPublic: true,
          },
        ],
      });

      expect(result.summary.total).toBe(2);
      expect(result.successful.length).toBe(2);
      expect(result.failed.length).toBe(0);
    });
  });

  describe("Snapshot Operations", () => {
    it("should create a snapshot successfully", async () => {
      // Mock the getObject call that's used for validation
      mockClient.getObject.mockResolvedValueOnce({
        data: {
          objectId: "0x123",
          version: "1",
          digest: "123",
          type: "moveObject",
          content: {
            dataType: "moveObject" as const,
            type: "0xpackageId::data_stream::DataStream",
            hasPublicTransfer: true,
            fields: {
              type: "stream",
              owner: "0x123",
              subscribers: [],
              data: "test",
              version: "1",
              timestamp: "123456789",
              schema: "test-schema",
            },
          },
          owner: { AddressOwner: "0x123" },
          previousTransaction: "123",
          storageRebate: "0",
          display: null,
        },
        error: null,
      });

      const mockTxResponse: SuiTransactionBlockResponse = {
        digest: "123",
        transaction: {
          data: {
            gasData: {
              payment: [],
              owner: "0x123",
              price: "1",
              budget: "1000",
            },
            sender: "0x123",
            messageVersion: "v1",
            transaction: {
              kind: "ProgrammableTransaction",
              inputs: [],
              transactions: [],
            },
          },
          txSignatures: [],
        },
        effects: {
          messageVersion: "v1",
          status: { status: "success" },
          executedEpoch: "0",
          gasUsed: {
            computationCost: "0",
            storageCost: "0",
            storageRebate: "0",
            nonRefundableStorageFee: "0",
          },
          modifiedAtVersions: [],
          sharedObjects: [],
          transactionDigest: "123",
          created: [
            {
              owner: { AddressOwner: "0x123" },
              reference: { objectId: "0x123", version: "1", digest: "123" },
            },
          ],
          mutated: [],
          deleted: [],
          unwrapped: [],
          wrapped: [],
          gasObject: {
            owner: { AddressOwner: "0x456" },
            reference: { objectId: "0x456", version: "1", digest: "456" },
          },
        },
        events: [],
        objectChanges: [],
        balanceChanges: [],
        timestampMs: null,
        checkpoint: null,
      };

      mockClient.signAndExecuteTransactionBlock.mockResolvedValue(
        mockTxResponse
      );

      const result = await suiPulse.createSnapshot("0x123", {
        metadata: "Test Snapshot",
      });

      expect(result).toEqual(mockTxResponse);
    });

    it("should get snapshot data", async () => {
      const mockSnapshot: SuiObjectResponse = {
        data: {
          objectId: "0x123",
          version: "1",
          digest: "123",
          type: "moveObject",
          content: {
            dataType: "moveObject" as const,
            type: "0xpackageId::storage::StreamSnapshot",
            hasPublicTransfer: true,
            fields: {
              id: "0x123",
              streamId: "0x456",
              data: [1, 2, 3],
              timestamp: "123456789",
              version: "1",
              metadata: "Test",
              creator: "0xabc",
            },
          },
          owner: { AddressOwner: "0xabc" },
          previousTransaction: "123",
          storageRebate: "0",
          display: null,
        },
        error: null,
      };

      mockClient.getObject.mockResolvedValue(mockSnapshot);

      const result = await suiPulse.getSnapshotData("0x123");
      expect(result.id).toBe("0x123");
      expect(result.streamId).toBe("0x456");
    });
  });

  describe("Query Operations", () => {
    it("should get stream schema", async () => {
      const mockStream: SuiObjectResponse = {
        data: {
          objectId: "0x123",
          version: "1",
          digest: "123",
          type: "moveObject",
          content: {
            dataType: "moveObject" as const,
            type: "0xpackageId::data_stream::DataStream",
            hasPublicTransfer: true,
            fields: {
              type: "stream",
              owner: "0x123",
              subscribers: [],
              data: "test",
              version: "1",
              timestamp: "123456789",
              schema: "test-schema",
            },
          },
          owner: { AddressOwner: "0x123" },
          previousTransaction: "123",
          storageRebate: "0",
          display: null,
        },
        error: null,
      };

      mockClient.getObject.mockResolvedValue(mockStream);

      const schema = await suiPulse.getStreamSchema("0x123");
      expect(schema).toBe("test-schema");
    });

    it("should get stream version", async () => {
      const mockStream: SuiObjectResponse = {
        data: {
          objectId: "0x123",
          version: "1",
          digest: "123",
          type: "moveObject",
          content: {
            dataType: "moveObject" as const,
            type: "0xpackageId::data_stream::DataStream",
            hasPublicTransfer: true,
            fields: {
              type: "stream",
              owner: "0x123",
              subscribers: [],
              data: "test",
              version: "1",
              timestamp: "123456789",
            },
          },
          owner: { AddressOwner: "0x123" },
          previousTransaction: "123",
          storageRebate: "0",
          display: null,
        },
        error: null,
      };

      mockClient.getObject.mockResolvedValue(mockStream);

      const version = await suiPulse.getStreamVersion("0x123");
      expect(version).toBe("1");
    });
  });

  describe("Error Handling", () => {
    it("should handle validation errors", async () => {
      await expect(
        suiPulse.createStream({
          name: "",
          description: "",
          isPublic: true,
        })
      ).rejects.toThrow(SuiPulseError);
    });

    it("should handle network errors", async () => {
      mockClient.signAndExecuteTransactionBlock.mockRejectedValue(
        new Error("Network error")
      );

      await expect(
        suiPulse.createStream({
          name: "Test",
          description: "Test",
          isPublic: true,
        })
      ).rejects.toThrow(SuiPulseError);
    });
  });
});
