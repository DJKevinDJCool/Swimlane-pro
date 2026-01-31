import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, LaneColors } from "@/constants/theme";
import { Race, formatTime } from "@/types/swim";

interface ResultRowProps {
  race: Race;
  rank: number;
  showMedal?: boolean;
  showPoints?: boolean;
  showGender?: boolean;
}

export function ResultRow({
  race,
  rank,
  showMedal = true,
  showPoints = true,
  showGender = true,
}: ResultRowProps) {
  const { theme } = useTheme();

  const swimmerName =
    race.firstName && race.lastName
      ? `${race.firstName} ${race.lastName}`
      : race.lastName || race.calculatedTeamNames?.[0]?.name || "Ukjent";

  const hasTime = race.estimatedFinalTime && race.estimatedFinalTime > 0;
  const laneColor = LaneColors[(race.lane - 1) % LaneColors.length];

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "#FFD700";
    if (rank === 2) return "#C0C0C0";
    if (rank === 3) return "#CD7F32";
    return theme.backgroundSecondary;
  };

  const getMedalIcon = (rank: number): string | null => {
    if (rank <= 3) return "award";
    return null;
  };

  const genderColor = race.gender === 1 ? "#0066CC" : race.gender === 2 ? "#FF2D55" : theme.textSecondary;
  const genderLabel = race.gender === 1 ? "M" : race.gender === 2 ? "K" : null;

  const isRelay = race.calculatedTeamNames && race.calculatedTeamNames.length > 1;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.leftSection}>
        {showMedal && hasTime ? (
          <View
            style={[
              styles.rankBadge,
              { backgroundColor: getMedalColor(rank) },
            ]}
          >
            {getMedalIcon(rank) ? (
              <Feather
                name="award"
                size={14}
                color={rank <= 3 ? "#000000" : theme.text}
              />
            ) : (
              <ThemedText
                style={[
                  styles.rankText,
                  { color: rank <= 3 ? "#000000" : theme.text },
                ]}
              >
                {rank}
              </ThemedText>
            )}
          </View>
        ) : (
          <View
            style={[
              styles.rankBadge,
              { backgroundColor: theme.backgroundSecondary },
            ]}
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
          {showGender && genderLabel ? (
            <View
              style={[styles.genderBadge, { backgroundColor: genderColor + "20" }]}
            >
              <ThemedText style={[styles.genderText, { color: genderColor }]}>
                {genderLabel}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.detailsRow}>
          {race.swimClubName ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
              {race.swimClubName}
            </ThemedText>
          ) : null}
          {race.birthYear ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {race.birthYear}
            </ThemedText>
          ) : null}
        </View>

        {isRelay ? (
          <View style={styles.relayTeam}>
            {race.calculatedTeamNames?.map((member, idx) => (
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

      <View style={styles.rightSection}>
        <ThemedText
          style={[
            styles.time,
            { color: hasTime ? theme.primary : theme.textSecondary },
          ]}
        >
          {hasTime ? formatTime(race.estimatedFinalTime!) : "--:--"}
        </ThemedText>
        {showPoints && race.points && race.points > 0 ? (
          <ThemedText style={[styles.points, { color: theme.textSecondary }]}>
            {race.points} pt
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
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
  },
  relayTeam: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    gap: 2,
  },
  relayMember: {
    fontSize: 12,
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
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
});
