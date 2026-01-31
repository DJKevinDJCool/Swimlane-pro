import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { LiveBadge } from "@/components/LiveBadge";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, LaneColors } from "@/constants/theme";
import { Race, formatTime } from "@/types/swim";

interface HeatCardProps {
  heatNumber: number;
  races: Race[];
  isLive?: boolean;
  isFinished?: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HeatCard({
  heatNumber,
  races,
  isLive,
  isFinished,
  onPress,
}: HeatCardProps) {
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

  const sortedRaces = [...races].sort((a, b) => a.lane - b.lane);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderColor: isLive ? theme.liveIndicator : theme.border,
          borderWidth: isLive ? 2 : 1,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText type="h4">Heat {heatNumber}</ThemedText>
          {isLive ? <LiveBadge size="small" /> : null}
          {isFinished ? (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: theme.success + "20" },
              ]}
            >
              <ThemedText style={[styles.statusText, { color: theme.success }]}>
                Fullført
              </ThemedText>
            </View>
          ) : null}
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>

      <View style={styles.lanes}>
        {sortedRaces.slice(0, 6).map((race, index) => {
          const swimmerName =
            race.firstName && race.lastName
              ? `${race.firstName} ${race.lastName}`
              : race.lastName || "Ukjent";

          return (
            <View key={`${race.lane}-${index}`} style={styles.laneRow}>
              <View
                style={[
                  styles.laneIndicator,
                  { backgroundColor: LaneColors[index % LaneColors.length] },
                ]}
              >
                <ThemedText style={styles.laneNumber}>{race.lane}</ThemedText>
              </View>
              <ThemedText
                type="small"
                numberOfLines={1}
                style={styles.swimmerName}
              >
                {swimmerName}
              </ThemedText>
              <ThemedText
                style={[styles.time, { color: theme.textSecondary }]}
              >
                {race.estimatedFinalTime
                  ? formatTime(race.estimatedFinalTime)
                  : "--:--"}
              </ThemedText>
            </View>
          );
        })}
        {sortedRaces.length > 6 ? (
          <ThemedText
            type="small"
            style={[styles.moreText, { color: theme.textSecondary }]}
          >
            +{sortedRaces.length - 6} flere
          </ThemedText>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  lanes: {
    gap: Spacing.sm,
  },
  laneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  laneIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  laneNumber: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  swimmerName: {
    flex: 1,
  },
  time: {
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  moreText: {
    textAlign: "center",
    marginTop: Spacing.xs,
  },
});
