import React, { useEffect, useState } from "react";
import { View, TextInput, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from "react-native";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { Booking } from "../types";
import { useStripe } from '@stripe/stripe-react-native';
import { EXPO_PUBLIC_AZURE } from "@env";

const BACKEND_URL = EXPO_PUBLIC_AZURE;

export default function BookingListingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/bookings/sailor/${user?.id}`);
        console.log("Fetching bookings for user ID:", user?.id);
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
        setFilteredBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);        
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = bookings.filter((booking) => {
      return (
        booking.id.toString().includes(query) ||
        booking.sailorId.toString().includes(query) ||
        booking.dockId.toString().includes(query) ||
        booking.startDate.includes(query) ||
        booking.endDate.includes(query) ||
        booking.paymentMethod.toLowerCase().includes(query) ||
        booking.paymentStatus.toLowerCase().includes(query)
      );
    });
    setFilteredBookings(filtered);
  }, [searchQuery, bookings]);

  const handlePay = async (booking: Booking) => {
    try {
          const response = await fetch(`${BACKEND_URL}/payments/create-payment-intent`
            , {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                          bookingId: booking.id
                      })
            });

          const data = await response.json();
          console.log("Booking response:", data);

          if (response.ok && data.clientSecret) {
            // Initialize the payment sheet
            const initResult = await initPaymentSheet({
              paymentIntentClientSecret: data.clientSecret,
              merchantDisplayName: "Stripe",
            });

            if (initResult.error) {
              Alert.alert("Stripe Error", initResult.error.message);
              return;
            }

            // present the payment sheet
            const paymentResult = await presentPaymentSheet();

            if (paymentResult.error) {
              Alert.alert("Payment Failed", paymentResult.error.message);
            } else {
              Alert.alert("Success", "Payment complete!");
              navigation.navigate("Home");
              // Payment successful, update booking status to PAID
              try {
                const updateResponse = await fetch(
                  `${BACKEND_URL}/bookings/${data.booking.id}`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...data.booking,
                      paymentStatus: "PAID",
                    }),
                  }
                );
                if (updateResponse.ok) {
                  Alert.alert("Success", "Payment complete and booking updated!");
                } else {
                  Alert.alert("Warning", "Payment complete, but booking status not updated.");
                }
              } catch (err) {
                Alert.alert("Warning", "Payment complete, but failed to update booking status.");
              }
              navigation.navigate("Home");
            }
          } else {
            Alert.alert("Error", "Booking failed or payment could not be initiated.");
          }
        } catch (e) {
          Alert.alert("Error", "Could not create booking.");
        }
  };

  return (
    <View style={styles.container}>
      <Header title="Bookings" showBackButton showButtons={false} />
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by any field"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {Array.isArray(filteredBookings) && filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <Text style={styles.bookingTitle}>Booking #{booking.id}</Text>
              {/*<Text style={styles.bookingLabel}>
                Sailor ID: <Text style={styles.bookingValue}>{booking.sailorId}</Text>
              </Text>*/}
              <Text style={styles.bookingLabel}>
                Dock ID: <Text style={styles.bookingValue}>{booking.dockId}</Text>
              </Text>
              <Text style={styles.bookingLabel}>
                Dates:{" "}
                <Text style={styles.bookingValue}>
                  {booking.startDate} - {booking.endDate}
                </Text>
              </Text>
              <Text style={styles.bookingLabel}>
                People: <Text style={styles.bookingValue}>{booking.people}</Text>
              </Text>
              <Text style={styles.bookingLabel}>
                Payment: <Text style={styles.bookingValue}>{booking.paymentMethod}</Text>
              </Text>
              <Text style={styles.bookingLabel}>
                Status: <Text style={styles.bookingValue}>{booking.paymentStatus}</Text>
              </Text>
              {booking.totalPrice !== undefined && (
                  <Text style={styles.bookingLabel}>
                    Total Price: <Text style={styles.bookingValue}>{booking.totalPrice} PLN</Text>
                  </Text>
              )}

              {booking.paymentStatus === 'UNPAID' && (
                <TouchableOpacity 
                  style={styles.payButton} 
                  onPress={() => handlePay(booking)}
                >
                  <Text style={styles.payButtonText}>
                    Pay {booking.totalPrice ? `${booking.totalPrice} PLN` : 'Booking'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.placeholderText}>You don't have any bookings yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f8ff" },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  searchInput: {
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
    padding: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    marginTop: 5,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2960B2",
    marginBottom: 8,
  },
  bookingLabel: {
    fontSize: 15,
    color: "#2960B2",
    fontWeight: "600",
    marginBottom: 2,
  },
  bookingValue: {
    fontWeight: "normal",
    color: "#222",
  },
  placeholderText: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 16,
  },
  payButton: {
    backgroundColor: "green",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
