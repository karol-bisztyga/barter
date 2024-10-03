import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useUserContext } from '../context/UserContext';
import { getDistanceFromLatLonInKm } from '../utils/reusableStuff';
import TextWrapper from '../genericComponents/TextWrapper';
import { INDICATOR_HEIGHT } from './CarouselImageIndicators';

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

  const label = getLabel();

  if (!label) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelWrapper}>
        <TextWrapper style={styles.label}>{label}</TextWrapper>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: 50,
    top: INDICATOR_HEIGHT,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelWrapper: {
    borderRadius: 20,
    padding: 10,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: 'rgba(0,0,0, 0.7)',
  },
  label: {
    color: 'white',
  },
});

export default CarouselDistancePanel;
