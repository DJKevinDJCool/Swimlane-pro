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
  showGender?: boolean;
  showBirthYear?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SwimmerRow({
  swimmer,
  onPress,
  showGender = false,
  showBirthYear = false,
}: SwimmerRowProps) {
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
  
  const genderColor = swimmer.gender === 1 ? "#0066CC" : swimmer.gender === 2 ? "#FF2D55" : theme.textSecondary;
  const genderLabel = swimmer.gender === 1 ? "M" : swimmer.gender === 2 ? "K" : "?";

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
          style={[styles.avatarPlaceholder, { backgroundColor: genderColor + "20" }]}
        >
          {showGender ? (
            <ThemedText style={[styles.genderText, { color: genderColor }]}>
              {genderLabel}
            </ThemedText>
          ) : (
            <Feather name="user" size={20} color={theme.primary} />
          )}
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
          {showBirthYear && swimmer.birthYear ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {swimmer.birthYear}
            </ThemedText>
          ) : null}
        </View>
      </View>

      {showGender && !hasLogo ? (
        <View
          style={[styles.genderBadge, { backgroundColor: genderColor + "20" }]}
        >
          <ThemedText style={[styles.genderBadgeText, { color: genderColor }]}>
            {genderLabel}
          </ThemedText>
        </View>
      ) : null}

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
  genderText: {
    fontSize: 16,
    fontWeight: "700",
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
  genderBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  genderBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
