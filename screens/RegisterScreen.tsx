
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types"; // or correct relative path
import { useAuth } from "../context/AuthContext";
import { EXPO_PUBLIC_AZURE } from "@env";

const BACKEND_URL = EXPO_PUBLIC_AZURE;

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setInputEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { setEmail } = useAuth();


  const handleSelectUserType = (type: string) => {
    setUserType(type);
    setDropdownVisible(false);
  };

  const handleRegister = async () => {
    if (!name || !surname || !email || !username || !phoneNumber || !password || !userType) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const requestBody = {
      user: {
        email,
        name,
        surname,
        phoneNumber,
        username,
        role: userType,
        password,
      },
    };

    try {
      const response = await fetch(`${BACKEND_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        Alert.alert("Success", "Registration successful!");
        setEmail(email); // save email in context
        navigation.replace("Home");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Registration failed.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", "An error occurred. Please try again. " + errorMessage);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.container}>
      <Text style={styles.header}>Register</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Value"
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.label}>Surname</Text>
        <TextInput
          style={styles.input}
          placeholder="Value"
          value={surname}
          onChangeText={setSurname}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Value"
          value={email}
          onChangeText={setInputEmail}
        />
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Value"
          value={username}
          onChangeText={setUsername}
        />
        <Text style={styles.label}>User Type</Text>
        {/* Custom Dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={styles.dropdownText}>
            {userType ? userType : "Select User Type"}
          </Text>
        </TouchableOpacity>
        {dropdownVisible && (
          <View style={styles.dropdownOptions}>

            <TouchableOpacity
              style={styles.dropdownOption}
              onPress={() => handleSelectUserType("SAILOR")}
            >
              <Text style={styles.dropdownOptionText}>Sailor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownOption}
              onPress={() => handleSelectUserType("DOCK_OWNER")}
            >
              <Text style={styles.dropdownOptionText}>Dock Owner</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.label}>Phone number</Text>
        <TextInput
          style={styles.input}
          placeholder="+48"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Value"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.blackButton} onPress={handleRegister}>
          <Text style={styles.blackButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.footerText}>Already have an account?</Text>
      <TouchableOpacity
        style={styles.outlinedButton}
        onPress={() => navigation.replace("SignIn")}
      >
        <Text style={styles.outlinedButtonText}>Sign in</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9", // Light background for better contrast
    paddingVertical: 20,
    paddingBottom: 50, // Extra padding at the bottom for better spacing
  },
  container: {
    width: "100%", // Full width to center the form
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000", 
    marginBottom: 20,
    textAlign: "center",
  },
  uploadText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#2960B2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  inputContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F3F3F3",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 16,
    color: "#333",
  },
  dropdown: {
    backgroundColor: "#F3F3F3",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownOptions: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: -5,
    marginBottom: 15,
    overflow: "hidden",
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#333",
  },
  blackButton: {
    backgroundColor: "#2960B2",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  blackButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  outlinedButton: {
    borderWidth: 1,
    borderColor: "#2960B2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  outlinedButtonText: {
    color: "#2960B2",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerText: {
    marginTop: 10,
    marginBottom: 10,
    color: "#555",
    fontSize: 14,
    textAlign: "center",
  },
});