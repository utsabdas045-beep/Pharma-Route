import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Platform, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useListDiscoveries, useRunDiscoveryEngine } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import type { Discovery } from "@workspace/api-client-react";

export default function DiscoveriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("");
  const [running, setRunning] = useState(false);

  const { data: discoveries, isLoading, refetch } = useListDiscoveries({ minConfidence: 0.4, limit: 50 });
  const runEngine = useRunDiscoveryEngine();

  const handleRunEngine = async () => {
    setRunning(true);
    await runEngine.mutateAsync({ data: { minConfidence: 0.5, maxHops: 4 } });
    await refetch();
    setRunning(false);
  };

  const filtered = (discoveries ?? []).filter((d: Discovery) =>
    !filter || d.compound.toLowerCase().includes(filter.toLowerCase()) ||
    d.disease.toLowerCase().includes(filter.toLowerCase())
  );

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return colors.success;
    if (conf >= 0.6) return colors.warning;
    return "#FB7185";
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 20 : 12),
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground },
    runBtn: {
      backgroundColor: colors.accent,
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
      flexDirection: "row", alignItems: "center", gap: 6,
    },
    runText: { fontSize: 13, color: "#fff", fontFamily: "Inter_600SemiBold" },
    searchBar: {
      backgroundColor: colors.secondary,
      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
      flexDirection: "row", alignItems: "center", gap: 8,
      borderWidth: 1, borderColor: colors.border,
    },
    searchInput: {
      flex: 1, fontSize: 14, color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    list: { paddingHorizontal: 20 },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16, marginBottom: 12,
      borderWidth: 1, borderColor: colors.border,
    },
    cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
    compound: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.primary },
    arrowRow: { flexDirection: "row", alignItems: "center", gap: 4, marginVertical: 2 },
    arrow: { color: colors.mutedForeground, fontSize: 14 },
    disease: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    confCircle: {
      width: 48, height: 48, borderRadius: 24,
      alignItems: "center", justifyContent: "center",
    },
    confPct: { fontSize: 13, fontFamily: "Inter_700Bold" },
    confLabel: { fontSize: 9, fontFamily: "Inter_400Regular", opacity: 0.8 },
    path: {
      fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular",
      marginBottom: 10, lineHeight: 16,
    },
    footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    metaRow: { flexDirection: "row", gap: 12 },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: { fontSize: 11, color: colors.mutedForeground },
    viewBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    viewText: { fontSize: 12, color: colors.primary, fontFamily: "Inter_500Medium" },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
    emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 12 },
    emptyText: { fontSize: 13, color: colors.mutedForeground, textAlign: "center", marginTop: 4 },
    bottomPad: { height: 100 },
  });

  const renderItem = ({ item: disc }: { item: Discovery }) => {
    const confColor = getConfidenceColor(disc.confidence);
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => router.push(`/discovery/${disc.id}`)}
        activeOpacity={0.7}
      >
        <View style={s.cardTop}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={s.compound}>{disc.compound}</Text>
            <View style={s.arrowRow}>
              <Text style={s.arrow}>⟶</Text>
            </View>
            <Text style={s.disease}>{disc.disease}</Text>
          </View>
          <View style={[s.confCircle, { backgroundColor: confColor + "22" }]}>
            <Text style={[s.confPct, { color: confColor }]}>
              {Math.round(disc.confidence * 100)}%
            </Text>
            <Text style={[s.confLabel, { color: confColor }]}>conf</Text>
          </View>
        </View>

        <Text style={s.path} numberOfLines={2}>
          {(disc.biologicalPath ?? []).join(" → ")}
        </Text>

        <View style={s.footer}>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <Feather name="book-open" size={11} color={colors.mutedForeground} />
              <Text style={s.metaText}>{disc.evidenceCount} papers</Text>
            </View>
            <View style={s.metaItem}>
              <Feather name="bar-chart-2" size={11} color={colors.mutedForeground} />
              <Text style={s.metaText}>Impact {Math.round((disc.impactScore ?? 0) * 100)}%</Text>
            </View>
          </View>
          <View style={s.viewBtn}>
            <Text style={s.viewText}>Details</Text>
            <Feather name="chevron-right" size={13} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.title}>Discoveries</Text>
          <TouchableOpacity
            style={s.runBtn}
            onPress={handleRunEngine}
            disabled={running || runEngine.isPending}
          >
            {running
              ? <ActivityIndicator size="small" color="#fff" />
              : <Feather name="zap" size={14} color="#fff" />
            }
            <Text style={s.runText}>Run Engine</Text>
          </TouchableOpacity>
        </View>
        <View style={s.searchBar}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={s.searchInput}
            placeholder="Search compound or disease..."
            placeholderTextColor={colors.mutedForeground}
            value={filter}
            onChangeText={setFilter}
          />
          {filter.length > 0 && (
            <TouchableOpacity onPress={() => setFilter("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={s.empty}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.emptyText}>Loading discoveries...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!filtered.length}
          ListEmptyComponent={
            <View style={s.empty}>
              <Feather name="zap-off" size={40} color={colors.mutedForeground} />
              <Text style={s.emptyTitle}>No discoveries yet</Text>
              <Text style={s.emptyText}>Upload papers and run the discovery engine</Text>
            </View>
          }
          ListFooterComponent={<View style={s.bottomPad} />}
        />
      )}
    </View>
  );
}
