import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Image } from "react-native";
import Header from "../components/Header";
import PortCard from "../components/PortCard.tsx";
import { Port } from "../types";
import { useAuth } from "../context/AuthContext";
import { EXPO_PUBLIC_AZURE } from "@env";

const BACKEND_URL = EXPO_PUBLIC_AZURE;

export default function DockOwnerScreen({ navigation }: any) {
  const [ports, setPorts] = useState<Port[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchPorts = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${BACKEND_URL}/ports/owners/${user?.id}`);
      const data = await res.json();
      setPorts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch ports:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPorts();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Header title="My Ports" showBackButton showButtons={false} />

      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddPortScreen")}
        >
          <Text style={styles.addButtonText}>+ Add New Port</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchPorts} />
        }
      >
        {ports.length > 0 ? (
          ports.map((port) => (
            <PortCard
              key={port.id}
              port={port}
              onPress={() => navigation.navigate("PortDetails", { portId: port.id })}
            />
          ))
        ) : (
          <>
            <Text style={styles.placeholderText}>You have no ports yet.</Text>
            <Image
              source={require("../assets/boat1.png")}
              style={styles.image}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 10,
    gap: 10,
  },
  addButton: {
    backgroundColor: "#2960B2",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2960B2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 150,
    marginBottom: 20,
    resizeMode: "contain",
  },
  placeholderText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
});