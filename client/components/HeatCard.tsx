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
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, LaneColors } from "@/constants/theme";
import { Race, formatTime } from "@/types/swim";

interface HeatCardProps {
  heatNumber: number;
  races: Race[];
  isFinished?: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HeatCard({ heatNumber, races, isFinished, onPress }: HeatCardProps) {
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

  const sortedRaces = [...races].sort((a, b) => {
    const timeA = a.estimatedFinalTime || Infinity;
    const timeB = b.estimatedFinalTime || Infinity;
    return timeA - timeB;
  });

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[styles.heatBadge, { backgroundColor: theme.primary + "20" }]}
          >
            <ThemedText style={[styles.heatBadgeText, { color: theme.primary }]}>
              Heat {heatNumber}
            </ThemedText>
          </View>
          {isFinished ? (
            <View
              style={[styles.statusBadge, { backgroundColor: theme.success + "20" }]}
            >
              <Feather name="check-circle" size={14} color={theme.success} />
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
              : race.lastName || race.calculatedTeamNames?.[0]?.name || "Ukjent";

          const hasTime = race.estimatedFinalTime && race.estimatedFinalTime > 0;
          const laneColor = LaneColors[(race.lane - 1) % LaneColors.length];
          const genderColor = race.gender === 1 ? "#0066CC" : race.gender === 2 ? "#FF2D55" : theme.textSecondary;
          const isRelay = race.calculatedTeamNames && race.calculatedTeamNames.length > 1;

          return (
            <View
              key={`${race.lane}-${index}`}
              style={[styles.laneRow, { borderBottomColor: theme.border }]}
            >
              {hasTime && index < 3 ? (
                <View
                  style={[
                    styles.medalBadge,
                    {
                      backgroundColor:
                        index === 0
                          ? "#FFD700"
                          : index === 1
                            ? "#C0C0C0"
                            : "#CD7F32",
                    },
                  ]}
                >
                  <ThemedText style={styles.medalText}>
                    {index + 1}
                  </ThemedText>
                </View>
              ) : (
                <View
                  style={[styles.laneBadge, { backgroundColor: laneColor }]}
                >
                  <ThemedText style={styles.laneText}>{race.lane}</ThemedText>
                </View>
              )}

              <View style={styles.swimmerInfo}>
                <View style={styles.swimmerNameRow}>
                  <ThemedText
                    type="small"
                    numberOfLines={1}
                    style={styles.swimmerName}
                  >
                    {swimmerName}
                  </ThemedText>
                  {race.gender ? (
                    <View
                      style={[
                        styles.genderBadge,
                        { backgroundColor: genderColor + "20" },
                      ]}
                    >
                      <ThemedText
                        style={[styles.genderText, { color: genderColor }]}
                      >
                        {race.gender === 1 ? "M" : "K"}
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
                <View style={styles.swimmerMeta}>
                  {race.swimClubName ? (
                    <ThemedText
                      style={[styles.clubName, { color: theme.textSecondary }]}
                      numberOfLines={1}
                    >
                      {race.swimClubName}
                    </ThemedText>
                  ) : null}
                  {race.birthYear ? (
                    <ThemedText
                      style={[styles.birthYear, { color: theme.textSecondary }]}
                    >
                      {race.birthYear}
                    </ThemedText>
                  ) : null}
                </View>
                {isRelay ? (
                  <View style={styles.relayTeam}>
                    {race.calculatedTeamNames?.slice(0, 4).map((member, idx) => (
                      <ThemedText
                        key={idx}
                        style={[styles.relayMember, { color: theme.textSecondary }]}
                        numberOfLines={1}
                      >
                        {idx + 1}. {member.name}
                        {member.time ? ` (${formatTime(member.time)})` : ""}
                      </ThemedText>
                    ))}
                  </View>
                ) : null}
              </View>

              <View style={styles.timeSection}>
                <ThemedText
                  style={[
                    styles.time,
                    { color: hasTime ? theme.primary : theme.textSecondary },
                  ]}
                >
                  {hasTime ? formatTime(race.estimatedFinalTime!) : "--:--"}
                </ThemedText>
                {race.points && race.points > 0 ? (
                  <ThemedText style={[styles.points, { color: theme.textSecondary }]}>
                    {race.points} pt
                  </ThemedText>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      {races.length > 6 ? (
        <ThemedText
          type="small"
          style={[styles.moreText, { color: theme.textSecondary }]}
        >
          +{races.length - 6} flere
        </ThemedText>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  heatBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  heatBadgeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  lanes: {},
  laneRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  medalBadge: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  medalText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "700",
  },
  laneBadge: {
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
  swimmerInfo: {
    flex: 1,
    gap: 2,
  },
  swimmerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  swimmerName: {
    fontWeight: "600",
    flex: 1,
  },
  genderBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  genderText: {
    fontSize: 9,
    fontWeight: "700",
  },
  swimmerMeta: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  clubName: {
    fontSize: 11,
    flex: 1,
  },
  birthYear: {
    fontSize: 11,
  },
  relayTeam: {
    marginTop: 2,
  },
  relayMember: {
    fontSize: 10,
  },
  timeSection: {
    alignItems: "flex-end",
  },
  time: {
    fontSize: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  points: {
    fontSize: 10,
    fontVariant: ["tabular-nums"],
  },
  moreText: {
    textAlign: "center",
    padding: Spacing.sm,
  },
});
