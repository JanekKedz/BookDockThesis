import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = process.env.EXPO_PUBLIC_AZURE;

const ProfileViewScreen = () => {
  const [isEditing, setIsEditing] = useState(false); // Toggle between view and edit modes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track unsaved changes
  const [profileDetails, setProfileDetails] = useState<ProfileDetails>({}); // Main profile details state
  const [editingProfileDetails, setEditingProfileDetails] = useState<ProfileDetails>({}); // Temporary state for editing

  const { email } = useAuth(); // Get the email from AuthContext
  const [loading, setLoading] = useState(false); // Track loading state

  // interface for profile details
  interface ProfileDetails {
    email?: string;
    name?: string;
    surname?: string;
    phoneNumber?: string;
    username?: string;
    role?: string;
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/users`, {
          method: "GET",
          headers: {
            "Authorization": email, 
          },
        });

        console.log("Response Status:", response.status); // Log the response status
        if (!response.ok) {
          const errorData = await response.text(); // Use text() to capture non-JSON error responses
          console.log("Error Response:", errorData);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: ProfileDetails = await response.json();
        console.log("Fetched Data:", data); // Log the fetched data
        setProfileDetails(data);
      } catch (error) {
        console.error("Fetch Error:", error);
        Alert.alert("Error", "An error occurred while fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchUserData();
    }
  }, [email]);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2960B2" />
      </View>
    );
  }

  if (!profileDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No profile data found.</Text>
      </View>
    );
  }

  // Handle input changes in the temporary state
  const handleInputChange = (field: keyof ProfileDetails, value: string) => {
    setHasUnsavedChanges(true); // Mark as having unsaved changes
    setEditingProfileDetails((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    setLoading(true); // Show loading indicator
    try {
      const requestBody = {
        user: editingProfileDetails,
      };

      const response = await fetch(`${BACKEND_URL}/users`, {
        method: "PUT",
        headers: {
          "Authorization": email, // Pass the email as the Authorization header
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        if (editingProfileDetails) {
          setProfileDetails(editingProfileDetails); // Save to the main state only if changes exist
        }
        setIsEditing(false);
        setHasUnsavedChanges(false); // Reset unsaved changes
      } else {
        console.log("Response Error:", response.status, response.statusText);
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to update profile.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while saving changes.");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const handleCancelEditing = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setEditingProfileDetails(profileDetails); // Reset to the original data
              setIsEditing(false);
              setHasUnsavedChanges(false); // Reset unsaved changes
            },
          },
        ]
      );
    } else {
      setEditingProfileDetails(profileDetails); // Reset to the original data
      setIsEditing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Header title="My Profile" showBackButton showButtons={false}/>

      <View style={styles.form}>
        {/* Username */}
        <Text style={styles.label}>Username</Text>
        <Text style={styles.text}>{profileDetails.username}</Text>


        {/* First Name */}
        <Text style={styles.label}>First name</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editingProfileDetails.name}
            onChangeText={(value) => handleInputChange("name", value)}
          />
        ) : (
          <Text style={styles.text}>{profileDetails.name}</Text>
        )}

        {/* Last Name */}
        <Text style={styles.label}>Last Name</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editingProfileDetails.surname}
            onChangeText={(value) => handleInputChange("surname", value)}
          />
        ) : (
          <Text style={styles.text}>{profileDetails.surname}</Text>
        )}

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <Text style={styles.text}>{profileDetails.email}</Text>

        {/* Role */}
        <Text style={styles.label}>Role</Text>
        <Text style={styles.text}>{profileDetails.role}</Text>
      

        {/* Phone Number */}
        <Text style={styles.label}>Phone number</Text>
        <Text style={styles.text}>{profileDetails.phoneNumber}</Text>
        

        {/* Buttons */}
        {isEditing ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEditing}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setEditingProfileDetails(profileDetails); // Load the current data into the editing state
              setIsEditing(true);
            }}
          >
            <Text style={styles.editButtonText}>Edit Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default ProfileViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  profilePicContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profilePic: {
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#444",
    marginTop: 10,
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  form: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 10,
    padding: 20,
    elevation: 2,
  },
  input: {
    backgroundColor: "#F1F1F1",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#2960B2",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#F44336",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#2960B2",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});