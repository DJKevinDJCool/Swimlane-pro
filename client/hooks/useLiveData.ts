import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/query-client";

interface LiveEventData {
  event: any;
  updateId: number;
  isRunning: boolean;
}

export function useLiveData(meetId?: string, enabled: boolean = true) {
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [updateId, setUpdateId] = useState<number>(0);
  const [lastUpdateId, setLastUpdateId] = useState<number>(0);

  const fetchCurrentLive = useCallback(async () => {
    if (!meetId || !enabled) return null;
    
    const baseUrl = getApiUrl();
    try {
      const res = await fetch(
        new URL(`/api/meets/${meetId}/live/current`, baseUrl)
      );
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error("Error fetching live data:", error);
      return null;
    }
  }, [meetId, enabled]);

  const { data: liveData, refetch, isLoading } = useQuery<LiveEventData | null>({
    queryKey: ["liveData", meetId],
    queryFn: fetchCurrentLive,
    enabled: enabled && !!meetId,
    refetchInterval: 0, // Manual refetch via polling
    staleTime: 0,
  });

  // Set up polling
  useEffect(() => {
    if (!enabled || !meetId) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      return;
    }

    const poll = async () => {
      const newData = await fetchCurrentLive();
      if (newData && newData.updateId !== lastUpdateId) {
        setUpdateId(newData.updateId);
        setLastUpdateId(newData.updateId);
        refetch();
      }
    };

    // Poll every 500ms for live updates
    pollIntervalRef.current = setInterval(poll, 500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [meetId, enabled, fetchCurrentLive, lastUpdateId, refetch]);

  return {
    liveData,
    updateId,
    isLoading,
  };
}
