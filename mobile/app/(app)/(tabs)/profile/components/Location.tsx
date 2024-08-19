import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import { useUserContext } from '../../../context/UserContext';
import { formatLocation } from '../../../utils/reusableStuff';
import { router } from 'expo-router';

const Location = () => {
  const userContext = useUserContext();

  const [location, setLocation] = useState<string>('Loading...');

  useEffect(() => {
    (async () => {
      try {
        setLocation((await formatLocation(userContext.data?.location)) || 'Unknown');
      } catch (e) {
        setLocation('Error getting location');
      }
    })();
  }, [userContext.data?.location]);

  return (
    <View style={styles.container}>
      <Text style={styles.locationLabel}>{location}</Text>
      <Button
        title="set location"
        onPress={() => {
          router.push('profile/set_location');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    flexDirection: 'column',
  },
  locationLabel: {
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default Location;
