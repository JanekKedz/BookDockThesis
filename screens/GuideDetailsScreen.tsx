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
                const res = await fetch(`${BACKEND_URL}/guides/${guideId}`);
                const data = await res.json();
                setGuide(data);
            } catch (err) {
                Alert.alert("Failed to fetch guide details:", err);
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

    const getImageSource = () => {
        if (!guide.images || guide.images.length === 0) {
            return null;
        }

        let imageData = guide.images[0];

        // If it's a string that looks like a JSON object (starts with '{'), try to parse it
        if (typeof imageData === 'string' && imageData.trim().startsWith('{')) {
            try {
                // Replace single quotes with double quotes if necessary to make it valid JSON
                const jsonString = imageData.replace(/'/g, '"');
                const parsed = JSON.parse(jsonString);
                if (parsed.base64Image) {
                    imageData = parsed.base64Image;
                }
            } catch (e) {
                console.log("Error parsing image JSON string:", e);
            }
        }

        // If we have a base64 string
        if (typeof imageData === 'string' && imageData.length > 100) {
            return { uri: `data:image/png;base64,${imageData}` };
        }
        
        return null;
    };

    const imageSource = getImageSource();

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