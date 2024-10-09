import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextWrapper from '../genericComponents/TextWrapper';
import { INDICATOR_HEIGHT } from './CarouselImageIndicators';
import { ItemData } from '../types';

const CarouselDistancePanel = ({ itemData }: { itemData: ItemData }) => {
  const getLabel = () => {
    if (!itemData.ownerLocationCity && !itemData.distanceKm) {
      return '';
    }
    if (itemData.distanceKm !== undefined && !isNaN(parseInt(itemData.distanceKm))) {
      return `${itemData.distanceKm} km away`;
    }
    return itemData.ownerLocationCity;
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
