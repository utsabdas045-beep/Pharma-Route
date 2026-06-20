import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useGetDiscovery } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import type { EvidenceStep } from "@workspace/api-client-react";

export default function DiscoveryDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: discovery, isLoading } = useGetDiscovery(id ?? "");

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 20 : 12),
      paddingHorizontal: 20, paddingBottom: 16,
      flexDirection: "row", alignItems: "center", gap: 12,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center",
    },
    headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: colors.foreground, flex: 1 },
    scroll: { flex: 1 },
    heroCard: {
      margin: 20, marginTop: 0,
      backgroundColor: colors.card,
      borderRadius: 16, padding: 20,
      borderWidth: 1, borderColor: colors.border,
    },
    compoundTag: {
      backgroundColor: colors.primary + "22",
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
      alignSelf: "flex-start", marginBottom: 10,
    },
    compoundText: { color: colors.primary, fontSize: 12, fontFamily: "Inter_600SemiBold" },
    diseaseText: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 16 },
    metricsRow: { flexDirection: "row", gap: 12 },
    metricBox: {
      flex: 1, backgroundColor: colors.secondary,
      borderRadius: 10, padding: 12, alignItems: "center",
    },
    metricValue: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 2 },
    metricLabel: { fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionTitle: {
      fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground,
      letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12,
    },
    pathContainer: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
    pathNode: {
      backgroundColor: colors.secondary, paddingHorizontal: 10, paddingVertical: 6,
      borderRadius: 8, borderWidth: 1, borderColor: colors.border,
    },
    pathNodeText: { fontSize: 12, color: colors.foreground, fontFamily: "Inter_500Medium" },
    pathArrow: { color: colors.primary, fontSize: 16 },
    explanationCard: {
      backgroundColor: colors.card,
      borderRadius: 12, padding: 16,
      borderWidth: 1, borderColor: colors.border,
      borderLeftWidth: 3, borderLeftColor: colors.primary,
    },
    explanationText: {
      fontSize: 14, color: colors.foreground, lineHeight: 22,
      fontFamily: "Inter_400Regular",
    },
    evidenceStep: {
      backgroundColor: colors.card,
      borderRadius: 10, padding: 14, marginBottom: 8,
      flexDirection: "row", alignItems: "flex-start", gap: 10,
      borderWidth: 1, borderColor: colors.border,
    },
    stepDot: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: colors.accent + "22",
      alignItems: "center", justifyContent: "center",
    },
    stepContent: { flex: 1 },
    stepText: { fontSize: 13, color: colors.foreground, fontFamily: "Inter_500Medium" },
    stepRel: {
      fontSize: 10, color: colors.accent,
      fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, marginTop: 2,
    },
    confBar: { height: 4, borderRadius: 2, backgroundColor: colors.secondary, marginTop: 6 },
    confFill: { height: 4, borderRadius: 2, backgroundColor: colors.primary },
    papersCard: {
      backgroundColor: colors.card, borderRadius: 10, padding: 14,
      borderWidth: 1, borderColor: colors.border, marginBottom: 8,
      flexDirection: "row", alignItems: "center", gap: 10,
    },
    paperText: { fontSize: 13, color: colors.foreground, fontFamily: "Inter_400Regular" },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    bottomPad: { height: 40 },
  });

  if (isLoading) {
    return (
      <View style={[s.container, s.emptyContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!discovery) {
    return (
      <View style={[s.container, s.emptyContainer]}>
        <Text style={{ color: colors.foreground }}>Discovery not found</Text>
      </View>
    );
  }

  const confColor = discovery.confidence >= 0.8 ? colors.success : discovery.confidence >= 0.6 ? colors.warning : "#FB7185";

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Feather name="x" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{discovery.compound} → {discovery.disease}</Text>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.heroCard}>
          <View style={s.compoundTag}>
            <Text style={s.compoundText}>{discovery.compound}</Text>
          </View>
          <Text style={s.diseaseText}>{discovery.disease}</Text>
          <View style={s.metricsRow}>
            <View style={s.metricBox}>
              <Text style={[s.metricValue, { color: confColor }]}>
                {Math.round(discovery.confidence * 100)}%
              </Text>
              <Text style={s.metricLabel}>Confidence</Text>
            </View>
            <View style={s.metricBox}>
              <Text style={[s.metricValue, { color: colors.primary }]}>
                {Math.round((discovery.impactScore ?? 0) * 100)}%
              </Text>
              <Text style={s.metricLabel}>Impact</Text>
            </View>
            <View style={s.metricBox}>
              <Text style={[s.metricValue, { color: colors.accent }]}>
                {discovery.evidenceCount}
              </Text>
              <Text style={s.metricLabel}>Papers</Text>
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Biological Pathway</Text>
          <View style={s.pathContainer}>
            {(discovery.biologicalPath ?? []).map((node: string, i: number) => (
              <React.Fragment key={i}>
                <View style={s.pathNode}>
                  <Text style={s.pathNodeText}>{node}</Text>
                </View>
                {i < (discovery.biologicalPath ?? []).length - 1 && (
                  <Text style={s.pathArrow}>→</Text>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>AI Explanation</Text>
          <View style={s.explanationCard}>
            <Text style={s.explanationText}>{discovery.explanation}</Text>
          </View>
        </View>

        {(discovery as { evidenceChain?: EvidenceStep[] }).evidenceChain?.length ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Evidence Chain</Text>
            {((discovery as { evidenceChain?: EvidenceStep[] }).evidenceChain ?? []).map(
              (step: EvidenceStep, i: number) => (
                <View key={i} style={s.evidenceStep}>
                  <View style={s.stepDot}>
                    <Text style={{ fontSize: 11, color: colors.accent, fontFamily: "Inter_700Bold" }}>
                      {i + 1}
                    </Text>
                  </View>
                  <View style={s.stepContent}>
                    <Text style={s.stepText}>{step.from} → {step.to}</Text>
                    <Text style={s.stepRel}>{step.relationship}</Text>
                    <View style={s.confBar}>
                      <View style={[s.confFill, { width: `${(step.confidence ?? 0) * 100}%` }]} />
                    </View>
                    {step.source && (
                      <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 4 }}>
                        Source: {step.source}
                      </Text>
                    )}
                  </View>
                </View>
              )
            )}
          </View>
        ) : null}

        {(discovery.supportingPapers ?? []).length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Supporting Papers</Text>
            {(discovery.supportingPapers ?? []).map((paper: string) => (
              <View key={paper} style={s.papersCard}>
                <Feather name="file-text" size={16} color={colors.mutedForeground} />
                <Text style={s.paperText}>{paper}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
