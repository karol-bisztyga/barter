import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Button, TextInput } from 'react-native';
import * as Location from 'expo-location';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { updateUser } from '../../db_utils/updateUser';
import { authorizeUser, cityNameFromLocation, formatLocation } from '../../utils/reusableStuff';
import { router } from 'expo-router';
import { useUserContext } from '../../context/UserContext';
import { showError } from '../../utils/notifications';

export default function LocationScreen() {
  const sessionContext = authorizeUser();
  const userContext = useUserContext();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [city, setCity] = useState<string>('');
  const [locationStr, setLocationStr] = useState<string>('Loading...');

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showError(
          'Permission to access location was denied, you may need to enable location services in settings'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLocationStr(await cityNameFromLocation(formatLocationCoords(location.coords)));
      setCity('');
    } catch (e) {
      showError('error getting location');
      console.error('error getting location', e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const persistedLocation = userContext.data?.location;
        setLocationStr(
          (await formatLocation(persistedLocation)) ||
            'Location unspecified\n\nPlease enable location services or enter city manually'
        );
      } catch (e) {
        showError('error getting location');
        setLocationStr('Error getting location');
        console.error('error getting location', e);
      }
    })();
  }, []);

  const formatLocationCoords = (location: Location.LocationObjectCoords) =>
    `${location.latitude}, ${location.longitude}`;

  const saveLocation = async () => {
    if (!city && !location) {
      showError('neither city nor location provided');
      return;
    }
    const locationToSave: string = location ? formatLocationCoords(location.coords) : city;
    try {
      if (!userContext.data) {
        throw new Error('no user data');
      }
      await updateUser(sessionContext, 'location', locationToSave);
      userContext.setData({ ...userContext.data, location: locationToSave });
      router.back();
    } catch (e) {
      showError('error saving location');
      console.error('error saving location', e);
    }
  };

  const selectStyle = (selected: boolean) => {
    return selected ? { borderColor: 'lightgreen', borderWidth: 3 } : {};
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.paragraph}>{locationStr}</Text>
      </View>
      <TouchableOpacity style={styles.section} activeOpacity={1} onPress={getLocation}>
        <FontAwesome
          size={40}
          name="location-arrow"
          style={[styles.cityInput, selectStyle(!!location)]}
        />
      </TouchableOpacity>
      <View style={styles.section}>
        {/* todo verify/autocomplete city name */}
        <TextInput
          value={city}
          onChangeText={(value) => {
            setLocation(null);
            setCity(value);
            setLocationStr(value);
          }}
          placeholder="City"
          style={[styles.cityInput, selectStyle(!!city)]}
        />
      </View>
      <View style={styles.section}>
        <Button title="Save" disabled={!city && !location} onPress={saveLocation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    padding: 20,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
    marginRight: 0,
  },
  cityInput: {
    borderWidth: 1,
    width: '100%',
    padding: 10,
    textAlign: 'center',
    borderRadius: 10,
  },
});
