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
                const data = await res.json();
                
                // The API returns the structure matching our Guide type (images is string[]),
                // so no transformation of the images array is needed.
                setGuides(data);
                setFilteredGuides(data); 
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
                    placeholder="Search by title"
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