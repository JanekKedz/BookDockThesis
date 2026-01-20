import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native"; // import React Navigation
import { RootStackParamList } from "../types"; // or correct relative path
import { NativeStackNavigationProp } from "@react-navigation/native-stack";


export default function WelcomeScreen() {
  type WelcomeScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Welcome"
  >;

  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to</Text>
      <Text style={styles.titleBold}>Book&Dock!</Text>
      <Text style={styles.subtitle}>Best way to sail off to a new journey</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.outlinedButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.outlinedButtonText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.blackButton}
          onPress={() => navigation.navigate("SignIn")}
        >
          <Text style={styles.blackButtonText}>Sign in</Text>
        </TouchableOpacity>

      </View>
      <Image
        source={require("../assets/boat1.png")}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", padding: 20 },
  title: { fontSize: 32, color: "black" },
  titleBold: { fontSize: 32, fontWeight: "bold", color: "black" },
  subtitle: { fontSize: 16, color: "gray", textAlign: "center", marginTop: 10 },
  buttonContainer: { marginTop: 30 },
  blackButton: { backgroundColor: "#2960B2", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 5, marginTop: 10, width: 200, alignItems: "center" },
  blackButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  outlinedButton: { borderWidth: 1, borderColor: "#2960B2", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 5, width: 200, alignItems: "center"},
  outlinedButtonText: { color: "black", fontSize: 16, fontWeight: "bold" },
  image: {
    width: 200, // Adjust the width of the image
    height: 150, // Adjust the height of the image
    marginBottom: 20, // Add spacing below the image
    resizeMode: "contain", // Ensure the image scales properly
  },
});