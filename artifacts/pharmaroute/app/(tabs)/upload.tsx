import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useUploadPaper, useListPapers, getListPapersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";
import type { Paper } from "@workspace/api-client-react";

const SAMPLE_PAPERS = [
  {
    title: "mTOR Inhibition Extends Lifespan and Reduces Neurodegeneration",
    abstract: "Rapamycin-mediated mTOR inhibition activates autophagy and reduces tau phosphorylation in mouse models of Alzheimer's disease.",
    content: "This study demonstrates that chronic rapamycin treatment inhibits mTOR complex 1 (mTORC1), leading to enhanced autophagic clearance of misfolded proteins. In APP/PS1 transgenic mice, rapamycin reduced amyloid-beta plaques by 47% and tau NFTs by 38%. AMPK activation was observed downstream of mTOR inhibition, suggesting a dual mechanism. Protein aggregation assays showed reduced TDP-43, FUS, and α-synuclein accumulation.",
  },
  {
    title: "Metformin Activates AMPK and Reduces Neuroinflammation",
    abstract: "Metformin treatment in aged mice reduces microglia activation and inflammatory cytokine production via AMPK/NF-κB pathway.",
    content: "We investigated metformin's neuroprotective effects beyond glycemic control. AMPK activation by metformin suppressed NF-κB nuclear translocation, reducing TNF-α, IL-6, and IL-1β production in BV-2 microglia. In vivo, metformin-treated 5xFAD mice showed 52% reduction in neuroinflammatory markers and improved Morris water maze performance. COX-2 inhibition was secondary to AMPK activation.",
  },
];

export default function UploadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState<string[]>([]);

  const { data: papers, isLoading } = useListPapers();
  const uploadMutation = useUploadPaper();

  const handleUpload = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Missing fields", "Title and content are required");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await uploadMutation.mutateAsync({
        data: { title, abstract, content, authors: [] },
      });
      setSubmitted((prev) => [...prev, result.id]);
      setTitle("");
      setAbstract("");
      setContent("");
      await queryClient.invalidateQueries({ queryKey: getListPapersQueryKey() });
      Alert.alert("Processing started", `"${result.title}" is being analyzed by AI`);
    } catch {
      Alert.alert("Upload failed", "Please try again");
    }
  };

  const loadSample = (sample: typeof SAMPLE_PAPERS[0]) => {
    setTitle(sample.title);
    setAbstract(sample.abstract);
    setContent(sample.content);
    Haptics.selectionAsync();
  };

  const getStatusColor = (status: string) => {
    if (status === "completed") return colors.success;
    if (status === "failed") return "#FB7185";
    return colors.warning;
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 20 : 12),
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 },
    subtitle: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionTitle: {
      fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground,
      letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10,
    },
    sampleRow: { flexDirection: "row", gap: 8 },
    sampleBtn: {
      flex: 1, backgroundColor: colors.secondary,
      borderRadius: 8, padding: 10,
      borderWidth: 1, borderColor: colors.border,
    },
    sampleTitle: { fontSize: 11, color: colors.primary, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
    sampleSub: { fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    formField: { marginBottom: 14 },
    label: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 6 },
    input: {
      backgroundColor: colors.secondary,
      borderRadius: 8, padding: 12,
      color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 14,
      borderWidth: 1, borderColor: colors.border,
    },
    textarea: { height: 120, textAlignVertical: "top" },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: 10, paddingVertical: 14,
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
      marginHorizontal: 20, marginBottom: 24,
    },
    submitText: { fontSize: 15, color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" },
    paperCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius, padding: 14, marginBottom: 8,
      borderWidth: 1, borderColor: colors.border,
      flexDirection: "row", alignItems: "center", gap: 12,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    paperTitle: { fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground, flex: 1 },
    paperMeta: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    emptyPapers: { alignItems: "center", paddingVertical: 20 },
    emptyText: { fontSize: 12, color: colors.mutedForeground },
    bottomPad: { height: 100 },
  });

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>Upload Paper</Text>
          <Text style={s.subtitle}>Extract biomedical entities and build knowledge graph</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick Load Sample</Text>
          <View style={s.sampleRow}>
            {SAMPLE_PAPERS.map((sp, i) => (
              <TouchableOpacity key={i} style={s.sampleBtn} onPress={() => loadSample(sp)} activeOpacity={0.7}>
                <Text style={s.sampleTitle} numberOfLines={2}>{sp.title.substring(0, 40)}...</Text>
                <Text style={s.sampleSub}>Tap to load</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Paper Details</Text>
          <View style={s.formField}>
            <Text style={s.label}>Title *</Text>
            <TextInput
              style={s.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Paper title..."
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
          <View style={s.formField}>
            <Text style={s.label}>Abstract</Text>
            <TextInput
              style={[s.input, { height: 80, textAlignVertical: "top" }]}
              value={abstract}
              onChangeText={setAbstract}
              placeholder="Abstract..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />
          </View>
          <View style={s.formField}>
            <Text style={s.label}>Full Text / Content *</Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={content}
              onChangeText={setContent}
              placeholder="Paste the paper content here..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />
          </View>
        </View>

        <TouchableOpacity
          style={[s.submitBtn, (uploadMutation.isPending) && { opacity: 0.6 }]}
          onPress={handleUpload}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending
            ? <ActivityIndicator color={colors.primaryForeground} />
            : <Feather name="upload" size={16} color={colors.primaryForeground} />
          }
          <Text style={s.submitText}>
            {uploadMutation.isPending ? "Processing..." : "Upload & Extract"}
          </Text>
        </TouchableOpacity>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Recent Papers ({(papers ?? []).length})</Text>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (papers ?? []).length === 0 ? (
            <View style={s.emptyPapers}>
              <Feather name="file" size={28} color={colors.mutedForeground} />
              <Text style={s.emptyText}>No papers uploaded yet</Text>
            </View>
          ) : (
            (papers ?? []).slice(0, 10).map((paper: Paper) => (
              <View key={paper.id} style={s.paperCard}>
                <View style={[s.statusDot, { backgroundColor: getStatusColor(paper.status) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.paperTitle} numberOfLines={2}>{paper.title}</Text>
                  <Text style={s.paperMeta}>
                    {paper.status === "completed"
                      ? `${paper.entitiesExtracted ?? 0} entities · ${paper.relationshipsExtracted ?? 0} relationships`
                      : paper.status}
                  </Text>
                </View>
                <Feather name={paper.status === "completed" ? "check-circle" : "clock"} size={16} color={getStatusColor(paper.status)} />
              </View>
            ))
          )}
        </View>

        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}
