import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TextInput, Platform, PermissionsAndroid } from 'react-native';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Port } from '../types';
import Header from "../components/Header";
import Mapbox from "@rnmapbox/maps";
import { EXPO_PUBLIC_AZURE } from "@env";

const BACKEND_URL = EXPO_PUBLIC_AZURE;

Mapbox.setAccessToken("pk.eyJ1IjoiamFuZG9uYWxkIiwiYSI6ImNtajhuOWo2OTAyZW0zZnNiaWEzN3VzeTgifQ.5xciwS8uBQRC4NMRWYjsTw");

const INITIAL_COORDS = {
  center: [21.75, 53.88], // longitude, latitude
  zoom: 8.7,
};

type MapRouteProp = RouteProp<RootStackParamList, 'Map'>;

export default function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<MapRouteProp>();
  const [ports, setPorts] = useState<Port[]>([]);
  const [filteredPorts, setFilteredPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(route.params?.searchQuery || "");
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    if (route.params?.searchQuery !== undefined) {
      setSearchQuery(route.params.searchQuery);
    }
  }, [route.params?.searchQuery]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('You can use the location');
            setHasLocationPermission(true);
          } else {
            console.log('Location permission denied');
            setHasLocationPermission(false);
          }
        } catch (err) {
          console.warn(err);
          setHasLocationPermission(false);
        }
      } else {
        // For iOS, Mapbox handles it or we assume true for now/handled by plist
        setHasLocationPermission(true);
      }
    };

    requestLocationPermission();
  }, []);

  const fetchPorts = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/ports`);
      const data = await res.json();
      setPorts(Array.isArray(data) ? data.filter(p => p.latitude && p.longitude) : []);
    } catch (err) {
      console.error("Failed to fetch ports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPorts();
    }, [fetchPorts])
  );

  useEffect(() => {
    const filtered = ports.filter(port => 
      port.approved && // Filter by approved ports
      ((port.location?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      || (port.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      || (port.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
    );
    setFilteredPorts(filtered);
  }, [ports, searchQuery]);

  const handleMarkerPress = (portId: number) => {
    navigation.navigate('PortDetails', { 
      portId: portId, 
      fromDate: new Date(), 
      toDate: new Date() 
    });
  };

  const handleBack = () => {
    navigation.navigate("Home", { searchQuery });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Map" showBackButton showButtons={false} searchQuery={searchQuery} onBack={handleBack} />
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, location, description..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera
          defaultSettings={{
            centerCoordinate: INITIAL_COORDS.center,
            zoomLevel: INITIAL_COORDS.zoom,
          }}
        />
        {hasLocationPermission && <Mapbox.UserLocation visible={true} />}
        {filteredPorts.map(port => (
          <Mapbox.PointAnnotation
            key={port.id}
            id={port.id.toString()}
            coordinate={[port.longitude, port.latitude]}
            onSelected={() => handleMarkerPress(port.id)}
          />
        ))}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  searchInput: {
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
    padding: 10,
    paddingHorizontal: 15,
  },
});
