import React, { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ResultRow } from "@/components/ResultRow";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { LiveBadge } from "@/components/LiveBadge";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { Race, LiveRace, MeetDetails, getEventName, isMeetLive } from "@/types/swim";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

type RouteProps = RouteProp<RootStackParamList, "MeetLive">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type SortBy = "time" | "heat" | "class";

async function fetchMeetDetails(meetId: string): Promise<MeetDetails> {
  const baseUrl = getApiUrl();
  const res = await fetch(new URL(`/api/meets/${meetId}/details`, baseUrl));
  if (!res.ok) throw new Error("Failed to fetch meet details");
  return res.json();
}

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

export default function MeetLiveScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { meetId, meetName } = route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [sortBy, setSortBy] = useState<SortBy>("time");

  const { data: meetDetails, isLoading: detailsLoading, refetch: refetchDetails } = useQuery<MeetDetails>({
    queryKey: ["meetDetails", meetId],
    queryFn: () => fetchMeetDetails(meetId),
  });

  const isLive = meetDetails ? isMeetLive(meetDetails.startDate, meetDetails.endDate) : false;

  const events = useMemo(() => {
    if (!meetDetails) return [];
    return meetDetails.sessions.flatMap((s) => s.meetEvents);
  }, [meetDetails]);

  const selectedEvent = events[selectedEventIndex];

  const { data: races, isLoading: racesLoading, refetch: refetchRaces } = useQuery<Race[]>({
    queryKey: ["races", meetId, selectedEvent?.eventNumber],
    queryFn: () => fetchRaces(meetId, selectedEvent.eventNumber),
    enabled: !!selectedEvent,
  });

  const { data: liveData, refetch: refetchLive } = useQuery<LiveRace[]>({
    queryKey: ["liveRaces", meetId],
    queryFn: () => fetchLiveData(meetId),
    refetchInterval: isLive ? 2000 : false,
  });

  const sortedRaces = useMemo(() => {
    if (!races) return [];

    let merged = races.map((race) => {
      if (liveData && liveData.length > 0) {
        const liveRace = liveData.find(
          (l) =>
            l.eventNumber === selectedEvent?.eventNumber &&
            l.heatNumber === race.heatNumber &&
            l.lane === race.lane
        );
        if (liveRace) return { ...race, ...liveRace };
      }
      return race;
    });

    if (sortBy === "time") {
      return [...merged].sort((a, b) => {
        const timeA = a.estimatedFinalTime || Infinity;
        const timeB = b.estimatedFinalTime || Infinity;
        return timeA - timeB;
      });
    } else if (sortBy === "heat") {
      return [...merged].sort((a, b) => {
        if (a.heatNumber !== b.heatNumber) return a.heatNumber - b.heatNumber;
        return a.lane - b.lane;
      });
    } else {
      return [...merged].sort((a, b) => {
        const yearA = parseInt(a.birthYear || "0", 10);
        const yearB = parseInt(b.birthYear || "0", 10);
        if (yearA !== yearB) return yearB - yearA;
        const timeA = a.estimatedFinalTime || Infinity;
        const timeB = b.estimatedFinalTime || Infinity;
        return timeA - timeB;
      });
    }
  }, [races, liveData, selectedEvent, sortBy]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchDetails(), refetchRaces(), refetchLive()]);
    setRefreshing(false);
  }, [refetchDetails, refetchRaces, refetchLive]);

  const handlePrevEvent = () => {
    if (selectedEventIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedEventIndex(selectedEventIndex - 1);
    }
  };

  const handleNextEvent = () => {
    if (selectedEventIndex < events.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedEventIndex(selectedEventIndex + 1);
    }
  };

  const renderRace = ({ item, index }: { item: Race; index: number }) => (
    <ResultRow
      race={item}
      rank={sortBy === "time" ? index + 1 : 0}
      showMedal={sortBy === "time"}
      showPoints={true}
      showGender={true}
    />
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonLoader key={i} height={80} />
      ))}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-results.png")}
      title="Ingen resultater"
      message="Resultatene er ikke tilgjengelige for denne øvelsen ennå."
      actionLabel="Oppdater"
      onAction={onRefresh}
    />
  );

  if (detailsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.loadingContainer, { paddingTop: headerHeight + Spacing.lg }]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoader key={i} height={80} style={{ marginBottom: 12 }} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={racesLoading ? [] : sortedRaces}
        renderItem={renderRace}
        keyExtractor={(item, index) => `${item.heatNumber}-${item.lane}-${index}`}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
          sortedRaces.length === 0 && !racesLoading && styles.emptyContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {isLive ? (
              <View style={styles.liveHeader}>
                <LiveBadge />
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Oppdateres automatisk
                </ThemedText>
              </View>
            ) : null}

            <View style={styles.eventSelector}>
              <Pressable
                onPress={handlePrevEvent}
                disabled={selectedEventIndex === 0}
                style={[
                  styles.eventNavButton,
                  { opacity: selectedEventIndex === 0 ? 0.3 : 1 },
                ]}
              >
                <Feather name="chevron-left" size={24} color={theme.text} />
              </Pressable>

              <View style={styles.eventInfo}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Øvelse {selectedEvent?.eventNumber || "-"} av {events.length}
                </ThemedText>
                <ThemedText type="h4">
                  {selectedEvent ? getEventName(selectedEvent) : "Velg øvelse"}
                </ThemedText>
              </View>

              <Pressable
                onPress={handleNextEvent}
                disabled={selectedEventIndex >= events.length - 1}
                style={[
                  styles.eventNavButton,
                  { opacity: selectedEventIndex >= events.length - 1 ? 0.3 : 1 },
                ]}
              >
                <Feather name="chevron-right" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.sortRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Sorter etter:
              </ThemedText>
              <View style={styles.sortButtons}>
                {(["time", "heat", "class"] as SortBy[]).map((sort) => (
                  <Pressable
                    key={sort}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSortBy(sort);
                    }}
                    style={[
                      styles.sortButton,
                      {
                        backgroundColor:
                          sortBy === sort ? theme.primary : theme.backgroundDefault,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.sortButtonText,
                        { color: sortBy === sort ? "#FFFFFF" : theme.text },
                      ]}
                    >
                      {sort === "time" ? "Tid" : sort === "heat" ? "Heat" : "Klasse"}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {sortedRaces.length} resultater
            </ThemedText>
          </View>
        }
        ListEmptyComponent={racesLoading ? renderSkeleton : renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    paddingHorizontal: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  liveHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  eventSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  eventNavButton: {
    padding: Spacing.sm,
  },
  eventInfo: {
    flex: 1,
    alignItems: "center",
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  sortButtons: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  sortButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  separator: {
    height: Spacing.sm,
  },
  skeletonContainer: {
    gap: Spacing.sm,
  },
});
