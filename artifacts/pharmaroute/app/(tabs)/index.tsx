import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Platform, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  useGetGraphStats,
  useListDiscoveries,
  useGetResearchTrends,
  useSeedDemoData,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import type { Discovery, ResearchTrend } from "@workspace/api-client-react";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, refetch: refetchStats, isLoading: statsLoading } = useGetGraphStats();
  const { data: discoveries, refetch: refetchDisc } = useListDiscoveries({ minConfidence: 0.7, limit: 3 });
  const { data: trends, refetch: refetchTrends } = useGetResearchTrends();
  const seedMutation = useSeedDemoData();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchDisc(), refetchTrends()]);
    setRefreshing(false);
  }, [refetchStats, refetchDisc, refetchTrends]);

  const handleSeedDemo = () => {
    seedMutation.mutate(undefined);
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 20 : 16),
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    logo: { flexDirection: "row", alignItems: "center", gap: 8 },
    logoIcon: {
      width: 32, height: 32, borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: "center", justifyContent: "center",
    },
    logoText: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground },
    logoSub: { fontSize: 10, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    seedBtn: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
      flexDirection: "row", alignItems: "center", gap: 4,
    },
    seedText: { fontSize: 12, color: colors.primary, fontFamily: "Inter_500Medium" },
    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionTitle: {
      fontSize: 12, fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground, letterSpacing: 1.2,
      textTransform: "uppercase", marginBottom: 12,
    },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    statCard: {
      flex: 1, minWidth: "45%",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      borderWidth: 1, borderColor: colors.border,
    },
    statValue: {
      fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground,
      marginBottom: 2,
    },
    statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    statIcon: { marginBottom: 8 },
    discCard: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      padding: 16, marginBottom: 10,
      borderWidth: 1, borderColor: colors.border,
    },
    discHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    discTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, flex: 1, marginRight: 8 },
    confBadge: {
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
      backgroundColor: colors.accent + "22",
    },
    confText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.accent },
    discPath: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 6 },
    discMeta: { flexDirection: "row", alignItems: "center", gap: 12 },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    trendCard: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      padding: 14, marginBottom: 8,
      borderWidth: 1, borderColor: colors.border,
      flexDirection: "row", alignItems: "center",
    },
    trendLeft: { flex: 1 },
    trendTopic: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    trendDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    trendRight: { alignItems: "flex-end" },
    trendScore: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.success },
    trendDir: { fontSize: 10, color: colors.mutedForeground },
    seeAll: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "center", paddingVertical: 12,
      gap: 6,
    },
    seeAllText: { fontSize: 13, color: colors.primary, fontFamily: "Inter_500Medium" },
    bottomPad: { height: 100 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  });

  const statItems = [
    { label: "Compounds", value: stats?.compounds ?? 0, icon: "box" as const, color: colors.primary },
    { label: "Proteins", value: stats?.proteins ?? 0, icon: "cpu" as const, color: "#A78BFA" },
    { label: "Diseases", value: stats?.diseases ?? 0, icon: "heart" as const, color: "#FB7185" },
    { label: "Relationships", value: stats?.relationships ?? 0, icon: "share-2" as const, color: colors.success },
  ];

  return (
    <View style={s.container}>
      <ScrollView
        style={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <View style={s.headerRow}>
            <View style={s.logo}>
              <View style={s.logoIcon}>
                <Feather name="activity" size={16} color={colors.primaryForeground} />
              </View>
              <View>
                <Text style={s.logoText}>PharmaRoute</Text>
                <Text style={s.logoSub}>Biomedical Intelligence Platform</Text>
              </View>
            </View>
            <TouchableOpacity style={s.seedBtn} onPress={handleSeedDemo} disabled={seedMutation.isPending}>
              {seedMutation.isPending
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Feather name="database" size={12} color={colors.primary} />
              }
              <Text style={s.seedText}>Seed Demo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Knowledge Graph</Text>
          {statsLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <View style={s.statsGrid}>
              {statItems.map((item) => (
                <View key={item.label} style={s.statCard}>
                  <Feather name={item.icon} size={18} color={item.color} style={s.statIcon} />
                  <Text style={[s.statValue, { color: item.color }]}>
                    {item.value.toLocaleString()}
                  </Text>
                  <Text style={s.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Top Discoveries</Text>
          {(discoveries ?? []).slice(0, 3).map((disc: Discovery) => (
            <TouchableOpacity
              key={disc.id}
              style={s.discCard}
              onPress={() => router.push(`/discovery/${disc.id}`)}
              activeOpacity={0.7}
            >
              <View style={s.discHeader}>
                <Text style={s.discTitle}>{disc.title}</Text>
                <View style={s.confBadge}>
                  <Text style={s.confText}>{Math.round(disc.confidence * 100)}%</Text>
                </View>
              </View>
              <Text style={s.discPath} numberOfLines={1}>
                {(disc.biologicalPath ?? []).join(" → ")}
              </Text>
              <View style={s.discMeta}>
                <View style={s.metaItem}>
                  <Feather name="file-text" size={11} color={colors.mutedForeground} />
                  <Text style={s.metaText}>{disc.evidenceCount} papers</Text>
                </View>
                <View style={s.metaItem}>
                  <Feather name="trending-up" size={11} color={colors.mutedForeground} />
                  <Text style={s.metaText}>Impact {Math.round((disc.impactScore ?? 0) * 100)}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.seeAll} onPress={() => router.push("/discoveries")}>
            <Text style={s.seeAllText}>View all discoveries</Text>
            <Feather name="chevron-right" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Research Trends</Text>
          {(trends ?? []).slice(0, 4).map((trend: ResearchTrend) => (
            <View key={trend.topic} style={s.trendCard}>
              <View style={s.trendLeft}>
                <Text style={s.trendTopic}>{trend.topic}</Text>
                <Text style={s.trendDesc} numberOfLines={1}>{trend.description}</Text>
              </View>
              <View style={s.trendRight}>
                <Text style={s.trendScore}>{Math.round((trend.score ?? 0) * 100)}</Text>
                <Text style={s.trendDir}>
                  {trend.direction === "rising" ? "↑" : trend.direction === "declining" ? "↓" : "→"} {trend.direction}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
