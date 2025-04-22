import React, { useState, useCallback } from "react";
import { PriceFeed } from "./PriceFeed.tsx";
import { useSuiPulseService } from "../../services/suipulse.ts";

interface PriceFeedConfig {
  id: string;
  symbol: string;
}

export const DeFiDashboard: React.FC = () => {
  const suiPulseService = useSuiPulseService();
  const [priceFeeds, setPriceFeeds] = useState<PriceFeedConfig[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreatePriceFeed = useCallback(async () => {
    if (!newSymbol) return;

    try {
      const suiPulse = suiPulseService.getSuiPulse();
      const stream = await suiPulse.createStream({
        name: `${newSymbol} Price Feed`,
        description: `Real-time price feed for ${newSymbol}`,
        isPublic: true,
        tags: ["defi", "price-feed", newSymbol.toLowerCase()],
      });

      setPriceFeeds((prev) => [...prev, { id: stream.id, symbol: newSymbol }]);
      setNewSymbol("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [newSymbol, suiPulseService]);

  const handleError = useCallback((error: Error) => {
    setError(error.message);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          DeFi Dashboard
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            placeholder="Enter token symbol (e.g., ETH)"
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreatePriceFeed}
            disabled={!newSymbol}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Add Price Feed
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {priceFeeds.map((feed) => (
            <PriceFeed
              key={feed.id}
              streamId={feed.id}
              symbol={feed.symbol}
              onError={handleError}
            />
          ))}
        </div>

        {priceFeeds.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No price feeds added yet. Add a token symbol to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
