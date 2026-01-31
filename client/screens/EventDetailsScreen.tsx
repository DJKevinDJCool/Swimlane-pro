import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { HeatCard } from "@/components/HeatCard";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { Race } from "@/types/swim";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

type RouteProps = RouteProp<RootStackParamList, "EventDetails">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

async function fetchRaces(meetId: string, eventNumber: number): Promise<Race[]> {
  const baseUrl = getApiUrl();
  const res = await fetch(
    new URL(`/api/meets/${meetId}/events/${eventNumber}/races`, baseUrl)
  );
  if (!res.ok) throw new Error("Failed to fetch races");
  return res.json();
}

export default function EventDetailsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { meetId, eventNumber } = route.params;

  const [refreshing, setRefreshing] = useState(false);

  const { data: races, isLoading, refetch } = useQuery<Race[]>({
    queryKey: ["races", meetId, eventNumber],
    queryFn: () => fetchRaces(meetId, eventNumber),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const heats = React.useMemo(() => {
    if (!races) return [];
    
    const heatMap = new Map<number, Race[]>();
    races.forEach((race) => {
      const existing = heatMap.get(race.heatNumber) || [];
      existing.push(race);
      heatMap.set(race.heatNumber, existing);
    });

    return Array.from(heatMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([heatNumber, heatRaces]) => ({
        heatNumber,
        races: heatRaces,
        isFinished: heatRaces.some((r) => r.estimatedFinalTime && r.estimatedFinalTime > 0),
      }));
  }, [races]);

  const handleHeatPress = (heatNumber: number) => {
    navigation.navigate("LiveRace", {
      meetId,
      eventNumber,
      heatNumber,
    });
  };

  const renderHeat = ({
    item,
  }: {
    item: { heatNumber: number; races: Race[]; isFinished: boolean };
  }) => (
    <HeatCard
      heatNumber={item.heatNumber}
      races={item.races}
      isFinished={item.isFinished}
      onPress={() => handleHeatPress(item.heatNumber)}
    />
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonLoader key={i} height={180} />
      ))}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-results.png")}
      title="Ingen heat"
      message="Heat-listen er ikke tilgjengelig for denne øvelsen ennå."
      actionLabel="Oppdater"
      onAction={onRefresh}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={isLoading ? [] : heats}
        renderItem={renderHeat}
        keyExtractor={(item) => `heat-${item.heatNumber}`}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
          heats.length === 0 && !isLoading && styles.emptyContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={isLoading ? renderSkeleton : renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
  },
  separator: {
    height: Spacing.md,
  },
  skeletonContainer: {
    gap: Spacing.md,
  },
});
