import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { LaneVisualization } from "@/components/LaneVisualization";
import { LiveBadge } from "@/components/LiveBadge";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, LaneColors } from "@/constants/theme";
import { LiveRace, Race, formatTime } from "@/types/swim";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

type RouteProps = RouteProp<RootStackParamList, "LiveRace">;

async function fetchRaces(meetId: string, eventNumber: number): Promise<Race[]> {
  const baseUrl = getApiUrl();
  const res = await fetch(
    new URL(`/api/meets/${meetId}/events/${eventNumber}/races`, baseUrl)
  );
  if (!res.ok) throw new Error("Failed to fetch races");
  return res.json();
}

async function fetchLiveData(meetId: string): Promise<LiveRace[]> {
  const baseUrl = getApiUrl();
  const res = await fetch(new URL(`/api/meets/${meetId}/live`, baseUrl));
  if (!res.ok) throw new Error("Failed to fetch live data");
  return res.json();
}

export default function LiveRaceScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const route = useRoute<RouteProps>();
  const { meetId, eventNumber, heatNumber } = route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const { data: races, isLoading, refetch } = useQuery<Race[]>({
    queryKey: ["races", meetId, eventNumber],
    queryFn: () => fetchRaces(meetId, eventNumber),
  });

  const { data: liveData, refetch: refetchLive } = useQuery<LiveRace[]>({
    queryKey: ["liveRaces", meetId],
    queryFn: () => fetchLiveData(meetId),
    refetchInterval: isLive ? 1000 : false,
  });

  useEffect(() => {
    if (liveData && liveData.length > 0) {
      const hasActiveRace = liveData.some(
        (r) => r.eventNumber === eventNumber && r.heatNumber === heatNumber
      );
      setIsLive(hasActiveRace);
    }
  }, [liveData, eventNumber, heatNumber]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchLive()]);
    setRefreshing(false);
  }, [refetch, refetchLive]);

  const heatRaces = React.useMemo(() => {
    if (!races) return [];
    
    const filteredRaces = races.filter((r) => r.heatNumber === heatNumber);
    
    if (liveData && liveData.length > 0) {
      const liveRacesForHeat = liveData.filter(
        (r) => r.eventNumber === eventNumber && r.heatNumber === heatNumber
      );
      
      if (liveRacesForHeat.length > 0) {
        return liveRacesForHeat.map((live) => {
          const original = filteredRaces.find((r) => r.lane === live.lane);
          return { ...original, ...live };
        });
      }
    }
    
    return filteredRaces;
  }, [races, liveData, eventNumber, heatNumber]);

  const sortedByPlace = React.useMemo(() => {
    return [...heatRaces].sort((a, b) => {
      const timeA = a.estimatedFinalTime || Infinity;
      const timeB = b.estimatedFinalTime || Infinity;
      return timeA - timeB;
    });
  }, [heatRaces]);

  const numberOfLaps = heatRaces[0]?.numberOfLaps || 1;

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View
          style={[
            styles.content,
            { paddingTop: headerHeight + Spacing.lg, paddingHorizontal: Spacing.lg },
          ]}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoader key={i} height={60} style={{ marginBottom: 12 }} />
          ))}
        </View>
      </View>
    );
  }

  if (heatRaces.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View
          style={[
            styles.emptyContainer,
            { paddingTop: headerHeight + Spacing.lg },
          ]}
        >
          <EmptyState
            image={require("../../assets/images/empty-lanes.png")}
            title="Ingen data"
            message="Data for dette heatet er ikke tilgjengelig ennå."
            actionLabel="Oppdater"
            onAction={onRefresh}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <ThemedText type="h2">Heat {heatNumber}</ThemedText>
          {isLive ? <LiveBadge /> : null}
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {heatRaces.length} deltakere
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Banevisualisering
        </ThemedText>
        <LaneVisualization
          races={heatRaces as LiveRace[]}
          numberOfLanes={heatRaces.length}
          numberOfLaps={numberOfLaps}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Resultater
        </ThemedText>
        {sortedByPlace.map((race, index) => {
          const swimmerName =
            race.firstName && race.lastName
              ? `${race.firstName} ${race.lastName}`
              : race.lastName || race.calculatedTeamNames?.[0]?.name || "Ukjent";

          const hasTime = race.estimatedFinalTime && race.estimatedFinalTime > 0;
          const laneColor = LaneColors[(race.lane - 1) % LaneColors.length];

          return (
            <View
              key={`${race.lane}-${index}`}
              style={[
                styles.resultRow,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.placeIndicator,
                  {
                    backgroundColor: hasTime
                      ? index === 0
                        ? "#FFD700"
                        : index === 1
                          ? "#C0C0C0"
                          : index === 2
                            ? "#CD7F32"
                            : theme.backgroundSecondary
                      : theme.backgroundSecondary,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.placeText,
                    { color: hasTime && index < 3 ? "#000000" : theme.text },
                  ]}
                >
                  {hasTime ? index + 1 : "-"}
                </ThemedText>
              </View>

              <View
                style={[styles.laneIndicator, { backgroundColor: laneColor }]}
              >
                <ThemedText style={styles.laneText}>{race.lane}</ThemedText>
              </View>

              <View style={styles.resultInfo}>
                <ThemedText type="body" style={styles.swimmerName}>
                  {swimmerName}
                </ThemedText>
                {race.swimClubName ? (
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {race.swimClubName}
                  </ThemedText>
                ) : null}
              </View>

              <ThemedText
                style={[
                  styles.resultTime,
                  { color: hasTime ? theme.primary : theme.textSecondary },
                ]}
              >
                {hasTime ? formatTime(race.estimatedFinalTime!) : "--:--"}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {},
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  placeIndicator: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  placeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  laneIndicator: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  laneText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  swimmerName: {
    fontWeight: "600",
  },
  resultTime: {
    fontSize: 17,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
