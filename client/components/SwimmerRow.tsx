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
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { Swimmer } from "@/types/swim";

interface SwimmerRowProps {
  swimmer: Swimmer;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SwimmerRow({ swimmer, onPress }: SwimmerRowProps) {
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
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const fullName =
    swimmer.firstName && swimmer.lastName
      ? `${swimmer.firstName} ${swimmer.lastName}`
      : swimmer.lastName || "Ukjent";

  const hasLogo = swimmer.swimClubLogoUrl && swimmer.swimClubLogoUrl.length > 0;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
        animatedStyle,
      ]}
    >
      {hasLogo ? (
        <Image
          source={{ uri: swimmer.swimClubLogoUrl }}
          style={styles.logo}
          resizeMode="contain"
        />
      ) : (
        <View
          style={[styles.avatarPlaceholder, { backgroundColor: theme.primary + "20" }]}
        >
          <Feather name="user" size={20} color={theme.primary} />
        </View>
      )}

      <View style={styles.content}>
        <ThemedText type="body" numberOfLines={1} style={styles.name}>
          {fullName}
        </ThemedText>
        <View style={styles.meta}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {swimmer.swimClubName}
          </ThemedText>
          {swimmer.birthYear ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {swimmer.birthYear}
            </ThemedText>
          ) : null}
        </View>
      </View>

      {onPress ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
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
  logo: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: "600",
  },
  meta: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
});
