import React, { useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, LaneColors } from "@/constants/theme";
import { Race, formatTime, getRelayTeamMembers, isRelayRace, getRaceGender } from "@/types/swim";

interface ResultRowProps {
  race: Race;
  rank: number;
  showMedal?: boolean;
  showPoints?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ResultRow({
  race,
  rank,
  showMedal = true,
  showPoints = true,
}: ResultRowProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
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

  const isRelay = isRelayRace(race);
  const teamMembers = getRelayTeamMembers(race);
  const raceGender = getRaceGender(race);

  const swimmerName = isRelay
    ? race.firstName || race.swimClubName || "Lag"
    : race.firstName && race.lastName
      ? `${race.firstName} ${race.lastName}`
      : race.lastName || "Ukjent";

  const hasTime = (race.estimatedFinalTime && race.estimatedFinalTime > 0) || (race.finalTime && race.finalTime > 0);
  const displayTime = race.finalTime || race.estimatedFinalTime || 0;
  const laneColor = LaneColors[(race.lane - 1) % LaneColors.length];

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "#FFD700";
    if (rank === 2) return "#C0C0C0";
    if (rank === 3) return "#CD7F32";
    return theme.backgroundSecondary;
  };

  const genderColor = raceGender === "male" ? "#0066CC" : raceGender === "female" ? "#FF2D55" : theme.textSecondary;
  const genderLabel = raceGender === "male" ? "M" : raceGender === "female" ? "K" : null;

  const handlePress = () => {
    if (isRelay && teamMembers.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setExpanded(!expanded);
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={isRelay ? handlePressIn : undefined}
      onPressOut={isRelay ? handlePressOut : undefined}
      disabled={!isRelay}
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.mainRow}>
        <View style={styles.leftSection}>
          {showMedal && hasTime && rank <= 3 ? (
            <View
              style={[styles.rankBadge, { backgroundColor: getMedalColor(rank) }]}
            >
              <Feather name="award" size={14} color="#000000" />
            </View>
          ) : (
            <View
              style={[styles.rankBadge, { backgroundColor: theme.backgroundSecondary }]}
            >
              <ThemedText style={[styles.rankText, { color: theme.text }]}>
                {hasTime ? rank : "-"}
              </ThemedText>
            </View>
          )}

          <View style={[styles.laneIndicator, { backgroundColor: laneColor }]}>
            <ThemedText style={styles.laneText}>{race.lane}</ThemedText>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <ThemedText type="body" style={styles.swimmerName} numberOfLines={1}>
              {swimmerName}
            </ThemedText>
            {genderLabel ? (
              <View
                style={[styles.genderBadge, { backgroundColor: genderColor + "20" }]}
              >
                <ThemedText style={[styles.genderText, { color: genderColor }]}>
                  {genderLabel}
                </ThemedText>
              </View>
            ) : null}
            {isRelay ? (
              <Feather
                name={expanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={theme.textSecondary}
              />
            ) : null}
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
                Heat {race.heatNumber}
              </ThemedText>
            </View>
            {race.swimClubName && !isRelay ? (
              <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
                {race.swimClubName}
              </ThemedText>
            ) : null}
            {race.birthYear && !isRelay ? (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {race.birthYear}
              </ThemedText>
            ) : null}
            {race.className ? (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {race.className}
              </ThemedText>
            ) : null}
          </View>
        </View>

        <View style={styles.rightSection}>
          <ThemedText
            style={[
              styles.time,
              { color: hasTime ? theme.primary : theme.textSecondary },
            ]}
          >
            {hasTime ? formatTime(displayTime) : "--:--"}
          </ThemedText>
          {showPoints && race.points && race.points > 0 ? (
            <ThemedText style={[styles.points, { color: theme.textSecondary }]}>
              {race.points} FINA
            </ThemedText>
          ) : null}
        </View>
      </View>

      {expanded && isRelay && teamMembers.length > 0 ? (
        <View style={[styles.teamSection, { borderTopColor: theme.border }]}>
          <ThemedText type="small" style={[styles.teamTitle, { color: theme.textSecondary }]}>
            Lagmedlemmer:
          </ThemedText>
          {teamMembers.map((member, idx) => (
            <View key={idx} style={styles.teamMemberRow}>
              <View style={[styles.memberNumber, { backgroundColor: theme.primary + "20" }]}>
                <ThemedText style={[styles.memberNumberText, { color: theme.primary }]}>
                  {idx + 1}
                </ThemedText>
              </View>
              <ThemedText style={styles.memberName} numberOfLines={1}>
                {member.name}
              </ThemedText>
              {member.time ? (
                <ThemedText style={[styles.memberTime, { color: theme.primary }]}>
                  {formatTime(member.time)}
                </ThemedText>
              ) : null}
            </View>
          ))}
        </View>
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
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "700",
  },
  laneIndicator: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  laneText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  infoSection: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  swimmerName: {
    fontWeight: "600",
    flex: 1,
  },
  genderBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  genderText: {
    fontSize: 10,
    fontWeight: "700",
  },
  detailsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  detailItem: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  rightSection: {
    alignItems: "flex-end",
  },
  time: {
    fontSize: 16,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  points: {
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  teamSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.xs,
  },
  teamTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  teamMemberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  memberNumber: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  memberNumberText: {
    fontSize: 11,
    fontWeight: "700",
  },
  memberName: {
    flex: 1,
    fontSize: 14,
  },
  memberTime: {
    fontSize: 13,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
