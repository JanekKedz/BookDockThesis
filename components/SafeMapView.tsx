import { useNavigation } from '@react-navigation/native';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import MapView, { BoundingBox, MapViewProps, Region } from 'react-native-maps';

/**
 * This component is a workaround for a bug in react-native-maps for Android,
 * where the map does not update correctly when navigating back to it from a different screen.
 * This method sets up listeners for the navigation focus and blur events to handle the map state
 * and redraw the map when the screen is focused.
 * https://github.com/react-native-maps/react-native-maps/issues/5595
 */
export const SafeMapView = React.forwardRef<MapView, MapViewProps>(
  (props, ref) => {
    const navigation = useNavigation();
    const [mapKey, setMapKey] = useState(0);
    const lastBoundaries = useRef<BoundingBox | undefined>(undefined);

    useEffect(() => {
      if (Platform.OS === 'android') {
        const focusListener = navigation.addListener('focus', () => {
          setMapKey(prevKey => prevKey + 1);
          if (lastBoundaries.current) {
            const region: Region = {
              latitude:
                (lastBoundaries.current.northEast.latitude +
                  lastBoundaries.current.southWest.latitude) /
                2,
              longitude:
                (lastBoundaries.current.northEast.longitude +
                  lastBoundaries.current.southWest.longitude) /
                2,
              latitudeDelta:
                lastBoundaries.current.northEast.latitude -
                lastBoundaries.current.southWest.latitude,
              longitudeDelta:
                lastBoundaries.current.northEast.longitude -
                lastBoundaries.current.southWest.longitude,
            };
            setTimeout(() => {
              (ref as RefObject<MapView | null>)?.current?.animateToRegion(region, 100);
            }, 100);
          }
        });

        const blurListener = navigation.addListener('blur', async () => {
          if ((ref as RefObject<MapView | null>)?.current) {
            lastBoundaries.current = await (
              ref as RefObject<MapView>
            ).current?.getMapBoundaries();
          }
        });

        return () => {
          navigation.removeListener('focus', focusListener);
          navigation.removeListener('blur', blurListener);
        };
      }
    }, [navigation, ref]);

    return <MapView {...props} key={mapKey} ref={ref} />;
  },
);
