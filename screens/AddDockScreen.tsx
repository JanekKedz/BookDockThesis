import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";
import { EXPO_PUBLIC_AZURE } from "@env";

const BACKEND_URL = EXPO_PUBLIC_AZURE;

export default function AddDockScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const portId = route?.params?.portId;
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState("");
  const [servicesPricing, setServicesPricing] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [pricePerPerson, setPricePerPerson] = useState("");

  const handleAddDock = async () => {
    if (!name || !location || !description || !portId || !services || !servicesPricing || !pricePerNight || !pricePerPerson) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const dock = {
      name,
      location,
      description,
      ownerId: user?.id,
      portId: Number(portId),
      services,
      servicesPricing: Number(servicesPricing),
      pricePerNight: Number(pricePerNight),
      pricePerPerson: Number(pricePerPerson),
    };

    try {
      const response = await fetch(`${BACKEND_URL}/docking-spots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dock),
      });
      if (response.ok) {
        Alert.alert("Success", "Dock added successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", "Failed to add dock.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not add dock.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add New Dock</Text>
      <TextInput
        style={styles.input}
        placeholder="Dock Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Services (comma separated)"
        value={services}
        onChangeText={setServices}
      />
      <TextInput
        style={styles.input}
        placeholder="Services Price Per Night"
        value={servicesPricing}
        onChangeText={setServicesPricing}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Mooring Price Per Night (Base)"
        value={pricePerNight}
        onChangeText={setPricePerNight}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Crew Price Per Person, Per Night (Optional)"
        value={pricePerPerson}
        onChangeText={setPricePerPerson}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleAddDock}>
        <Text style={styles.buttonText}>Add Dock</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#f5f8ff",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2960B2",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  button: {
    backgroundColor: "#2960B2",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});