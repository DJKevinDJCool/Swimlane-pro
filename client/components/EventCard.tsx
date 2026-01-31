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
import { BorderRadius, Spacing } from "@/constants/theme";
import { MeetEvent, getEventName, isRelay, getGenderName, getPoolLengthName } from "@/types/swim";

interface EventCardProps {
  event: MeetEvent;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EventCard({ event, onPress }: EventCardProps) {
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

  const isRelayEvent = isRelay(event);
  const genderColor = event.gender === 1 ? "#0066CC" : event.gender === 2 ? "#FF2D55" : theme.textSecondary;

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
      <View
        style={[styles.eventNumber, { backgroundColor: theme.primary + "20" }]}
      >
        <ThemedText style={[styles.eventNumberText, { color: theme.primary }]}>
          {event.eventNumber}
        </ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <ThemedText type="h4" numberOfLines={1} style={styles.title}>
            {getEventName(event)}
          </ThemedText>
          {event.gender && event.gender > 0 ? (
            <View
              style={[styles.genderBadge, { backgroundColor: genderColor + "20" }]}
            >
              <ThemedText style={[styles.genderText, { color: genderColor }]}>
                {event.gender === 1 ? "M" : "K"}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Feather
              name={isRelayEvent ? "users" : "user"}
              size={14}
              color={theme.textSecondary}
            />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {isRelayEvent ? "Stafett" : "Individuell"}
            </ThemedText>
          </View>
          <View style={styles.metaItem}>
            <Feather name="layers" size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {event.antallHeat} heat
            </ThemedText>
          </View>
          {event.poolLength ? (
            <View style={styles.metaItem}>
              <Feather name="droplet" size={14} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {getPoolLengthName(event.poolLength)}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>

      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  eventNumber: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  eventNumberText: {
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
  },
  genderBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  genderText: {
    fontSize: 11,
    fontWeight: "700",
  },
  meta: {
    flexDirection: "row",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
