import React, { useState } from "react";
import { DataStream } from "@suipulse/sdk";
import { useCurrentWallet } from "@mysten/dapp-kit";

interface StreamCardProps {
  stream: DataStream;
  onUpdate: (streamId: string, data: Uint8Array) => Promise<void>;
  onSubscribe: (streamId: string) => Promise<void>;
}

export const StreamCard: React.FC<StreamCardProps> = ({
  stream,
  onUpdate,
  onSubscribe,
}) => {
  const { currentWallet } = useCurrentWallet();
  const [newData, setNewData] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleUpdate = async () => {
    if (!newData) return;
    const encoder = new TextEncoder();
    await onUpdate(stream.id, encoder.encode(newData));
    setNewData("");
  };

  const handleSubscribe = async () => {
    await onSubscribe(stream.id);
    setIsSubscribed(true);
  };

  const isOwner = currentWallet?.accounts[0]?.address === stream.owner;

  return (
    <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{stream.name}</h3>
          <p className="text-gray-600 text-sm">{stream.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              stream.isPublic
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {stream.isPublic ? "Public" : "Private"}
          </span>
          <span className="text-gray-500 text-sm">
            {stream.subscribers.length} subscribers
          </span>
        </div>
      </div>

      {isOwner && (
        <div className="mb-4">
          <textarea
            placeholder="Update stream data..."
            className="w-full p-2 border rounded mb-2"
            value={newData}
            onChange={(e) => setNewData(e.target.value)}
          />
          <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update Data
          </button>
        </div>
      )}

      {!isOwner && stream.isPublic && !isSubscribed && (
        <button
          onClick={handleSubscribe}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Subscribe
        </button>
      )}

      {isSubscribed && (
        <div className="text-green-600 text-sm">✓ Subscribed</div>
      )}

      <div className="mt-4">
        <h4 className="font-medium mb-2">Latest Data:</h4>
        <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto">
          {new TextDecoder().decode(stream.data)}
        </pre>
      </div>
    </div>
  );
};
