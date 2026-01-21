import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Alert, Linking, TouchableOpacity } from "react-native";
import Header from "../components/Header";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Guide, RootStackParamList } from "../types";
import { EXPO_PUBLIC_AZURE } from "@env";

const BACKEND_URL = EXPO_PUBLIC_AZURE;
type Props = NativeStackScreenProps<RootStackParamList, "GuideDetailsScreen">;

export default function GuideDetailsScreen({ route }: Props) {
    const { guideId } = route.params; // Get the guideId from the route params
    const [guide, setGuide] = useState<Guide | null>(null);

    useEffect(() => {
        const fetchGuideDetails = async () => {
            try {
                // 1. Fetch Guide Basic Details
                const res = await fetch(`${BACKEND_URL}/guides/${guideId}`);
                const guideData = await res.json();

                // 2. Fetch and Process Images
                // The guideData.images field contains a list of image IDs (strings)
                let finalImages: string[] = [];
                const imageIds = guideData.images;

                if (imageIds && Array.isArray(imageIds)) {
                    for (const imageId of imageIds) {
                        try {
                            const imgRes = await fetch(`${BACKEND_URL}/images/${imageId}`);
                            if (imgRes.ok) {
                                const imgData = await imgRes.json();
                                // The endpoint returns a single image object
                                const items = Array.isArray(imgData) ? imgData : [imgData];

                                for (const item of items) {
                                    // 1. Get raw b64 from item
                                    let raw_b64 = item?.base64image || item?.base64Image;
                                    
                                    // Fallback if item itself is string
                                    if (!raw_b64 && typeof item === 'string') {
                                         raw_b64 = item;
                                    }

                                    if (raw_b64) {
                                        let base64_data = raw_b64;
                                        try {
                                            // Try parsing as nested JSON (if stringified)
                                            const nested = JSON.parse(raw_b64);
                                            
                                            if (nested && typeof nested === 'object') {
                                                base64_data = nested.base64image || nested.base64Image || null;
                                            } else {
                                                base64_data = null;
                                            }
                                        } catch (e) {
                                             // It's likely already a base64 string
                                        }

                                        if (base64_data) {
                                             if (!base64_data.startsWith("data:image")) {
                                                 base64_data = `data:image/png;base64,${base64_data}`;
                                             }
                                             finalImages.push(base64_data);
                                        }
                                    }
                                }
                            }
                        } catch (imgErr) {
                            console.error(`Failed to fetch image ${imageId}:`, imgErr);
                        }
                    }
                }

                // 3. Update State
                setGuide({ ...guideData, images: finalImages });

            } catch (err) {
                Alert.alert("Failed to fetch guide details:", String(err));
            }
        };

        fetchGuideDetails();
    }, [guideId]);

    if (!guide) {
        return (
            <View style={styles.container}>
                <Header title="Guide Details" showBackButton={true} />
                <Text style={styles.placeholderText}>Loading guide details...</Text>
            </View>
        );
    }

    // Since images are already processed and normalized in the useEffect,
    // we can directly use the first image if available.
    const imageSource = (guide.images && guide.images.length > 0) 
        ? { uri: guide.images[0] } 
        : null;

    const handleLinkPress = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    return (
        <View style={styles.container}>
            <Header title="Guide Details" showBackButton={true} />
            <ScrollView contentContainerStyle={styles.content}>
                {/* Guide Image */}
                {imageSource && (
                    <Image source={imageSource} style={styles.image} />
                )}

                {/* Guide Title */}
                <Text style={styles.title}>{guide.title}</Text>

                {/* Guide Content */}
                <Text style={styles.contentText}>{guide.content}</Text>

                {/* Guide Links */}
                {guide.links && guide.links.length > 0 && (
                    <View style={styles.linksContainer}>
                        <Text style={styles.sectionHeader}>Links:</Text>
                        {guide.links.map((link, index) => (
                            <TouchableOpacity key={index} onPress={() => handleLinkPress(link)}>
                                <Text style={styles.linkText}>{link}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Additional Information */}
                <View style={styles.metaContainer}>
                    <Text style={styles.infoText}>Author ID: {guide.authorId}</Text>
                    <Text style={styles.infoText}>
                        Published on: {new Date(guide.publicationDate).toLocaleDateString()}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    content: {
        padding: 20,
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        marginBottom: 20,
        resizeMode: "cover",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    contentText: {
        fontSize: 16,
        color: "#555",
        lineHeight: 24,
        marginBottom: 20,
    },
    linksContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: "#F9F9F9",
        borderRadius: 8,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#333",
    },
    linkText: {
        fontSize: 15,
        color: "#2960B2",
        marginBottom: 5,
        textDecorationLine: "underline",
    },
    metaContainer: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#EEE",
    },
    infoText: {
        fontSize: 14,
        color: "#888",
        marginBottom: 5,
    },
    placeholderText: {
        textAlign: "center",
        color: "#888",
        marginTop: 40,
        fontSize: 16,
    },
});
