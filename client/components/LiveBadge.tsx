import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface LiveBadgeProps {
  size?: "small" | "medium";
}

export function LiveBadge({ size = "medium" }: LiveBadgeProps) {
  const { theme } = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedDotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.liveIndicator,
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
          paddingVertical: isSmall ? 2 : 4,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.dot,
          { width: isSmall ? 6 : 8, height: isSmall ? 6 : 8 },
          animatedDotStyle,
        ]}
      />
      <ThemedText
        style={[
          styles.text,
          { color: "#FFFFFF", fontSize: isSmall ? 11 : 13 },
        ]}
      >
        LIVE
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  dot: {
    borderRadius: BorderRadius.full,
    backgroundColor: "#FFFFFF",
  },
  text: {
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
