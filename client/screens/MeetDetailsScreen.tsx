import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { SegmentedControl } from "@/components/SegmentedControl";
import { EventCard } from "@/components/EventCard";
import { DocumentItem } from "@/components/DocumentItem";
import { SwimmerRow } from "@/components/SwimmerRow";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { LiveBadge } from "@/components/LiveBadge";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import {
  Meet,
  MeetDetails,
  Swimmer,
  DocumentGroup,
  ScheduleEntry,
  MeetStats,
  getMeetStatus,
  getPoolLengthName,
} from "@/types/swim";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

type RouteProps = RouteProp<RootStackParamList, "MeetDetails">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TABS = ["Oversikt", "Øvelser", "Program", "Dokumenter"];

async function fetchMeetDetails(meetId: string): Promise<MeetDetails> {
  const baseUrl = getApiUrl();
  const res = await fetch(new URL(`/api/meets/${meetId}/details`, baseUrl));
  if (!res.ok) throw new Error("Failed to fetch meet details");
  return res.json();
}

async function fetchSwimmers(meetId: string): Promise<Swimmer[]> {
  const baseUrl = getApiUrl();
  const res = await fetch(new URL(`/api/meets/${meetId}/swimmers`, baseUrl));
  if (!res.ok) throw new Error("Failed to fetch swimmers");
  return res.json();
}

async function fetchDocuments(meetId: string): Promise<DocumentGroup[]> {
  const baseUrl = getApiUrl();
  const res = await fetch(new URL(`/api/meets/${meetId}/documents`, baseUrl));
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

async function fetchSchedule(meetId: string): Promise<ScheduleEntry[]> {
  const baseUrl = getApiUrl();
  const res = await fetch(new URL(`/api/meets/${meetId}/schedule`, baseUrl));
  if (!res.ok) throw new Error("Failed to fetch schedule");
  return res.json();
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
      <Feather name={icon as any} size={20} color={color || theme.primary} />
      <ThemedText style={[styles.statValue, { color: color || theme.text }]}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
    </View>
  );
}

export default function MeetDetailsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { meet } = route.params;

  const [selectedTab, setSelectedTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const meetId =
    meet.source === "swimlane" ? meet.medleyLivetimingPath : String(meet.id);

  const meetStatus = getMeetStatus(meet.startDate, meet.endDate);
  const isLive = meetStatus === "live";

  const { data: meetDetails, isLoading: detailsLoading, refetch: refetchDetails } = useQuery<MeetDetails>({
    queryKey: ["meetDetails", meetId],
    queryFn: () => fetchMeetDetails(meetId!),
    enabled: meet.source === "swimlane" && !!meetId,
  });

  const { data: swimmers, isLoading: swimmersLoading, refetch: refetchSwimmers } = useQuery<Swimmer[]>({
    queryKey: ["swimmers", meetId],
    queryFn: () => fetchSwimmers(meetId!),
    enabled: meet.source === "swimlane" && !!meetId,
  });

  const { data: documents, isLoading: documentsLoading, refetch: refetchDocuments } = useQuery<DocumentGroup[]>({
    queryKey: ["documents", meetId],
    queryFn: () => fetchDocuments(meetId!),
    enabled: meet.source === "swimlane" && !!meetId,
  });

  const { data: schedule, isLoading: scheduleLoading, refetch: refetchSchedule } = useQuery<ScheduleEntry[]>({
    queryKey: ["schedule", meetId],
    queryFn: () => fetchSchedule(meetId!),
    enabled: meet.source === "swimlane" && !!meetId,
  });

  const stats: MeetStats = useMemo(() => {
    const total = swimmers?.length || 0;
    const males = swimmers?.filter((s) => s.gender === 1).length || 0;
    const females = swimmers?.filter((s) => s.gender === -1).length || 0;
    
    // Debug: Log gender distribution
    const genderDist = swimmers?.reduce((acc: any, s: any) => {
      acc[s.gender] = (acc[s.gender] || 0) + 1;
      return acc;
    }, {}) || {};
    console.log("Gender distribution:", genderDist, "Males:", males, "Females:", females);
    
    const clubIds = new Set(swimmers?.map((s) => s.meetSwimClubNumber) || []);
    const totalClubs = clubIds.size;
    
    const totalEvents = meetDetails?.sessions.reduce(
      (sum, s) => sum + s.meetEvents.length,
      0
    ) || 0;

    return { totalSwimmers: total, maleSwimmers: males, femaleSwimmers: females, totalClubs, totalEvents };
  }, [swimmers, meetDetails]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchDetails(),
      refetchSwimmers(),
      refetchDocuments(),
      refetchSchedule(),
    ]);
    setRefreshing(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("no-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleEventPress = (eventNumber: number) => {
    navigation.navigate("EventDetails", {
      meetId: meetId as string,
      eventNumber,
      meetSource: meet.source,
    });
  };

  const handleClubsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Clubs", {
      meetId: meetId as string,
      meetName: meet.name,
    });
  };

  const handleLivePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("MeetLive", {
      meetId: meetId as string,
      meetName: meet.name,
    });
  };

  const imageUrl = meet.largeImage || meet.smallImage || meet.meetLogoUrl;
  const poolLength = meet.poolSize ? getPoolLengthName(meet.poolSize * 100) : meetDetails?.sessions?.[0]?.meetEvents?.[0]?.poolLength ? getPoolLengthName(meetDetails.sessions[0].meetEvents[0].poolLength) : null;

  const renderOverview = () => (
    <View style={styles.section}>
      <View style={styles.statsGrid}>
        <StatCard icon="users" label="Deltakere" value={stats.totalSwimmers} />
        <StatCard icon="home" label="Klubber" value={stats.totalClubs} />
        <StatCard icon="user" label="Herrer" value={stats.maleSwimmers} color="#0066CC" />
        <StatCard icon="user" label="Damer" value={stats.femaleSwimmers} color="#FF2D55" />
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Feather name="map-pin" size={18} color={theme.primary} />
          <ThemedText type="body">{meet.location || meet.city}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Feather name="users" size={18} color={theme.primary} />
          <ThemedText type="body">{meet.organizer}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Feather name="calendar" size={18} color={theme.primary} />
          <View>
            <ThemedText type="body">{formatDate(meet.startDate)}</ThemedText>
            {meet.startDate !== meet.endDate ? (
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                til {formatDate(meet.endDate)}
              </ThemedText>
            ) : null}
          </View>
        </View>
        <View style={styles.infoRow}>
          <Feather name="droplet" size={18} color={theme.primary} />
          <ThemedText type="body">
            {meet.numberOfLanes} baner
          </ThemedText>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Pressable
          onPress={handleClubsPress}
          style={[styles.actionButton, { backgroundColor: theme.primary + "20" }]}
        >
          <Feather name="users" size={20} color={theme.primary} />
          <ThemedText style={[styles.actionButtonText, { color: theme.primary }]}>
            Se klubber
          </ThemedText>
          <Feather name="chevron-right" size={18} color={theme.primary} />
        </Pressable>

        {isLive ? (
          <Pressable
            onPress={handleLivePress}
            style={[styles.actionButton, { backgroundColor: theme.liveIndicator + "20" }]}
          >
            <Feather name="activity" size={20} color={theme.liveIndicator} />
            <ThemedText style={[styles.actionButtonText, { color: theme.liveIndicator }]}>
              Se live resultater
            </ThemedText>
            <Feather name="chevron-right" size={18} color={theme.liveIndicator} />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleLivePress}
            style={[styles.actionButton, { backgroundColor: theme.success + "20" }]}
          >
            <Feather name="list" size={20} color={theme.success} />
            <ThemedText style={[styles.actionButtonText, { color: theme.success }]}>
              Se resultater
            </ThemedText>
            <Feather name="chevron-right" size={18} color={theme.success} />
          </Pressable>
        )}
      </View>

      {meetDetails?.sessions && meetDetails.sessions.length > 0 ? (
        <View style={styles.sessionsContainer}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Økter
          </ThemedText>
          {meetDetails.sessions.map((session) => (
            <View
              key={session.id}
              style={[
                styles.sessionCard,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <ThemedText type="h4">{session.name}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {session.meetEvents.length} øvelser
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );

  const renderEvents = () => {
    if (detailsLoading) {
      return (
        <View style={styles.section}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonLoader key={i} height={72} style={{ marginBottom: 12 }} />
          ))}
        </View>
      );
    }

    const allEvents =
      meetDetails?.sessions.flatMap((s) => s.meetEvents) || [];

    if (allEvents.length === 0) {
      return (
        <EmptyState
          image={require("../../assets/images/empty-results.png")}
          title="Ingen øvelser"
          message="Øvelsene er ikke tilgjengelige for dette stevnet ennå."
        />
      );
    }

    return (
      <View style={styles.section}>
        {allEvents.map((event) => (
          <EventCard
            key={`${event.session}-${event.eventNumber}`}
            event={event}
            onPress={() => handleEventPress(event.eventNumber)}
          />
        ))}
      </View>
    );
  };

  const renderSchedule = () => {
    if (scheduleLoading) {
      return (
        <View style={styles.section}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonLoader key={i} height={40} style={{ marginBottom: 8 }} />
          ))}
        </View>
      );
    }

    if (!schedule || schedule.length === 0) {
      return (
        <EmptyState
          image={require("../../assets/images/empty-results.png")}
          title="Ingen program"
          message="Tidsprogrammet er ikke tilgjengelig for dette stevnet."
        />
      );
    }

    return (
      <View style={styles.section}>
        {schedule.map((entry, index) => (
          <View
            key={`${entry.lineNumber}-${index}`}
            style={[
              styles.scheduleItem,
              entry.headding === 1 && styles.scheduleHeading,
              { borderBottomColor: theme.border },
            ]}
          >
            {entry.time ? (
              <ThemedText
                style={[styles.scheduleTime, { color: theme.primary }]}
              >
                {entry.time}
              </ThemedText>
            ) : (
              <View style={styles.scheduleTimePlaceholder} />
            )}
            <ThemedText
              type={entry.headding === 1 ? "h4" : "body"}
              style={styles.scheduleText}
            >
              {entry.scheduleText}
            </ThemedText>
          </View>
        ))}
      </View>
    );
  };

  const renderDocuments = () => {
    if (documentsLoading) {
      return (
        <View style={styles.section}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLoader key={i} height={56} style={{ marginBottom: 12 }} />
          ))}
        </View>
      );
    }

    const allDocs = documents?.flatMap((g) => g.documents) || [];

    if (allDocs.length === 0) {
      return (
        <EmptyState
          image={require("../../assets/images/empty-results.png")}
          title="Ingen dokumenter"
          message="Det er ingen dokumenter tilgjengelige for dette stevnet."
        />
      );
    }

    return (
      <View style={styles.section}>
        {allDocs.map((doc, index) => (
          <DocumentItem key={`${doc.title}-${index}`} document={doc} />
        ))}
      </View>
    );
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 0:
        return renderOverview();
      case 1:
        return renderEvents();
      case 2:
        return renderSchedule();
      case 3:
        return renderDocuments();
      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight,
        paddingBottom: insets.bottom + Spacing.xl,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
    >
      {imageUrl ? (
        <View style={styles.bannerContainer}>
          <Image source={{ uri: imageUrl }} style={styles.banner} />
          <LinearGradient
            colors={["transparent", isDark ? "#000000" : "#FFFFFF"]}
            style={styles.bannerGradient}
          />
        </View>
      ) : null}

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText type="h2" style={styles.title}>
            {meet.name}
          </ThemedText>
          {isLive ? <LiveBadge /> : null}
        </View>
      </View>

      <View style={styles.segmentContainer}>
        <SegmentedControl
          segments={TABS}
          selectedIndex={selectedTab}
          onSelect={setSelectedTab}
        />
      </View>

      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerContainer: {
    height: 200,
    position: "relative",
  },
  banner: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  title: {
    flex: 1,
  },
  segmentContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
  },
  infoCard: {
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  actionButtons: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  sessionsContainer: {
    marginTop: Spacing.xl,
  },
  sessionCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: 4,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  scheduleHeading: {
    paddingTop: Spacing.lg,
    borderBottomWidth: 0,
  },
  scheduleTime: {
    width: 50,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  scheduleTimePlaceholder: {
    width: 50,
  },
  scheduleText: {
    flex: 1,
  },
});
