import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { AuthProvider } from "./context/AuthContext";
import { StripeProvider } from '@stripe/stripe-react-native';


import WelcomeScreen from "./screens/WelcomeScreen";
import SignInScreen from "./screens/SignInScreen";
import HomeScreen from "./screens/HomeScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileViewScreen from "./screens/ProfileViewScreen";
import GuideListingsScreen from "./screens/GuideListingScreen";
import GuideDetailsScreen from "./screens/GuideDetailsScreen";
import DockDetailsScreen from "./screens/DockDetailsScreen";
import BookingDetailsScreen from "./screens/BookingDetailsScreen";
import BookingListingsScreen from "./screens/BookingListingsScreen";
import DockOwnerScreen from "./screens/DockOwnerScreen";
import AddDockScreen from "./screens/AddDockScreen";
import PortDetailsScreen from "./screens/PortDetailsScreen";
import AddPortScreen from "./screens/AddPortScreen";
import MapScreen from "./screens/MapScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <StripeProvider
      publishableKey="pk_test_51RVbLeB19X2jyn8E9fI7jc9Oe9dOLD8BZ3br5C9SrUNKwzveSp7qzryaleKrZFYwFwhUk08rl9wbPy4KAcURdG6K00RreJH79n">
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="Home" component={HomeScreen} /> 
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ProfileView" component={ProfileViewScreen} />
          <Stack.Screen name="GuideListings" component={GuideListingsScreen} />
          <Stack.Screen name="GuideDetailsScreen" component={GuideDetailsScreen} />
          <Stack.Screen name="DockDetails" component={DockDetailsScreen} />
          <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
          <Stack.Screen name="BookingListings" component={BookingListingsScreen} />
          <Stack.Screen name="DockOwnerScreen" component={DockOwnerScreen} />
          <Stack.Screen name="AddDockScreen" component={AddDockScreen} />
          <Stack.Screen name="PortDetails" component={PortDetailsScreen} />
          <Stack.Screen name="AddPortScreen" component={AddPortScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
    </StripeProvider>
  );
}