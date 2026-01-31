import React, { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { Swimmer, Club } from "@/types/swim";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

type RouteProps = RouteProp<RootStackParamList, "Clubs">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ClubCardProps {
  club: Club;
  onPress: () => void;
}

function ClubCard({ club, onPress }: ClubCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.clubCard,
        { backgroundColor: theme.cardBackground, borderColor: theme.border },
        animatedStyle,
      ]}
    >
      <View
        style={[styles.clubIcon, { backgroundColor: theme.primary + "20" }]}
      >
        <Feather name="users" size={24} color={theme.primary} />
      </View>
      <View style={styles.clubInfo}>
        <ThemedText type="h4" numberOfLines={1}>
          {club.name}
        </ThemedText>
        <View style={styles.clubStats}>
          <View style={styles.statItem}>
            <Feather name="user" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {club.swimmerCount} deltakere
            </ThemedText>
          </View>
          {club.maleCount > 0 || club.femaleCount > 0 ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              ({club.maleCount} M / {club.femaleCount} K)
            </ThemedText>
          ) : null}
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

async function fetchSwimmers(meetId: string): Promise<Swimmer[]> {
  const baseUrl = getApiUrl();
  const res = await fetch(new URL(`/api/meets/${meetId}/swimmers`, baseUrl));
  if (!res.ok) throw new Error("Failed to fetch swimmers");
  return res.json();
}

export default function ClubsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { meetId, meetName } = route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: swimmers, isLoading, refetch } = useQuery<Swimmer[]>({
    queryKey: ["swimmers", meetId],
    queryFn: () => fetchSwimmers(meetId),
  });

  const clubs = useMemo(() => {
    if (!swimmers) return [];

    const clubMap = new Map<number, Club>();

    swimmers.forEach((swimmer) => {
      const existing = clubMap.get(swimmer.meetSwimClubNumber);
      if (existing) {
        existing.swimmerCount++;
        if (swimmer.gender === 1) existing.maleCount++;
        else if (swimmer.gender === 2) existing.femaleCount++;
      } else {
        clubMap.set(swimmer.meetSwimClubNumber, {
          id: swimmer.meetSwimClubNumber,
          name: swimmer.swimClubName,
          logoUrl: swimmer.swimClubLogoUrl,
          swimmerCount: 1,
          maleCount: swimmer.gender === 1 ? 1 : 0,
          femaleCount: swimmer.gender === 2 ? 1 : 0,
        });
      }
    });

    return Array.from(clubMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [swimmers]);

  const filteredClubs = useMemo(() => {
    if (!searchQuery.trim()) return clubs;
    const query = searchQuery.toLowerCase();
    return clubs.filter((club) => club.name.toLowerCase().includes(query));
  }, [clubs, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleClubPress = (club: Club) => {
    navigation.navigate("ClubMembers", {
      meetId,
      clubId: club.id,
      clubName: club.name,
    });
  };

  const renderClub = ({ item }: { item: Club }) => (
    <ClubCard club={item} onPress={() => handleClubPress(item)} />
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonLoader key={i} height={80} />
      ))}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-swimmers.png")}
      title="Ingen klubber"
      message="Det er ingen klubber registrert for dette stevnet."
      actionLabel="Oppdater"
      onAction={onRefresh}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={isLoading ? [] : filteredClubs}
        renderItem={renderClub}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
          filteredClubs.length === 0 && !isLoading && styles.emptyContent,
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
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {clubs.length} klubber
            </ThemedText>
            <View
              style={[
                styles.searchContainer,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <Feather name="search" size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Søk etter klubb..."
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
    gap: Spacing.sm,
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
  clubCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  clubIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  clubInfo: {
    flex: 1,
    gap: 4,
  },
  clubStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
