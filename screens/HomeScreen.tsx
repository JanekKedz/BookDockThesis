import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import Header from "../components/Header";
import { useEffect, useState, useCallback } from "react";
import { Port, RootStackParamList } from "../types";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { useAuth } from "../context/AuthContext";
import PortCard from "../components/PortCard";
import { EXPO_PUBLIC_AZURE } from "@env";

const BACKEND_URL = EXPO_PUBLIC_AZURE;

type Props = CompositeScreenProps<
  DrawerScreenProps<RootStackParamList, "Home">,
  NativeStackScreenProps<RootStackParamList, "Home">
>;

export default function HomeScreen({ navigation, route }: Props) {

  const [ports, setPorts] = useState<Port[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(route.params?.searchQuery || "");
  const { user } = useAuth();

  useEffect(() => {
    if (route.params?.searchQuery !== undefined) {
      setSearchQuery(route.params.searchQuery);
    }
  }, [route.params?.searchQuery]);

  const filteredPorts = ports.filter(port =>
        port.approved && // Filter by approved ports
        ((port.location?.toLowerCase() || "").includes(searchQuery.toLowerCase())
        || (port.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
        || (port.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
      );

  const fetchPorts = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${BACKEND_URL}/ports`);
      const data = await res.json();
      setPorts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch ports:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPorts();
    }, [])
  );

  useEffect(() => {
    if (!user) {
      navigation.replace("SignIn");
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <Header title="Book&Dock" showBackButton={false} showButtons={true} searchQuery={searchQuery} />

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, location, description..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* DOCKING SPOTS LIST */}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchPorts} />
        }
      >
        {filteredPorts.length > 0 ? (
          filteredPorts.map((port) => (
            <PortCard
              key={port.id}
              port={port}
              onPress={() => {
                const now = new Date();
                const tomorrow = new Date();
                tomorrow.setDate(now.getDate() + 1);
                
                navigation.navigate("PortDetails", { 
                  portId: port.id,
                  fromDate: now,
                  toDate: tomorrow, 
                });
              }}
            />
          ))
        ) : (
          <>
            <Text style={styles.placeholderText}>There are currently no ports</Text>
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
    alignItems: "center",
  },
  portCard: {
    backgroundColor: "#F3F3F3",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  searchInput: {
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
    padding: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    marginTop: 5,
  },
  datePickers: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  filterInputContainer: {
    marginRight: 10,
  },
  dateLabel: {
    marginBottom: 5,
    fontSize: 12,
    color: "#555",
  },
  dateButton: {
    backgroundColor: "#EFEFEF",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: "#2960B2",
    padding: 12,
    borderRadius: 8,
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
