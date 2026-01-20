import React, { useCallback, useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Image, TextInput, Alert, Platform, PermissionsAndroid, Linking } from "react-native";
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import Header from "../components/Header";
import PortCard from "../components/PortCard.tsx";
import { Port } from "../types";
import { useAuth } from "../context/AuthContext";
import { EXPO_PUBLIC_AZURE } from "@env";

const BACKEND_URL = EXPO_PUBLIC_AZURE;

export default function AddPortScreen({ navigation }: any) {
  const [ports, setPorts] = useState<Port[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);

  const fetchPorts = async () => {
    try {
      setRefreshing(true);
      // Fixed URL: removed 's' and caret typo
      const res = await fetch(`${BACKEND_URL}/ports/owners/${user?.id}`);
      const data = await res.json();
      setPorts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch ports:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPorts();
    }, [])
  );

  const requestStoragePermission = async () => {
    if (Platform.OS !== "android") return true;

    // For Android 13+ (API 33+)
    if (Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        );
        
        console.log("Permission Request Result:", granted); // Debug logging

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
           Alert.alert(
             "Permission Required",
             "Photo access has been denied. Please enable it in your device settings to select photos.",
             [
               { text: "Cancel", style: "cancel" },
               { text: "Open Settings", onPress: () => Linking.openSettings() }
             ]
           );
           return false;
        } else {
           Alert.alert("Permission Denied", "We need access to your photos to add port images.");
           return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } 
    
    // For older Android versions
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "Storage Permission Required",
          message: "This app needs access to your storage to upload photos.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      
      console.log("Permission Request Result (Legacy):", granted); // Debug logging

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
         Alert.alert(
           "Permission Required",
           "Storage access has been denied. Please enable it in your device settings.",
           [
             { text: "Cancel", style: "cancel" },
             { text: "Open Settings", onPress: () => Linking.openSettings() }
           ]
         );
         return false;
      } else {
        Alert.alert("Permission Denied", "We need access to your storage to add port images.");
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleSelectImages = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;

    const result = await launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 0,
      includeBase64: true,
      quality: 0.8,
    });

    if (result.errorMessage) {
      Alert.alert("Error", result.errorMessage);
      return;
    }

    if (result.assets) {
      setSelectedImages(result.assets);
    }
  };

  const handleAddPort = async () => {
    if (!name || !location) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    
    // Create a list of JSON strings, where each string contains the base64 image
    const imageIds = selectedImages
        .map(asset => asset.base64)
        .filter((base64): base64 is string => !!base64)
        .map(base64 => JSON.stringify({ base64Image: base64 }));

    try {
      console.log("Sending payload size (images):", imageIds.length); // Debug log size

      const response = await fetch(`${BACKEND_URL}/ports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          location,
          description,
          imageIds, // Sending as a list of strings
          ownerId: user?.id,
          longitude: parseFloat(longitude) || 0,
          latitude: parseFloat(latitude) || 0,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend Error:", response.status, errorText);
        Alert.alert("Error", `Failed to add port: ${response.status} ${response.statusText}`);
        return;
      }

      if (response.ok) {
        Alert.alert("Success", "Port added!");
        setShowForm(false);
        setName("");
        setLocation("");
        setLongitude("");
        setLatitude("");
        setDescription("");
        setSelectedImages([]);
        fetchPorts();
      }
    } catch (err) {
      console.error("Network Error:", err);
      Alert.alert("Error", "Failed to add port due to network error.");
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Add Port" showBackButton showButtons={false} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchPorts} />
        }
      >
        <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm((prev) => !prev)}
        >
            <Text style={styles.addButtonText}>{showForm ? "Cancel" : "+ Add New Port"}</Text>
        </TouchableOpacity>

        {showForm && (
            <View style={[styles.formContainer, { width: '100%' }]}>
            <Text style={styles.formLabel}>Port Name*</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter port name"
            />
            <Text style={styles.formLabel}>Location*</Text>
            <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter location"
            />
            <Text style={styles.formLabel}>Longitude</Text>
            <TextInput
                style={styles.input}
                value={longitude}
                onChangeText={setLongitude}
                placeholder="longitude"
                keyboardType="numeric"
            />
            <Text style={styles.formLabel}>Latitude</Text>
            <TextInput
                style={styles.input}
                value={latitude}
                onChangeText={setLatitude}
                placeholder="latitude"
                keyboardType="numeric"
            />
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
                style={[styles.input, { height: 60 }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description"
                multiline
            />
            
            <Text style={styles.formLabel}>Images</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={handleSelectImages}>
                <Text style={styles.imagePickerText}>Select Photos</Text>
            </TouchableOpacity>
            
            <ScrollView horizontal style={styles.imagePreviewContainer}>
                {selectedImages.map((img, index) => (
                <Image 
                    key={index} 
                    source={{ uri: img.uri }} 
                    style={styles.previewImage} 
                />
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.addButton} onPress={handleAddPort}>
                <Text style={styles.addButtonText}>Submit</Text>
            </TouchableOpacity>
            </View>
        )}

        {ports.length > 0 ? (
          ports.map((port) => (
            <PortCard
              key={port.id}
              port={port}
              onPress={() => navigation.navigate("PortDetails", { portId: port.id })}
            />
          ))
        ) : (
          <>
            <Text style={styles.placeholderText}>You have no ports yet.</Text>
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
    marginVertical: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  formContainer: {
    backgroundColor: "#f5f8ff",
    borderRadius: 10,
    padding: 18,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2960B2",
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    marginBottom: 8,
    fontSize: 16,
  },
  imagePickerButton: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  imagePickerText: {
    color: "#333",
    fontWeight: "600",
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 8,
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
