import React from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
}

function SettingsItem({ icon, label, value, onPress }: SettingsItemProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!onPress}
      style={[
        styles.settingsItem,
        { backgroundColor: theme.cardBackground, borderColor: theme.border },
      ]}
    >
      <Feather name={icon as any} size={22} color={theme.primary} />
      <ThemedText type="body" style={styles.settingsLabel}>
        {label}
      </ThemedText>
      {value ? (
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {value}
        </ThemedText>
      ) : null}
      {onPress ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={styles.header}>
        <View
          style={[styles.avatar, { backgroundColor: theme.primary + "20" }]}
        >
          <Feather name="user" size={48} color={theme.primary} />
        </View>
        <ThemedText type="h3">Svømmer</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Din personlige svømme-app
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText
          type="small"
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          OM APPEN
        </ThemedText>
        <SettingsItem
          icon="droplet"
          label="Swimlane Pro"
          value="v1.0.0"
        />
        <SettingsItem
          icon="globe"
          label="Datakilder"
          value="Swimlane Live, Swimify"
        />
      </View>

      <View style={styles.section}>
        <ThemedText
          type="small"
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          INNSTILLINGER
        </ThemedText>
        <SettingsItem
          icon={isDark ? "moon" : "sun"}
          label="Utseende"
          value={isDark ? "Mørk" : "Lys"}
        />
        <SettingsItem
          icon="flag"
          label="Foretrukket land"
          value="Norge"
        />
      </View>

      <View style={styles.section}>
        <ThemedText
          type="small"
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          STØTTE
        </ThemedText>
        <SettingsItem icon="help-circle" label="Hjelp" onPress={() => {}} />
        <SettingsItem icon="info" label="Om Swimlane Live" onPress={() => {}} />
      </View>

      <View style={styles.footer}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.footerLogo}
        />
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Data levert av Swimlane Live og Swimify
        </ThemedText>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  settingsLabel: {
    flex: 1,
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  footerLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    opacity: 0.6,
  },
});
