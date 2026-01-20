import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { EXPO_PUBLIC_AZURE } from "@env";

const BACKEND_URL = EXPO_PUBLIC_AZURE;

type Props = NativeStackScreenProps<RootStackParamList, "SignIn">;

export default function SignInScreen({ navigation }: Props) {
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const { setUser, setEmail } = useAuth();

const handleSignIn = async () => {
  if (!inputEmail || !inputPassword) {
    Alert.alert("Error", "Please enter your email and password.");
    return;
  }
  try {
    const response = await fetch(`${BACKEND_URL}/users`, {
      method: "GET",
      headers: {
        "Authorization": inputEmail,
        "password": inputPassword,
      },
    });
    if (!response.ok) {
      Alert.alert("Login failed", response.statusText);
      return;
    }
    const data = await response.json();
    // Compare email and password with backend data
    //console.log("url: " , BACKEND_URL); // Debugging line
    if (response.ok) {
      setUser({ email: data.email, role: data.role, id: data.id });
      setEmail(data.email);
      navigation.replace("Home");
    } else {
      Alert.alert("Login failed", "Email or password is incorrect.");
    }
  } catch (error) {
    Alert.alert("Error", "Could not sign in. Please try again. url: " + BACKEND_URL);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sign In</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={inputEmail}
          onChangeText={setInputEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={inputPassword}
          onChangeText={setInputPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.blackButton} onPress={handleSignIn}>
          <Text style={styles.blackButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.footerText}>Don’t have an account yet?</Text>
      <TouchableOpacity
        style={styles.outlinedButton}
        onPress={() => navigation.replace("Register")}
      >
        <Text style={styles.outlinedButtonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9F9F9", padding: 20 },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000", 
    marginBottom: 20,
    textAlign: "center",
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
    marginTop: 20,
    marginBottom: 10,
    color: "#555",
    fontSize: 14,
    textAlign: "center",
  },
});