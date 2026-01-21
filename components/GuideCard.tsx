import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Guide } from "../types";

type Props = {
    guide: Guide;
    onPress: () => void;
};

export default function GuideCard({ guide, onPress }: Props) {
    // Determine the image source
    let imageSource = require("../assets/boat1.png");

    if (guide.images && guide.images.length > 0) {
        let imageData = guide.images[0];

        if (typeof imageData === 'string' && imageData.length > 20) {
            // Check if it's already a data URI
            if (imageData.startsWith('data:image')) {
                imageSource = { uri: imageData };
            } else {
                // If it's a raw base64 string without prefix
                imageSource = { uri: `data:image/png;base64,${imageData}` };
            }
        }
    }

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={styles.imagePlaceholder}>
                    <Image
                        source={imageSource}
                        style={styles.image}
                    />
                </View>
                <View style={styles.content}>
                    <Text style={styles.title} numberOfLines={1}>
                        {guide.title}
                    </Text>
                    <Text style={styles.summary} numberOfLines={2}>
                        {guide.content}
                    </Text>
                </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={onPress}>
                <Text style={styles.buttonText}>Read more &gt;</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "white",
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    imagePlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: "#F0F0F0",
        borderRadius: 6,
        marginRight: 10,
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    content: {
        flex: 1,
    },
    title: {
        fontWeight: "bold",
        fontSize: 15,
        marginBottom: 4,
    },
    summary: {
        fontSize: 13,
        color: "#666",
    },
    button: {
        marginTop: 10,
        alignSelf: "flex-start",
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    buttonText: {
        color: "#2960B2",
        fontWeight: "bold",
        fontSize: 14,
    },
});