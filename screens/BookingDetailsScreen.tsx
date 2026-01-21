import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRoute, useNavigation, NavigationProp } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../types";
import { useStripe } from '@stripe/stripe-react-native';
import { EXPO_PUBLIC_AZURE } from "@env";

const BACKEND_URL = EXPO_PUBLIC_AZURE;

export default function BookingDetailsScreen() {
  //payments
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const route = useRoute<any>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Use startDate and endDate from route as defaults
  const [fromDate, setFromDate] = useState<Date>(
    route.params?.fromDate ? new Date(route.params.fromDate) : new Date()
  );
  const [toDate, setToDate] = useState<Date>(
    route.params?.toDate
      ? new Date(route.params.toDate)
      : (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      })()
  );

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [numPeople, setNumPeople] = useState("1");
  const { pricePerNight } = route.params;
  const { pricePerPerson } = route.params;
  const servicesPricing = route.params.servicesPricing ?? 0;
  const { user } = useAuth();

  const handleBookNow = async () => {
    try {
      const booking = {
        sailorId: user?.id ?? 1,
        dockId: route.params?.dockId ?? 1,
        startDate: fromDate.toISOString().slice(0, 10),
        endDate: toDate.toISOString().slice(0, 10),
        people: parseInt(numPeople),
        paymentMethod: "ONLINE",
        paymentStatus: "UNPAID",
      };

      const response = await fetch(`${BACKEND_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });

      if (response.ok) {
        Alert.alert("Success", "Booking created!");
        navigation.goBack();
      } else {
        Alert.alert("Error", "Failed to create booking.");
      }
    } catch (e) {
      Alert.alert("Error", "Could not create booking.");
    }
  };

  const handleBookAndPay = async () => {
    try {
      const bookingPayload = {
        sailorId: user?.id ?? 1,
        dockId: route.params?.dockId ?? 1,
        startDate: fromDate.toISOString().slice(0, 10),
        endDate: toDate.toISOString().slice(0, 10),
        people: parseInt(numPeople),
        paymentMethod: "ONLINE",
        paymentStatus: "UNPAID",
        totalPrice: totalCost,
      };

      const response = await fetch(`${BACKEND_URL}/bookings/create-and-pay`
        , {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingPayload),
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


  const diffDays = Math.max(
    Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)),
    1
  );

  useEffect(() => {
    setTotalCost((diffDays * pricePerNight) + (diffDays * pricePerPerson * parseInt(numPeople))
     + (diffDays * servicesPricing));
  }, [fromDate, toDate, numPeople, pricePerNight, pricePerPerson, diffDays, servicesPricing]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Booking Details</Text>

      <View style={styles.row}>
        {/* FROM DATE */}
        <View style={styles.dateSection}>
          <Text style={styles.label}>From</Text>
          <TouchableOpacity
            onPress={() => setShowFromPicker(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateText}>{fromDate.toLocaleDateString("en-GB")}</Text>
          </TouchableOpacity>
          {showFromPicker && (
            <DateTimePicker
              value={fromDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(_, selectedDate) => {
                setShowFromPicker(false);
                if (selectedDate) {
                  setFromDate(selectedDate);
                  // If fromDate is after toDate, move toDate to next day
                  if (selectedDate >= toDate) {
                    const nextDay = new Date(selectedDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setToDate(nextDay);
                  }
                }
              }}
            />
          )}
        </View>
        {/* TO DATE */}
        <View style={styles.dateSection}>
          <Text style={styles.label}>To</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowToPicker(true)}
          >
            <Text>{toDate.toLocaleDateString("en-GB")}</Text>
          </TouchableOpacity>
          {showToPicker && (
            <DateTimePicker
              value={toDate}
              mode="date"
              minimumDate={fromDate}
              display="default"
              onChange={(_, selectedDate) => {
                setShowToPicker(false);
                if (selectedDate) {
                  setToDate(selectedDate);
                }
              }}
            />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Number of People</Text>
        <View style={styles.peopleRow}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() =>
              setNumPeople((prev) =>
                parseInt(prev) > 1 ? (parseInt(prev) - 1).toString() : "1"
              )
            }
          >
            <Text style={styles.counterButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.peopleCount}>{numPeople}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() =>
              setNumPeople((prev) => (parseInt(prev) + 1).toString())
            }
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Price + Book */}
      <View style={styles.priceBookContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Mooring price per Night</Text>
          <Text style={styles.priceValue}>{pricePerNight} PLN</Text>
          <Text style={styles.priceLabel}>Additional price per Person, per Night</Text>
          <Text style={styles.priceValue}>{pricePerPerson} PLN</Text>
          <Text style={styles.priceLabel}>Services price per Night</Text>
          <Text style={styles.priceValue}>{servicesPricing} PLN</Text>
          <Text style={styles.priceLabel}>Nights</Text>
          <Text style={styles.priceValue}>{diffDays}</Text>
          <Text style={styles.priceLabel}>People</Text>
          <Text style={styles.priceValue}>{numPeople}</Text>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{totalCost} PLN</Text>
          <TouchableOpacity
            style={styles.bookButtonCohesive}
            onPress={handleBookNow}
          >
            <Text style={styles.bookButtonTextCohesive}>Book now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bookButtonCohesive, { backgroundColor: "green" }]}
            onPress={handleBookAndPay}
          >
            <Text style={styles.bookButtonTextCohesive}>Book & Pay Online</Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f8ff",
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2960B2",
    marginBottom: 24,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  dateSection: {
    flex: 1,
    marginHorizontal: 8,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2960B2",
    marginBottom: 6,
    textAlign: "center",
  },
  dateButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    minWidth: 110,
  },
  dateText: {
    fontSize: 16,
    color: "#222",
  },
  section: {
    marginBottom: 24,
    alignItems: "center",
  },
  peopleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  counterButton: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  counterButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2960B2",
  },
  peopleCount: {
    fontSize: 18,
    minWidth: 32,
    textAlign: "center",
    color: "#2960B2",
    fontWeight: "bold",
  },
  priceBookContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
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
  priceLabel: {
    fontSize: 14,
    color: "#2960B2",
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2960B2",
    marginVertical: 2,
  },
  totalLabel: {
    fontSize: 16,
    color: "#2960B2",
    fontWeight: "600",
    marginTop: 8,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "green",
    marginBottom: 4,
  },
  bookButtonCohesive: {
    backgroundColor: "#2960B2",
    paddingVertical: 18,
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
});