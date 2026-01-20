import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";


interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showButtons?: boolean;
  searchQuery?: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = false, showButtons = true, searchQuery, onBack }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  const handleMapNavigation = () => {
    if (route.name === "Map") return;
    navigation.navigate("Map" as never, { searchQuery } as never);
  };
  const handleProfileNavigation = () => {
    if (route.name === "ProfileView") return;
    navigation.navigate("ProfileView" as never);
  };

  const handleGuideListingsNavigation = () => {
    if (route.name === "GuideListings") return;
    navigation.navigate("GuideListings" as never);
  };

  const handleBookingListingsNavigation = () => {
    if (route.name === "BookingListings") return;
    navigation.navigate("BookingListings" as never);
  };

  const handleDockOwnerNavigation = () => {
    if (route.name === "DockOwnerScreen") return;
    navigation.navigate("DockOwnerScreen" as never);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  }

  return (
    
    <View style={styles.header}>
      {showBackButton ? (
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text><Ionicons name="arrow-back" size={24} color="white" /></Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      <Text style={styles.headerTitle}>{title}</Text>

      <View style={styles.iconsRight}>
        {showBackButton ? (
          <View style={styles.placeholder} />
        ) : (
          <View style={{ width: 24 }} /> // Placeholder for alignment
  )}
        {showButtons ? (
          <>
            {/* Show this only if user is DOCK_OWNER */}
             {user?.role === "DOCK_OWNER" && (
            <TouchableOpacity onPress={handleDockOwnerNavigation} style={{ marginRight: 15 }}>
              <Ionicons name="boat-outline" size={26} color="white" />
            </TouchableOpacity>
          )}
            <TouchableOpacity onPress={handleMapNavigation} style={{ marginRight: 15 }}>
              <Text><Ionicons name="map" size={26} color="white" /></Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGuideListingsNavigation} style={{ marginRight: 15 }}>
              <Text><Ionicons name="book-outline" size={26} color="white" /></Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleBookingListingsNavigation} style={{ marginRight: 15 }}>
              <Text><Ionicons name="bookmark-outline" size={26} color="white" /></Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleProfileNavigation}>
              <Text><Ionicons name="person-circle-outline" size={26} color="white" /></Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </View>
  );

};

export default Header;

const styles = StyleSheet.create({
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#2960B2",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    marginRight: 10,
  },
  placeholder: {
    width: 24,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "left",
  },
  iconsRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
