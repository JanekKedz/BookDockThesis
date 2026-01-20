import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, TextInput, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, DockingSpot, Booking } from "../types";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { EXPO_PUBLIC_AZURE } from "@env";

const BACKEND_URL = EXPO_PUBLIC_AZURE;

type Props = NativeStackScreenProps<RootStackParamList, "DockDetails">;

export default function DockDetailsScreen({ route, navigation }: Props) {
  const { dockId } = route.params;
  const [spot, setSpot] = useState<DockingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownerDetails, setOwnerDetails] = useState<ProfileDetails>({});
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const { user } = useAuth();

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editSpot, setEditSpot] = useState<DockingSpot | null>(null);

  // Bookings for owner
  const [bookings, setBookings] = useState<Booking[]>([]);

  interface ProfileDetails {
    email?: string;
    name?: string;
    surname?: string;
    phoneNumber?: string;
    username?: string;
    role?: string;
  }

  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/docking-spots/${dockId}`);
        const data = await res.json();
        setSpot(data);
      } catch (err) {
        console.error("Error fetching dock details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpot();
  }, [dockId]);

  useEffect(() => {
    const fetchOwner = async () => {
      if (spot && spot.ownerId) {
        try {
          const res = await fetch(`${BACKEND_URL}/users/users/${spot.ownerId}`);
          const data = await res.json();
          setOwnerDetails(data);
        } catch (err) {
          console.error("Error fetching owner details:", err);
        }
      }
    };
    fetchOwner();
  }, [spot]);

  useEffect(() => {
    if (route.params?.fromDate) setFromDate(new Date(route.params.fromDate));
    if (route.params?.toDate) setToDate(new Date(route.params.toDate));
  }, [route.params]);

  useEffect(() => {
    const fetchBookings = async () => {
        if (user && spot && user.role === "DOCK_OWNER" && user.id === spot.ownerId) {
            try {
                const res = await fetch(`${BACKEND_URL}/bookings/dock/${dockId}`);
                if (res.ok) {
                    const data = await res.json();
                    setBookings(data);
                } else {
                    console.error("Failed to fetch bookings for dock");
                }
            } catch (err) {
                console.error("Error fetching bookings:", err);
            }
        }
    };
    fetchBookings();
  }, [user, spot, dockId]);


  // Handle input changes for editing
  const handleInputChange = (field: keyof DockingSpot, value: string) => {
    setEditSpot((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    if (!editSpot) return;
    try {
      const response = await fetch(`${BACKEND_URL}/docking-spots/${dockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editSpot),
      });
      if (response.ok) {
        setSpot(editSpot);
        setIsEditing(false);
        Alert.alert("Success", "Dock details updated!");
      } else {
        Alert.alert("Error", "Failed to update dock.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not update dock.");
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  if (!spot) {
    return <Text>Docking spot not found.</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <Header title="Dock Details" showBackButton={true} showButtons={false} />
      <ScrollView style={styles.container}>
        {isEditing && editSpot ? (
          <View>
            <Text style={styles.title}>Edit Dock</Text>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={editSpot.name}
              onChangeText={(v) => handleInputChange("name", v)}
            />
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={editSpot.location}
              onChangeText={(v) => handleInputChange("location", v)}
            />
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={editSpot.description}
              onChangeText={(v) => handleInputChange("description", v)}
              multiline
            />
            <Text style={styles.label}>Services</Text>
            <TextInput
              style={styles.input}
              value={editSpot.services}
              onChangeText={(v) => handleInputChange("services", v)}
            />
            <Text style={styles.label}>Services Pricing</Text>
            <TextInput
              style={styles.input}
              value={editSpot.servicesPricing.toString()}
              onChangeText={(v) => handleInputChange("servicesPricing", v)}
              keyboardType="numeric"
            />
            <Text style={styles.label}>Price Per Night</Text>
            <TextInput
              style={styles.input}
              value={editSpot.pricePerNight.toString()}
              onChangeText={(v) => handleInputChange("pricePerNight", v)}
              keyboardType="numeric"
            />
            <Text style={styles.label}>Price Per Person</Text>
            <TextInput
              style={styles.input}
              value={editSpot.pricePerPerson.toString()}
              onChangeText={(v) => handleInputChange("pricePerPerson", v)}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity style={[styles.bookButtonCohesive, { flex: 1, marginRight: 8 }]} onPress={handleSaveChanges}>
                <Text style={styles.bookButtonTextCohesive}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.bookButtonCohesive, { flex: 1, backgroundColor: "#F44336" }]} onPress={() => setIsEditing(false)}>
                <Text style={styles.bookButtonTextCohesive}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Dock Info */}
            <View style={styles.section}>
              <Text style={styles.title}>{spot.name}</Text>
              <Text style={styles.subtitle}>Location: {spot.location}</Text>
            </View>
            {/* Properties */}
            <View style={styles.section}>
              <Text style={styles.heading}>Services</Text>
              <View style={styles.properties}>
                <View>
                  <Text>{spot.services}</Text>
                  <Text>Price: {spot.servicesPricing} PLN/day</Text>
                </View>
              </View>
            </View>
            {/* Contact / Payment */}
            <View style={styles.sectionRow}>
              <View style={styles.box}>
                <Text style={styles.heading}>Contact</Text>
                <Text>{ownerDetails.username || ""}</Text>
                <Text>{[ownerDetails.name, ownerDetails.surname].filter(Boolean).join(" ")}</Text>
                <Text>{ownerDetails.phoneNumber || ""}</Text>
                <Text>{ownerDetails.email || ""}</Text>
              </View>
              <View style={styles.box}>
                <Text style={styles.heading}>Payment Options</Text>
                <Text>• On site (Contact the owner)</Text>
                <Text>• Online </Text>
              </View>
            </View>
            {/* Price + Book */}
            <View style={styles.priceBookContainer}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Price</Text>
                <Text style={styles.priceValue}>{spot.pricePerNight} PLN</Text>
                <Text style={styles.priceSub}>per night, per person</Text>
                <Text style={styles.priceLabel}>+ Services</Text>
                <Text style={styles.priceValue}>{spot.servicesPricing} PLN</Text>
                <Text style={styles.priceSub}>per night</Text>
              </View>
              <TouchableOpacity
                style={styles.bookButtonCohesive}
                onPress={() => {
                  if (fromDate && toDate) {
                    navigation.navigate("BookingDetails", {
                      dockId: spot.id,
                      fromDate: fromDate,
                      toDate: toDate,
                      price: spot.pricePerNight,
                      servicesPricing: spot.servicesPricing,
                    });
                  } else {
                    Alert.alert("Please select both a start and end date.");
                  }
                }}>
                <Text style={styles.bookButtonTextCohesive}>Book now</Text>
              </TouchableOpacity>
            </View>
            {/* Edit Button for Dock Owner */}
            {user?.role === "DOCK_OWNER" && user?.id === spot.ownerId && (
              <View>
                  <TouchableOpacity
                    style={[styles.bookButtonCohesive, { marginTop: 0, backgroundColor: "#FFA500" }]}
                    onPress={() => {
                      setEditSpot(spot);
                      setIsEditing(true);
                    }}
                  >
                    <Text style={[styles.bookButtonTextCohesive, { color: "#fff" }]}>Edit Dock Details</Text>
                  </TouchableOpacity>

                  {/* Display Bookings */}
                  <View style={styles.section}>
                      <Text style={[styles.heading, { marginTop: 20 }]}>Bookings for this Dock</Text>
                      {bookings.length > 0 ? (
                          bookings.map((booking) => (
                              <View key={booking.id} style={styles.bookingCard}>
                                  <Text style={styles.bookingText}>Booking ID: {booking.id}</Text>
                                  <Text style={styles.bookingText}>Dates: {booking.startDate} to {booking.endDate}</Text>
                                  <Text style={styles.bookingText}>People: {booking.people}</Text>
                                  <Text style={styles.bookingText}>Status: {booking.paymentStatus}</Text>
                                  <Text style={styles.bookingText}>Total price: {booking.totalPrice} PLN</Text>
                              </View>
                          ))
                      ) : (
                          <Text style={styles.text}>No bookings yet.</Text>
                      )}
                  </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  container: {
    backgroundColor: "#fff",
    padding: 16,
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: "#ddd",
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  box: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  properties: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  imageThumb: {
    width: "30%",
    height: 70,
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  comment: {
    marginBottom: 6,
  },
  commentName: {
    fontWeight: "bold",
  },
  dateSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "green",
    flex: 1,
  },
  bookButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  bookText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  reviewBox: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  reviewerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#ccc",
  },
  reviewerName: {
    fontWeight: "bold",
  },
  priceBookContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f8ff",
    borderRadius: 12,
    padding: 18,
    marginVertical: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  priceContainer: {
    flex: 1,
    justifyContent: "center",
  },
  label:
  {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: "#2960B2",
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2960B2",
    marginVertical: 2,
  },
  priceSub: {
    fontSize: 14,
    color: "#555",
  },
  bookButtonCohesive: {
    backgroundColor: "#2960B2",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginLeft: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2960B2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  bookButtonTextCohesive: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  bookingCard: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  bookingText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
});
