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

        // If it's a string that looks like a JSON object (starts with '{'), try to parse it
        if (typeof imageData === 'string' && imageData.trim().startsWith('{')) {
            try {
                // Replace single quotes with double quotes if necessary to make it valid JSON
                // (Handling potential formatting issues from the backend)
                const jsonString = imageData.replace(/'/g, '"');
                const parsed = JSON.parse(jsonString);
                if (parsed.base64Image) {
                    imageData = parsed.base64Image;
                }
            } catch (e) {
                console.log("Error parsing image JSON string:", e);
            }
        }

        // If we have a base64 string (either raw or extracted)
        if (typeof imageData === 'string' && imageData.length > 100) { // Simple check to ensure it's not empty or just "{"
            imageSource = { uri: `data:image/png;base64,${imageData}` };
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