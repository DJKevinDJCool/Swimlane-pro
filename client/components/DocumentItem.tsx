import React from "react";
import { StyleSheet, Pressable, Linking, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { Document } from "@/types/swim";

interface DocumentItemProps {
  document: Document;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DocumentItem({ document }: DocumentItemProps) {
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

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      if (Platform.OS === "web") {
        window.open(document.link, "_blank");
      } else {
        await WebBrowser.openBrowserAsync(document.link);
      }
    } catch (error) {
      console.error("Failed to open document:", error);
    }
  };

  const getIcon = (): string => {
    const link = document.link.toLowerCase();
    if (link.endsWith(".pdf")) return "file-text";
    if (link.endsWith(".doc") || link.endsWith(".docx") || link.endsWith(".rtf"))
      return "file";
    if (link.endsWith(".xls") || link.endsWith(".xlsx")) return "grid";
    return "file";
  };

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
      <Feather name={getIcon() as any} size={24} color={theme.primary} />
      <ThemedText type="body" style={styles.title} numberOfLines={2}>
        {document.title}
      </ThemedText>
      <Feather name="external-link" size={18} color={theme.textSecondary} />
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
  title: {
    flex: 1,
  },
});
