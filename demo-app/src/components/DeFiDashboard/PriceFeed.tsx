import React, { useCallback } from "react";
import { useDataStream } from "../../hooks/useDataStream.ts";

interface PriceFeedProps {
  streamId: string;
  symbol: string;
  onError?: (error: Error) => void;
}

export const PriceFeed: React.FC<PriceFeedProps> = ({
  streamId,
  symbol,
  onError,
}) => {
  const { data, snapshots, loading, error, updateStream, createSnapshot } =
    useDataStream(streamId, {
      autoSubscribe: true,
      pollInterval: 5000, // Poll every 5 seconds as backup
      onError,
    });

  const handlePriceUpdate = useCallback(
    async (price: number) => {
      try {
        const data = new TextEncoder().encode(price.toString());
        await updateStream(data);
      } catch (err) {
        console.error("Failed to update price:", err);
      }
    },
    [updateStream]
  );

  const handleCreateSnapshot = useCallback(async () => {
    try {
      await createSnapshot(
        `${symbol} price snapshot at ${new Date().toISOString()}`
      );
    } catch (err) {
      console.error("Failed to create snapshot:", err);
    }
  }, [createSnapshot, symbol]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-6">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">
          Error Loading Price Feed
        </h3>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  const currentPrice = data
    ? parseFloat(new TextDecoder().decode(data.data))
    : null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {symbol} Price Feed
        </h3>
        <button
          onClick={handleCreateSnapshot}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Create Snapshot
        </button>
      </div>

      <div className="text-3xl font-bold text-gray-900 mb-4">
        {currentPrice ? `$${currentPrice.toFixed(2)}` : "No data"}
      </div>

      {snapshots.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">
            Recent Snapshots
          </h4>
          <div className="space-y-2">
            {snapshots.slice(-3).map((snapshot, index) => (
              <div
                key={index}
                className="text-sm text-gray-600 flex justify-between items-center"
              >
                <span>
                  $
                  {parseFloat(new TextDecoder().decode(snapshot.data)).toFixed(
                    2
                  )}
                </span>
                <span className="text-gray-400">
                  {new Date(parseInt(snapshot.timestamp)).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mock price update controls - Remove in production */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={() =>
              handlePriceUpdate(currentPrice ? currentPrice * 1.01 : 100)
            }
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            +1%
          </button>
          <button
            onClick={() =>
              handlePriceUpdate(currentPrice ? currentPrice * 0.99 : 100)
            }
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            -1%
          </button>
        </div>
      </div>
    </div>
  );
};
