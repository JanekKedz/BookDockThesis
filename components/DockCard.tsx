import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { DockingSpot } from "../types"; // Adjust path if needed

type Props = {
    spot: DockingSpot;
    onPress: () => void;
};

export default function DockCard({ spot, onPress }: Props) {
    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={styles.imagePlaceholder}>
                    <Image
                        source={require("../assets/boat1.png")} // Replace or make dynamic later
                        style={styles.image}
                    />
                </View>
                <View style={styles.info}>
                    <Text style={styles.title}>{spot.name}</Text>
                    <Text style={styles.address}>{spot.location}</Text>
                </View>
            </View>
            <View style={styles.bottomRow}>
                <Text style={styles.price}>{spot.pricePerNight} PLN</Text>
                <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
                    <Text style={styles.detailsText}>View Details &gt;</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "white",
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        width: "100%",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: "row",
    },
    imagePlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: "#F0F0F0",
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    image: {
        width: 40,
        height: 40,
        resizeMode: "contain",
    },
    info: {
        flex: 1,
    },
    title: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#000",
    },
    address: {
        fontSize: 14,
        color: "#666",
    },
    dates: {
        fontSize: 12,
        color: "#999",
    },
    bottomRow: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    price: {
        fontSize: 18,
        fontWeight: "bold",
        color: "green",
    },
    detailsButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#888",
        borderRadius: 6,
    },
    detailsText: {
        color: "#444",
    },
});
