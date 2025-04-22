import { useState, useEffect } from "react";
import { DataStream, StreamSnapshot } from "@suipulse/sdk";
import { useSuiPulseService } from "../services/suipulse.ts";

export interface UseDataStreamOptions {
  autoSubscribe?: boolean;
  pollInterval?: number;
  onError?: (error: Error) => void;
}

export interface UseDataStreamResult {
  data: DataStream | null;
  snapshots: StreamSnapshot[];
  loading: boolean;
  error: Error | null;
  updateStream: (data: Uint8Array) => Promise<void>;
  createSnapshot: (metadata: string) => Promise<void>;
  subscribe: () => Promise<void>;
  unsubscribe: () => void;
}

export const useDataStream = (
  streamId: string,
  options: UseDataStreamOptions = {}
): UseDataStreamResult => {
  const { autoSubscribe = true, pollInterval = 0, onError } = options;
  const suiPulseService = useSuiPulseService();
  const [data, setData] = useState<DataStream | null>(null);
  const [snapshots, setSnapshots] = useState<StreamSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let pollTimer: NodeJS.Timeout | undefined;

    const fetchData = async () => {
      try {
        const suiPulse = suiPulseService.getSuiPulse();
        const stream = await suiPulse.getDataStream(streamId);
        setData(stream);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    const setupSubscription = async () => {
      if (!autoSubscribe) return;

      try {
        const suiPulse = suiPulseService.getSuiPulse();
        unsubscribe = suiPulse.events.subscribeToStreamUpdates((event) => {
          if (event.streamId === streamId) {
            setData((prev) => ({
              ...prev!,
              data: event.data,
              version: event.version,
              timestamp: event.timestamp,
            }));
          }
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      }
    };

    const setupPolling = () => {
      if (pollInterval > 0) {
        pollTimer = setInterval(fetchData, pollInterval);
      }
    };

    fetchData();
    setupSubscription();
    setupPolling();

    return () => {
      unsubscribe?.();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [streamId, autoSubscribe, pollInterval, onError, suiPulseService]);

  const updateStream = async (data: Uint8Array) => {
    setLoading(true);
    try {
      const suiPulse = suiPulseService.getSuiPulse();
      await suiPulse.updateStream(streamId, data);
      const updatedStream = await suiPulse.getDataStream(streamId);
      setData(updatedStream);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createSnapshot = async (metadata: string) => {
    setLoading(true);
    try {
      const suiPulse = suiPulseService.getSuiPulse();
      await suiPulse.createSnapshot(streamId, { metadata });
      const snapshot = await suiPulse.getSnapshotData(streamId);
      setSnapshots((prev) => [...prev, snapshot]);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async () => {
    setLoading(true);
    try {
      const suiPulse = suiPulseService.getSuiPulse();
      await suiPulse.subscribeToStream(streamId);
      const updatedStream = await suiPulse.getDataStream(streamId);
      setData(updatedStream);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = () => {
    // Implement unsubscribe logic when available in SDK
  };

  return {
    data,
    snapshots,
    loading,
    error,
    updateStream,
    createSnapshot,
    subscribe,
    unsubscribe,
  };
};
