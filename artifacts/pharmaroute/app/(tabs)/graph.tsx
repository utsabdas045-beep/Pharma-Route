import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, Platform, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListGraphNodes, useGetGraphStats, useGetCommunities } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import type { GraphNode, Community } from "@workspace/api-client-react";

const NODE_TYPES = ["All", "Compound", "Protein", "Disease", "Pathway", "Gene"];

const NODE_COLORS: Record<string, string> = {
  Compound: "#4FC3F7",
  Protein: "#A78BFA",
  Disease: "#FB7185",
  Pathway: "#10B981",
  Gene: "#F59E0B",
  Default: "#6B7A99",
};

export default function GraphScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState("All");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"nodes" | "clusters">("nodes");

  const queryType = selectedType === "All" ? undefined : selectedType;
  const { data: nodes, isLoading: nodesLoading } = useListGraphNodes(
    { type: queryType as "Compound" | "Protein" | "Gene" | "Disease" | "Pathway" | undefined, limit: 100 }
  );
  const { data: stats } = useGetGraphStats();
  const { data: communities, isLoading: clustersLoading } = useGetCommunities();

  const filteredNodes = (nodes ?? []).filter((n: GraphNode) =>
    !search || n.name.toLowerCase().includes(search.toLowerCase())
  );

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 20 : 12),
      paddingHorizontal: 20, paddingBottom: 12,
    },
    titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground },
    statsRow: { flexDirection: "row", gap: 16 },
    statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    statText: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    searchBar: {
      backgroundColor: colors.secondary,
      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
      flexDirection: "row", alignItems: "center", gap: 8,
      borderWidth: 1, borderColor: colors.border, marginBottom: 12,
    },
    searchInput: { flex: 1, fontSize: 14, color: colors.foreground, fontFamily: "Inter_400Regular" },
    tabs: { flexDirection: "row", marginBottom: 12, gap: 8 },
    tabBtn: {
      flex: 1, paddingVertical: 8, borderRadius: 8,
      alignItems: "center",
      borderWidth: 1,
    },
    tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    typeFilter: { paddingBottom: 12 },
    typeChip: {
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
      marginRight: 8, borderWidth: 1,
    },
    typeText: { fontSize: 12, fontFamily: "Inter_500Medium" },
    nodeCard: {
      backgroundColor: colors.card,
      borderRadius: 10, padding: 14, marginHorizontal: 20, marginBottom: 8,
      flexDirection: "row", alignItems: "center", gap: 12,
      borderWidth: 1, borderColor: colors.border,
    },
    nodeDot: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    nodeTypeLabel: { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
    nodeName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    nodeMeta: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    connBadge: {
      marginLeft: "auto",
      paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
      backgroundColor: colors.secondary,
    },
    connText: { fontSize: 11, color: colors.mutedForeground },
    clusterCard: {
      backgroundColor: colors.card,
      borderRadius: 10, padding: 16, marginHorizontal: 20, marginBottom: 10,
      borderWidth: 1, borderColor: colors.border,
    },
    clusterName: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 },
    clusterDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 8 },
    clusterStats: { flexDirection: "row", gap: 16 },
    clusterStat: { flexDirection: "row", alignItems: "center", gap: 4 },
    clusterStatText: { fontSize: 11, color: colors.mutedForeground },
    emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 60 },
    emptyText: { fontSize: 14, color: colors.mutedForeground, marginTop: 8 },
    bottomPad: { height: 100 },
  });

  const renderNode = ({ item: node }: { item: GraphNode }) => {
    const color = NODE_COLORS[node.type] ?? NODE_COLORS["Default"]!;
    return (
      <View style={s.nodeCard}>
        <View style={[s.nodeDot, { backgroundColor: color + "22" }]}>
          <Text style={[s.nodeTypeLabel, { color }]}>
            {node.type.slice(0, 3).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.nodeName} numberOfLines={1}>{node.name}</Text>
          <Text style={s.nodeMeta}>{node.type}</Text>
        </View>
        <View style={s.connBadge}>
          <Text style={s.connText}>{node.connections ?? 0}</Text>
        </View>
      </View>
    );
  };

  const renderCluster = ({ item: c }: { item: Community }) => (
    <View style={s.clusterCard}>
      <Text style={s.clusterName}>{c.name}</Text>
      <Text style={s.clusterDesc} numberOfLines={2}>{c.description}</Text>
      <View style={s.clusterStats}>
        <View style={s.clusterStat}>
          <Feather name="circle" size={11} color={colors.mutedForeground} />
          <Text style={s.clusterStatText}>{c.nodeCount} nodes</Text>
        </View>
        <View style={s.clusterStat}>
          <Feather name="tag" size={11} color={colors.mutedForeground} />
          <Text style={s.clusterStatText}>{c.type}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <Text style={s.title}>Knowledge Graph</Text>
        </View>
        {stats && (
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Feather name="share-2" size={11} color={colors.mutedForeground} />
              <Text style={s.statText}>{stats.relationships.toLocaleString()} edges</Text>
            </View>
            <View style={s.statItem}>
              <Feather name="circle" size={11} color={colors.mutedForeground} />
              <Text style={s.statText}>{(stats.compounds + stats.proteins + stats.diseases).toLocaleString()} nodes</Text>
            </View>
          </View>
        )}
      </View>

      {tab === "nodes" && (
        <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
          <View style={s.searchBar}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={s.searchInput}
              placeholder="Search nodes..."
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      )}

      <View style={{ paddingHorizontal: 20 }}>
        <View style={s.tabs}>
          {(["nodes", "clusters"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[s.tabBtn, {
                backgroundColor: tab === t ? colors.primary : colors.secondary,
                borderColor: tab === t ? colors.primary : colors.border,
              }]}
              onPress={() => setTab(t)}
            >
              <Text style={[s.tabText, { color: tab === t ? colors.primaryForeground : colors.mutedForeground }]}>
                {t === "nodes" ? "Nodes" : "Clusters"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === "nodes" && (
        <>
          <FlatList
            data={[undefined]}
            renderItem={() => (
              <FlatList
                horizontal
                data={NODE_TYPES}
                keyExtractor={(i) => i}
                style={[s.typeFilter, { paddingHorizontal: 20 }]}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item: t }) => (
                  <TouchableOpacity
                    style={[s.typeChip, {
                      backgroundColor: selectedType === t ? (NODE_COLORS[t] ?? colors.primary) + "22" : colors.secondary,
                      borderColor: selectedType === t ? (NODE_COLORS[t] ?? colors.primary) : colors.border,
                    }]}
                    onPress={() => setSelectedType(t)}
                  >
                    <Text style={[s.typeText, { color: selectedType === t ? (NODE_COLORS[t] ?? colors.primary) : colors.mutedForeground }]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
            keyExtractor={() => "header"}
          />
          <FlatList
            data={filteredNodes}
            renderItem={renderNode}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!!filteredNodes.length}
            ListEmptyComponent={
              nodesLoading ? (
                <View style={s.emptyContainer}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={s.emptyText}>Loading graph...</Text>
                </View>
              ) : (
                <View style={s.emptyContainer}>
                  <Feather name="share-2" size={36} color={colors.mutedForeground} />
                  <Text style={s.emptyText}>No nodes — seed demo data first</Text>
                </View>
              )
            }
            ListFooterComponent={<View style={s.bottomPad} />}
          />
        </>
      )}

      {tab === "clusters" && (
        <FlatList
          data={communities ?? []}
          renderItem={renderCluster}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!(communities ?? []).length}
          ListEmptyComponent={
            clustersLoading ? (
              <View style={s.emptyContainer}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <View style={s.emptyContainer}>
                <Feather name="grid" size={36} color={colors.mutedForeground} />
                <Text style={s.emptyText}>No clusters detected yet</Text>
              </View>
            )
          }
          ListFooterComponent={<View style={s.bottomPad} />}
        />
      )}
    </View>
  );
}
