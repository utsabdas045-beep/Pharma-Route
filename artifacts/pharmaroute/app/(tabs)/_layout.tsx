import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : colors.card,
          borderTopWidth: 0,
          borderTopColor: "transparent",
          elevation: 0,
          height: Platform.OS === "web" ? 84 : 80,
          paddingBottom: Platform.OS === "web" ? 34 : 20,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(10,14,26,0.85)" }]}
            />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_500Medium",
          marginTop: -4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Feather name="activity" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discoveries"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => <Feather name="zap" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color }) => <Feather name="upload" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="graph"
        options={{
          title: "Graph",
          tabBarIcon: ({ color }) => <Feather name="share-2" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => <Feather name="file-text" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
