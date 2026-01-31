import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, LaneColors } from "@/constants/theme";
import { LiveRace, formatTime } from "@/types/swim";

interface LaneVisualizationProps {
  races: LiveRace[];
  numberOfLanes: number;
  numberOfLaps: number;
}

interface SwimmerLaneProps {
  race: LiveRace;
  laneIndex: number;
  numberOfLaps: number;
}

function SwimmerLane({ race, laneIndex, numberOfLaps }: SwimmerLaneProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);
  
  const laneColor = LaneColors[laneIndex % LaneColors.length];

  useEffect(() => {
    let currentProgress = 0;
    
    if (race.calculatedLapTimes && race.calculatedLapTimes.length > 0) {
      const completedLaps = race.calculatedLapTimes.filter(
        (lap) => lap[0]?.time !== undefined
      ).length;
      currentProgress = completedLaps / numberOfLaps;
    } else if (race.estimatedFinalTime && race.estimatedFinalTime > 0) {
      currentProgress = 1;
    }

    progress.value = withSpring(currentProgress * 100, {
      damping: 20,
      stiffness: 100,
    });
  }, [race, numberOfLaps]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const swimmerName =
    race.firstName && race.lastName
      ? `${race.firstName} ${race.lastName}`
      : race.lastName || race.calculatedTeamNames?.[0]?.name || "Ukjent";

  const lastTime =
    race.calculatedLapTimes?.[race.calculatedLapTimes.length - 1]?.[0]?.time;

  return (
    <View style={styles.laneContainer}>
      <View style={styles.laneHeader}>
        <View style={[styles.laneNumber, { backgroundColor: laneColor }]}>
          <ThemedText style={styles.laneNumberText}>{race.lane}</ThemedText>
        </View>
        <View style={styles.swimmerInfo}>
          <ThemedText type="small" numberOfLines={1} style={styles.swimmerName}>
            {swimmerName}
          </ThemedText>
          {race.swimClubName ? (
            <ThemedText
              style={[styles.clubName, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {race.swimClubName}
            </ThemedText>
          ) : null}
        </View>
        <ThemedText style={[styles.time, { color: theme.primary }]}>
          {lastTime ? formatTime(lastTime) : "--:--"}
        </ThemedText>
      </View>

      <View style={[styles.laneTrack, { backgroundColor: theme.backgroundSecondary }]}>
        <Animated.View
          style={[
            styles.laneProgress,
            { backgroundColor: laneColor },
            animatedStyle,
          ]}
        />
        <View style={[styles.swimmerIndicator, { backgroundColor: laneColor }]}>
          <Animated.View
            style={[
              styles.swimmerDot,
              animatedStyle,
              { backgroundColor: "#FFFFFF" },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export function LaneVisualization({
  races,
  numberOfLanes,
  numberOfLaps,
}: LaneVisualizationProps) {
  const { theme } = useTheme();

  const sortedRaces = [...races].sort((a, b) => a.lane - b.lane);

  return (
    <View style={styles.container}>
      <View style={styles.lapMarkers}>
        {Array.from({ length: numberOfLaps + 1 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.lapMarker,
              { borderColor: theme.border },
              i === 0 && styles.lapMarkerFirst,
            ]}
          />
        ))}
      </View>

      {sortedRaces.map((race, index) => (
        <SwimmerLane
          key={`${race.lane}-${race.heatNumber}`}
          race={race}
          laneIndex={index}
          numberOfLaps={numberOfLaps}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  lapMarkers: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  lapMarker: {
    width: 1,
    height: "100%",
    borderLeftWidth: 1,
    borderStyle: "dashed",
  },
  lapMarkerFirst: {
    borderLeftWidth: 2,
    borderStyle: "solid",
  },
  laneContainer: {
    marginBottom: Spacing.md,
  },
  laneHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  laneNumber: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  laneNumberText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  swimmerInfo: {
    flex: 1,
  },
  swimmerName: {
    fontWeight: "600",
  },
  clubName: {
    fontSize: 11,
  },
  time: {
    fontSize: 15,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  laneTrack: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    position: "relative",
  },
  laneProgress: {
    height: "100%",
    borderRadius: BorderRadius.full,
    minWidth: 8,
  },
  swimmerIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    flexDirection: "row",
  },
  swimmerDot: {
    position: "absolute",
    right: 0,
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
