import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useUserContext } from '../context/UserContext';
import { getDistanceFromLatLonInKm } from '../utils/reusableStuff';

const CarouselDistancePanel = ({ itemOwnerLocation }: { itemOwnerLocation: string }) => {
  const userContext = useUserContext();

  if (!userContext.data?.location) {
    return null;
  }

  function isValidCoordinates(coords: string) {
    const arr = coords.split(',');
    if (arr.length !== 2) {
      return false;
    }
    if (isNaN(Number(arr[0])) || isNaN(Number(arr[1]))) {
      return false;
    }
    return true;
  }

  const getLabel = () => {
    if (!userContext.data?.location) {
      return null;
    }
    const distance = Math.round(
      getDistanceFromLatLonInKm(userContext.data.location, itemOwnerLocation)
    );
    if (isNaN(distance)) {
      if (isValidCoordinates(itemOwnerLocation)) {
        return null;
      }
      return itemOwnerLocation;
    }
    return `${distance} km away`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelWrapper}>
        <Text style={styles.label}>{getLabel()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: 50,
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelWrapper: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  label: {},
});

export default CarouselDistancePanel;
