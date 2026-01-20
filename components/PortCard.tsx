import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Port } from "../types";

type Props = {
  port: Port;
  onPress: () => void;
};

export default function PortCard({ port, onPress }: Props) {
  // Determine the image source
  let imageSource = require("../assets/boat1.png");

  if (port.imageIds && port.imageIds.length > 0) {
    let imageData = port.imageIds[0];

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
        <View style={styles.info}>
          <Text style={styles.title}>{port.name}</Text>
          <Text style={styles.address}>{port.location}</Text>
          <Text numberOfLines={2} style={styles.description}>{port.description}</Text>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.status}>
          {port.approved ? "Approved" : "Pending"}
        </Text>
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
    overflow: "hidden", // Added to ensure image stays within bounds
  },
  image: {
    width: "100%", // Changed to fill container
    height: "100%", // Changed to fill container
    resizeMode: "cover", // Changed to cover
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
  description: {
    fontSize: 13,
    color: "#444",
    marginTop: 2,
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2960B2",
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