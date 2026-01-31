import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function SegmentedControl({
  segments,
  selectedIndex,
  onSelect,
}: SegmentedControlProps) {
  const { theme } = useTheme();

  const handlePress = (index: number) => {
    if (index !== selectedIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(index);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
      ]}
    >
      {segments.map((segment, index) => {
        const isSelected = index === selectedIndex;

        return (
          <Pressable
            key={segment}
            onPress={() => handlePress(index)}
            style={[
              styles.segment,
              {
                backgroundColor: isSelected
                  ? theme.cardBackground
                  : "transparent",
              },
            ]}
          >
            <ThemedText
              style={[
                styles.segmentText,
                {
                  color: isSelected ? theme.text : theme.textSecondary,
                  fontWeight: isSelected ? "600" : "400",
                },
              ]}
            >
              {segment}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: BorderRadius.sm,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: {
    fontSize: 13,
  },
});
