import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image, RefreshControl } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, DockingSpot } from "../types";
import Header from "../components/Header";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import DockCard from "../components/DockCard";
import { Port, ImageObj } from "../types";
import { EXPO_PUBLIC_AZURE } from "@env";
import Mapbox from "@rnmapbox/maps";

const BACKEND_URL = EXPO_PUBLIC_AZURE;

type Props = NativeStackScreenProps<RootStackParamList, "PortDetails">;

export default function PortDetailsScreen({ route, navigation }: Props) {
    const { portId, fromDate, toDate } = route.params;
    const [port, setPort] = useState<Port | null>(null);
    const [loading, setLoading] = useState(true);

    // Docks state
    const [dockingSpots, setDockingSpots] = useState<DockingSpot[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // Images state
    const [portImages, setPortImages] = useState<ImageObj[]>([]);

    const { user } = useAuth();

    useEffect(() => {
        const fetchPortAndImages = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/ports/${portId}`);
                const data = await res.json();
                setPort(data);

                let images: ImageObj[] = [];
                
                if (Array.isArray(data.imageIds) && data.imageIds.length > 0) {
                     images = data.imageIds.map((item: any, index: number) => {
                        let base64Image = "";

                        // Case 1: item is a JSON string containing base64Image
                        if (typeof item === 'string' && item.trim().startsWith('{')) {
                            try {
                                const jsonString = item.replace(/'/g, '"');
                                const parsed = JSON.parse(jsonString);
                                if (parsed.base64Image) {
                                    base64Image = parsed.base64Image;
                                }
                            } catch (e) {
                                console.log("Error parsing image JSON string:", e);
                            }
                        } 
                        // Case 2: item is the base64 string directly
                        else if (typeof item === 'string' && item.length > 100) {
                            base64Image = item;
                        }

                        return {
                            id: index,
                            base64Image: base64Image
                        };
                     }).filter((img: ImageObj) => img.base64Image !== "");
                }

                setPortImages(images);
            } catch (err) {
                console.error("Error fetching port details or images:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPortAndImages();
    }, [portId]);

    // Fetch docking spots for this port
    const fetchSpots = useCallback(async () => {
        try {
            setRefreshing(true);
            const res = await fetch(`${BACKEND_URL}/docking-spots`);
            const data = await res.json();
            setDockingSpots(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch docking spots:", err);
        } finally {
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchSpots();
        }, [fetchSpots])
    );

    useEffect(() => {
        if (!user) {
            navigation.replace("SignIn");
        }
    }, [user]);

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" />;
    }

    if (!port) {
        return <Text style={{ padding: 20 }}>Port not found.</Text>;
    }

    const filteredSpots = dockingSpots.filter(
        spot => spot.portId === port.id
    );

    const isOwner = user && user.id === port.ownerId;

    return (
        <View style={{ flex: 1 }}>
            <Header title="Port Details" showBackButton={true} showButtons={false} />
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchSpots} />
                }
            >
                {/* Port Info */}
                <View style={styles.section}>
                    <Text style={styles.title}>{port.name}</Text>
                    <Text style={styles.subtitle}>Location: {port.location}</Text>
                    <Text style={styles.subtitle}>{port.latitude}, {port.longitude}</Text>
                </View>
                {/* Images */}
                <View style={styles.section}>
                    <Text style={styles.heading}>Images</Text>
                    <ScrollView horizontal style={styles.imageRow} showsHorizontalScrollIndicator={false}>
                        {portImages.length > 0 ? (
                            portImages.map((img) => (
                                <Image
                                    key={img.id}
                                    source={{ uri: `data:image/png;base64,${img.base64Image}` }}
                                    style={styles.imageThumb}
                                    resizeMode="cover"
                                />
                            ))
                        ) : (
                            <View style={styles.noImagesContainer}>
                                <Text style={styles.text}>No images available.</Text>
                                <Image
                                    source={require("../assets/boat1.png")}
                                    style={styles.imageThumb}
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                    </ScrollView>
                </View>
                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.heading}>Description</Text>
                    <Text style={styles.text}>{port.description}</Text>
                </View>
                {/* Approval Status */}
                <View style={styles.sectionRow}>
                    <View style={styles.box}>
                        <Text style={styles.heading}>Approval Status</Text>
                        <Text style={styles.text}>{port.approved ? "Approved" : "Pending"}</Text>
                    </View>
                </View>

                {/* Map */}
                    {(port.latitude !== undefined && port.latitude !== null) && (port.longitude !== undefined && port.longitude !== null) && (
                        <View style={styles.mapContainer}>
                            <Mapbox.MapView
                                style={styles.map}
                                zoomEnabled={true}
                                scrollEnabled={true}
                            >
                                <Mapbox.Camera
                                    zoomLevel={11}
                                    centerCoordinate={[port.longitude, port.latitude]}
                                    animationDuration={0}
                                />
                                <Mapbox.PointAnnotation
                                    id={port.id.toString()}
                                    coordinate={[port.longitude, port.latitude]}
                                />
                            </Mapbox.MapView>
                        </View>
                    )}

                {/* Docks in this port */}
                <View style={styles.section}>
                    <Text style={styles.heading}>Docks in this Port</Text>
                    {/* Add New Dock Button for Owner */}
                    {isOwner && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => navigation.navigate("AddDockScreen", { portId: port.id })}
                        >
                            <Text style={styles.addButtonText}>+ Add New Dock</Text>
                        </TouchableOpacity>
                    )}

                    {filteredSpots.length > 0 ? (
                        filteredSpots.map(spot => (
                            <DockCard
                                key={spot.id}
                                spot={spot}
                                onPress={() =>
                                    navigation.navigate("DockDetails", {
                                        dockId: spot.id,
                                        fromDate: fromDate,
                                        toDate: toDate,
                                        price: spot.pricePerNight,
                                    })
                                }
                            />
                        ))
                    ) : (
                        <Text style={styles.text}>No docks available for this port.</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );

}

const styles = StyleSheet.create({
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
        marginBottom: 16,
        marginTop: 8,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    container: {
        backgroundColor: "#fff",
        padding: 16,
    },
    section: {
        marginBottom: 16,
    },
    sectionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    box: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
        color: "#555",
    },
    heading: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 4,
    },
    text: {
        fontSize: 15,
        color: "#333",
        marginBottom: 8,
    },
    imageRow: {
        flexDirection: "row",
        marginBottom: 16,
    },
    imageThumb: {
        width: 150,
        height: 110,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: "#eee",
    },
    noImagesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mapContainer: {
        height: 250,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
    },
    map: {
        flex: 1,
    },
});