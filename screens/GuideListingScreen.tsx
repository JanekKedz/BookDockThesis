import React, { useEffect, useState } from "react";
import { View, TextInput, StyleSheet, ScrollView, Text } from "react-native";
import Header from "../components/Header";
import GuideCard from "../components/GuideCard";
import { Guide, RootStackParamList } from "../types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { EXPO_PUBLIC_AZURE } from "@env";

const BACKEND_URL = EXPO_PUBLIC_AZURE;

type Props = NativeStackScreenProps<RootStackParamList, "GuideListings">;

export default function GuideListingsScreen({ navigation }: Props) {
    const [guides, setGuides] = useState<Guide[]>([]);
    const [searchQuery, setSearchQuery] = useState(""); // State for search input
    const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);

    useEffect(() => {
        const fetchGuides = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/guides/approved`);
                const guidesData = await res.json();

                const guidesWithImages: Guide[] = [];

                for (const guide of guidesData) {
                    let finalImages: string[] = [];
                    // Assume guide.images is a list of image IDs (strings)
                    const imageIds = guide.images;

                    if (Array.isArray(imageIds)) {
                        for (const imageId of imageIds) {
                            try {
                                const imgRes = await fetch(`${BACKEND_URL}/images/${imageId}`);
                                if (imgRes.ok) {
                                    const imgData = await imgRes.json();
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
                                console.error(`Failed to fetch image ${imageId} for guide ${guide.id}:`, imgErr);
                            }
                        }
                    }

                    guidesWithImages.push({ ...guide, images: finalImages });
                }
                
                setGuides(guidesWithImages);
                setFilteredGuides(guidesWithImages);

            } catch (err) {
                console.error("Failed to fetch guides:", err);
            }
        };

        fetchGuides();
    }, []);

    useEffect(() => {
        // Filter guides based on the search query
        const filtered = guides.filter((guide) => {
            const query = searchQuery.toLowerCase();
             return (
                        (guide.title?.toLowerCase() ?? '').includes(query) ||
                        (guide.content?.toLowerCase() ?? '').includes(query) ||
                        (guide.guideStatus?.toLowerCase() ?? '').includes(query) ||
                        (guide.guideCategory?.toLowerCase() ?? '').includes(query)
                    );
        });

        setFilteredGuides(filtered);
    }, [searchQuery, guides]);

    const handleGuidePress = (guideId: number) => {
        navigation.navigate("GuideDetailsScreen", { guideId: guideId });
    };

    return (
        <View style={styles.container}>
            <Header title="Guides" showBackButton showButtons={false} />
            <View style={styles.searchSection}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by title, content"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {Array.isArray(filteredGuides) && filteredGuides.length > 0 ? (
                    filteredGuides.map((guide) => (
                        <GuideCard
                            key={guide.id}
                            guide={guide}
                            onPress={() => handleGuidePress(guide.id)}
                        />
                    ))
                ) : (
                    <Text style={styles.placeholderText}>No guides found</Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
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
    content: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    placeholderText: {
        textAlign: "center",
        color: "#888",
        marginTop: 40,
        fontSize: 16,
    },
});
