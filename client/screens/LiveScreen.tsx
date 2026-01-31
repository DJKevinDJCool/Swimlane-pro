import React, { useState, useCallback } from "react";
import { StyleSheet, View, FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { MeetCard } from "@/components/MeetCard";
import { MeetCardSkeleton } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { Meet } from "@/types/swim";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

async function fetchLiveMeets(): Promise<Meet[]> {
  const baseUrl = getApiUrl();
  const url = new URL("/api/meets/live", baseUrl);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch live meets");
  return res.json();
}

export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const [refreshing, setRefreshing] = useState(false);

  const { data: liveMeets, isLoading, refetch } = useQuery<Meet[]>({
    queryKey: ["liveMeets"],
    queryFn: fetchLiveMeets,
    staleTime: 10000,
    refetchInterval: 30000,
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
      {Array.from({ length: 3 }).map((_, i) => (
        <MeetCardSkeleton key={i} />
      ))}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-lanes.png")}
      title="Ingen aktive stevner"
      message="Det er ingen stevner med live resultater akkurat nå. Sjekk tilbake senere!"
      actionLabel="Oppdater"
      onAction={onRefresh}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={isLoading ? [] : liveMeets}
        renderItem={renderMeet}
        keyExtractor={(item) => `${item.source}-${item.id}`}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
          (!liveMeets || liveMeets.length === 0) && !isLoading && styles.emptyContent,
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
