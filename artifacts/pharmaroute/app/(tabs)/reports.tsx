import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Platform, ActivityIndicator, Modal, TextInput, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useListReports, useGenerateReport, getListReportsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import type { Report } from "@workspace/api-client-react";

const REPORT_TYPES = [
  { type: "comprehensive", label: "Comprehensive", icon: "layers" as const, color: "#4FC3F7" },
  { type: "discovery", label: "Discovery", icon: "zap" as const, color: "#A78BFA" },
  { type: "trends", label: "Trends", icon: "trending-up" as const, color: "#10B981" },
  { type: "graph_analysis", label: "Graph Analysis", icon: "share-2" as const, color: "#F59E0B" },
];

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState("comprehensive");
  const [targetDisease, setTargetDisease] = useState("");

  const { data: reports, isLoading } = useListReports();
  const generateMutation = useGenerateReport();

  const handleGenerate = async () => {
    if (!reportTitle.trim()) {
      Alert.alert("Title required");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await generateMutation.mutateAsync({
        data: { title: reportTitle, type: reportType as Report["type"], targetDisease: targetDisease || undefined },
      });
      await queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
      setModalVisible(false);
      setReportTitle("");
      setTargetDisease("");
    } catch {
      Alert.alert("Failed to generate report");
    }
  };

  const getTypeConfig = (type: string) => REPORT_TYPES.find((r) => r.type === type) ?? REPORT_TYPES[0]!;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 20 : 12),
      paddingHorizontal: 20, paddingBottom: 16,
    },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground },
    newBtn: {
      backgroundColor: colors.accent,
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
      flexDirection: "row", alignItems: "center", gap: 6,
    },
    newText: { fontSize: 13, color: "#fff", fontFamily: "Inter_600SemiBold" },
    list: { paddingHorizontal: 20 },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius, padding: 16, marginBottom: 10,
      borderWidth: 1, borderColor: colors.border,
    },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    iconBox: {
      width: 38, height: 38, borderRadius: 10,
      alignItems: "center", justifyContent: "center",
    },
    cardTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, flex: 1 },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    typeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
    summary: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, marginBottom: 10 },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    dateText: { fontSize: 11, color: colors.mutedForeground },
    viewBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    viewText: { fontSize: 12, color: colors.primary },
    emptyContainer: { flex: 1, alignItems: "center", paddingTop: 80 },
    emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 12 },
    emptyText: { fontSize: 13, color: colors.mutedForeground, marginTop: 4 },
    bottomPad: { height: 100 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20, borderTopRightRadius: 20,
      padding: 24, paddingBottom: insets.bottom + 24,
    },
    modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 20 },
    label: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 6 },
    input: {
      backgroundColor: colors.secondary,
      borderRadius: 8, padding: 12,
      color: colors.foreground, fontSize: 14, fontFamily: "Inter_400Regular",
      borderWidth: 1, borderColor: colors.border, marginBottom: 14,
    },
    typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
    typeChip: {
      flexDirection: "row", alignItems: "center", gap: 6,
      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
      borderWidth: 1,
    },
    typeChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
    generateBtn: {
      backgroundColor: colors.primary,
      borderRadius: 10, paddingVertical: 14,
      alignItems: "center",
    },
    generateText: { fontSize: 15, color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" },
    cancelBtn: { alignItems: "center", paddingVertical: 12 },
    cancelText: { fontSize: 14, color: colors.mutedForeground },
  });

  const renderReport = ({ item: report }: { item: Report }) => {
    const tc = getTypeConfig(report.type);
    return (
      <View style={s.card}>
        <View style={s.cardTop}>
          <View style={[s.iconBox, { backgroundColor: tc.color + "22" }]}>
            <Feather name={tc.icon} size={18} color={tc.color} />
          </View>
          <Text style={s.cardTitle} numberOfLines={2}>{report.title}</Text>
        </View>
        <Text style={s.summary} numberOfLines={3}>{report.summary}</Text>
        <View style={s.cardFooter}>
          <Text style={s.dateText}>{new Date(report.createdAt).toLocaleDateString()}</Text>
          <View style={s.viewBtn}>
            <Feather name="download" size={13} color={colors.primary} />
            <Text style={s.viewText}>Export</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.title}>Reports</Text>
          <TouchableOpacity style={s.newBtn} onPress={() => setModalVisible(true)}>
            <Feather name="plus" size={14} color="#fff" />
            <Text style={s.newText}>Generate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={s.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reports ?? []}
          renderItem={renderReport}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!(reports ?? []).length}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Feather name="file-text" size={40} color={colors.mutedForeground} />
              <Text style={s.emptyTitle}>No reports yet</Text>
              <Text style={s.emptyText}>Generate your first research intelligence report</Text>
            </View>
          }
          ListFooterComponent={<View style={s.bottomPad} />}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Generate Report</Text>

            <Text style={s.label}>Report Title</Text>
            <TextInput
              style={s.input}
              value={reportTitle}
              onChangeText={setReportTitle}
              placeholder="e.g. Drug Repurposing Summary Q1"
              placeholderTextColor={colors.mutedForeground}
            />

            <Text style={s.label}>Report Type</Text>
            <View style={s.typeGrid}>
              {REPORT_TYPES.map((rt) => (
                <TouchableOpacity
                  key={rt.type}
                  style={[s.typeChip, {
                    backgroundColor: reportType === rt.type ? rt.color + "22" : colors.secondary,
                    borderColor: reportType === rt.type ? rt.color : colors.border,
                  }]}
                  onPress={() => setReportType(rt.type)}
                >
                  <Feather name={rt.icon} size={13} color={reportType === rt.type ? rt.color : colors.mutedForeground} />
                  <Text style={[s.typeChipText, { color: reportType === rt.type ? rt.color : colors.mutedForeground }]}>
                    {rt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Target Disease (optional)</Text>
            <TextInput
              style={s.input}
              value={targetDisease}
              onChangeText={setTargetDisease}
              placeholder="e.g. Alzheimer's Disease"
              placeholderTextColor={colors.mutedForeground}
            />

            <TouchableOpacity
              style={[s.generateBtn, generateMutation.isPending && { opacity: 0.6 }]}
              onPress={handleGenerate}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending
                ? <ActivityIndicator color={colors.primaryForeground} />
                : <Text style={s.generateText}>Generate Report</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
