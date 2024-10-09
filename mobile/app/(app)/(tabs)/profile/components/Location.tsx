import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useUserContext } from '../../../context/UserContext';
import { formatLocation } from '../../../utils/reusableStuff';
import { router } from 'expo-router';
import ButtonWrapper from '../../../genericComponents/ButtonWrapper';
import TextWrapper from '../../../genericComponents/TextWrapper';

const Location = () => {
  const userContext = useUserContext();

  const [location, setLocation] = useState<string>('Loading...');

  useEffect(() => {
    (async () => {
      try {
        setLocation((await formatLocation(userContext.data)) || 'Unknown');
      } catch (e) {
        setLocation('Error getting location');
      }
    })();
  }, [userContext.data?.userLocationCity, userContext.data?.userLocationCoordinates]);

  return (
    <View style={styles.container}>
      <TextWrapper style={styles.locationLabel}>{location}</TextWrapper>
      <ButtonWrapper
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
