import React, { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { SwimmerRow } from "@/components/SwimmerRow";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { Swimmer } from "@/types/swim";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

type RouteProps = RouteProp<RootStackParamList, "ClubMembers">;

async function fetchSwimmers(meetId: string): Promise<Swimmer[]> {
  const baseUrl = getApiUrl();
  const res = await fetch(new URL(`/api/meets/${meetId}/swimmers`, baseUrl));
  if (!res.ok) throw new Error("Failed to fetch swimmers");
  return res.json();
}

export default function ClubMembersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const route = useRoute<RouteProps>();
  const { meetId, clubId, clubName } = route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allSwimmers, isLoading, refetch } = useQuery<Swimmer[]>({
    queryKey: ["swimmers", meetId],
    queryFn: () => fetchSwimmers(meetId),
  });

  const swimmers = useMemo(() => {
    if (!allSwimmers) return [];
    return allSwimmers
      .filter((s) => s.meetSwimClubNumber === clubId)
      .sort((a, b) => {
        const nameA = `${a.lastName} ${a.firstName}`;
        const nameB = `${b.lastName} ${b.firstName}`;
        return nameA.localeCompare(nameB);
      });
  }, [allSwimmers, clubId]);

  const filteredSwimmers = useMemo(() => {
    if (!searchQuery.trim()) return swimmers;
    const query = searchQuery.toLowerCase();
    return swimmers.filter((s) => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [swimmers, searchQuery]);

  const stats = useMemo(() => {
    const males = swimmers.filter((s) => s.gender === 1).length;
    const females = swimmers.filter((s) => s.gender === 2).length;
    return { males, females, total: swimmers.length };
  }, [swimmers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderSwimmer = ({ item }: { item: Swimmer }) => (
    <SwimmerRow swimmer={item} showGender showBirthYear />
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 10 }).map((_, i) => (
        <SkeletonLoader key={i} height={64} />
      ))}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-swimmers.png")}
      title="Ingen medlemmer"
      message="Det er ingen registrerte medlemmer fra denne klubben."
      actionLabel="Oppdater"
      onAction={onRefresh}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={isLoading ? [] : filteredSwimmers}
        renderItem={renderSwimmer}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
          filteredSwimmers.length === 0 && !isLoading && styles.emptyContent,
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
            <View style={styles.statsRow}>
              <View
                style={[styles.statBadge, { backgroundColor: theme.primary + "20" }]}
              >
                <Feather name="users" size={14} color={theme.primary} />
                <ThemedText style={[styles.statText, { color: theme.primary }]}>
                  {stats.total}
                </ThemedText>
              </View>
              <View
                style={[styles.statBadge, { backgroundColor: "#0066CC20" }]}
              >
                <ThemedText style={[styles.statText, { color: "#0066CC" }]}>
                  {stats.males} M
                </ThemedText>
              </View>
              <View
                style={[styles.statBadge, { backgroundColor: "#FF2D5520" }]}
              >
                <ThemedText style={[styles.statText, { color: "#FF2D55" }]}>
                  {stats.females} K
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                styles.searchContainer,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <Feather name="search" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Søk etter svømmer..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
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
  header: {
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
  separator: {
    height: Spacing.sm,
  },
  skeletonContainer: {
    gap: Spacing.sm,
  },
});
