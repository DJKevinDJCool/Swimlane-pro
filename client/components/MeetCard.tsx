import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
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
import { BorderRadius, Spacing, Colors } from "@/constants/theme";
import { Meet } from "@/types/swim";

interface MeetCardProps {
  meet: Meet;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MeetCard({ meet, onPress }: MeetCardProps) {
  const { theme, isDark } = useTheme();
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

  const formatDate = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
    };
    
    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString("no-NO", options);
    }
    
    return `${startDate.toLocaleDateString("no-NO", { day: "numeric" })}-${endDate.toLocaleDateString("no-NO", options)}`;
  };

  const imageUrl = meet.largeImage || meet.smallImage || meet.meetLogoUrl;

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
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View
          style={[
            styles.imagePlaceholder,
            { backgroundColor: theme.primary + "20" },
          ]}
        >
          <Feather name="droplet" size={32} color={theme.primary} />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <ThemedText type="h4" numberOfLines={1} style={styles.title}>
              {meet.name}
            </ThemedText>
            {meet.isLive ? <LiveBadge size="small" /> : null}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={14} color={theme.textSecondary} />
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary }}
                numberOfLines={1}
              >
                {meet.location || meet.city}
              </ThemedText>
            </View>

            <View style={styles.metaItem}>
              <Feather name="calendar" size={14} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {formatDate(meet.startDate, meet.endDate)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary }}
              numberOfLines={1}
            >
              {meet.organizer}
            </ThemedText>

            <View
              style={[
                styles.sourceBadge,
                {
                  backgroundColor:
                    meet.source === "swimlane"
                      ? theme.primary + "20"
                      : isDark
                        ? Colors.dark.backgroundSecondary
                        : Colors.light.backgroundSecondary,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.sourceText,
                  {
                    color:
                      meet.source === "swimlane"
                        ? theme.primary
                        : theme.textSecondary,
                  },
                ]}
              >
                {meet.source === "swimlane" ? "NOR" : meet.nationCode || "INT"}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      <Feather
        name="chevron-right"
        size={20}
        color={theme.textSecondary}
        style={styles.chevron}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  header: {
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sourceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: "600",
  },
  chevron: {
    marginRight: Spacing.md,
  },
});
