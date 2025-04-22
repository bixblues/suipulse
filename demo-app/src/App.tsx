import React, { useState, useEffect } from "react";
import { SuiPulse } from "@suipulse/sdk";
import { ConnectButton, useWallet } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui.js";
import { StreamCard } from "./components/StreamCard";
import { DataStream } from "@suipulse/sdk";

const PACKAGE_ID = "YOUR_PACKAGE_ID"; // Replace with your deployed package ID

function App() {
  const { currentAccount } = useWallet();
  const [suipulse, setSuipulse] = useState<SuiPulse | null>(null);
  const [streams, setStreams] = useState<DataStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newStream, setNewStream] = useState({
    name: "",
    description: "",
    isPublic: true,
  });

  useEffect(() => {
    if (currentAccount) {
      setSuipulse(new SuiPulse(PACKAGE_ID));
      fetchStreams();
    }
  }, [currentAccount]);

  const fetchStreams = async () => {
    if (!suipulse || !currentAccount) return;

    setLoading(true);
    try {
      // In a real app, you would fetch streams from the blockchain
      // For now, we'll just use the streams in state
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch streams");
      setLoading(false);
    }
  };

  const handleCreateStream = async () => {
    if (!suipulse || !currentAccount) return;

    setLoading(true);
    try {
      const stream = await suipulse.createDataStream(
        newStream.name,
        newStream.description,
        newStream.isPublic
      );
      setStreams([...streams, stream]);
      setNewStream({ name: "", description: "", isPublic: true });
      setError(null);
    } catch (err) {
      setError("Failed to create stream");
    }
    setLoading(false);
  };

  const handleUpdateStream = async (streamId: string, data: Uint8Array) => {
    if (!suipulse) return;

    setLoading(true);
    try {
      await suipulse.updateDataStream(streamId, data);
      const updatedStream = await suipulse.getDataStream(streamId);
      setStreams(streams.map((s) => (s.id === streamId ? updatedStream : s)));
      setError(null);
    } catch (err) {
      setError("Failed to update stream");
    }
    setLoading(false);
  };

  const handleSubscribe = async (streamId: string) => {
    if (!suipulse) return;

    setLoading(true);
    try {
      await suipulse.subscribeToStream(streamId);
      const updatedStream = await suipulse.getDataStream(streamId);
      setStreams(streams.map((s) => (s.id === streamId ? updatedStream : s)));
      setError(null);
    } catch (err) {
      setError("Failed to subscribe to stream");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">SuiPulse Demo</h1>
        <ConnectButton />
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {currentAccount && (
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Create New Stream</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Stream Name"
                className="w-full p-2 border rounded"
                value={newStream.name}
                onChange={(e) =>
                  setNewStream({ ...newStream, name: e.target.value })
                }
              />
              <textarea
                placeholder="Stream Description"
                className="w-full p-2 border rounded"
                value={newStream.description}
                onChange={(e) =>
                  setNewStream({ ...newStream, description: e.target.value })
                }
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newStream.isPublic}
                  onChange={(e) =>
                    setNewStream({ ...newStream, isPublic: e.target.checked })
                  }
                  className="mr-2"
                />
                <label htmlFor="isPublic">Public Stream</label>
              </div>
              <button
                onClick={handleCreateStream}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Stream"}
              </button>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your Streams</h2>
            {loading ? (
              <div className="text-center py-4">Loading streams...</div>
            ) : streams.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No streams created yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {streams.map((stream) => (
                  <StreamCard
                    key={stream.id}
                    stream={stream}
                    onUpdate={handleUpdateStream}
                    onSubscribe={handleSubscribe}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {!currentAccount && (
        <div className="text-center">
          <p className="text-lg">Please connect your wallet to use SuiPulse</p>
        </div>
      )}
    </div>
  );
}

export default App;
