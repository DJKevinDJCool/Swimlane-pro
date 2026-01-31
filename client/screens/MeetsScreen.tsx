import React, { useState, useCallback } from "react";
import { StyleSheet, View, FlatList, RefreshControl, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { MeetCard } from "@/components/MeetCard";
import { FilterPill } from "@/components/FilterPill";
import { MeetCardSkeleton } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { Meet } from "@/types/swim";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FILTERS = [
  { key: "all", label: "Alle" },
  { key: "NOR", label: "Norge" },
  { key: "SWE", label: "Sverige" },
  { key: "INT", label: "Internasjonalt" },
];

async function fetchMeets(filter: string): Promise<Meet[]> {
  const baseUrl = getApiUrl();
  const url = new URL(`/api/meets?filter=${filter}`, baseUrl);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch meets");
  return res.json();
}

export default function MeetsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const { data: meets, isLoading, refetch } = useQuery<Meet[]>({
    queryKey: ["meets", selectedFilter],
    queryFn: () => fetchMeets(selectedFilter),
    staleTime: 60000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleMeetPress = (meet: Meet) => {
    navigation.navigate("MeetDetails", { meet });
  };

  const renderMeet = ({ item }: { item: Meet }) => (
    <MeetCard meet={item} onPress={() => handleMeetPress(item)} />
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 5 }).map((_, i) => (
        <MeetCardSkeleton key={i} />
      ))}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-meets.png")}
      title="Ingen stevner"
      message="Det er ingen stevner som passer filteret ditt akkurat nå."
      actionLabel="Oppdater"
      onAction={onRefresh}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={isLoading ? [] : meets}
        renderItem={renderMeet}
        keyExtractor={(item) => `${item.source}-${item.id}`}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {FILTERS.map((filter) => (
              <FilterPill
                key={filter.key}
                label={filter.label}
                isSelected={selectedFilter === filter.key}
                onPress={() => setSelectedFilter(filter.key)}
              />
            ))}
          </ScrollView>
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
  filtersContainer: {
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  separator: {
    height: Spacing.md,
  },
  skeletonContainer: {
    gap: Spacing.md,
  },
});
