import React from 'react';
import { StyleSheet } from 'react-native';
import TextWrapper from '../genericComponents/TextWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { ItemData } from '../types';

const CarouselInfoPanel = ({ itemData }: { itemData: ItemData }) => {
  return (
    <LinearGradient style={styles.container} colors={['transparent', 'black']}>
      <TextWrapper style={[styles.text, styles.itemName]}>{itemData.name}</TextWrapper>
      <TextWrapper style={[styles.text, styles.description]} numberOfLines={2} ellipsizeMode="tail">
        {itemData.description}
      </TextWrapper>
      <TextWrapper style={[styles.text, styles.itemOwnerName]}>{itemData.userName}</TextWrapper>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: 100,
    bottom: 0,
    left: 0,
    paddingLeft: 10,
    flexDirection: 'column',
  },
  text: { color: 'white' },
  itemName: {
    fontSize: 25,
  },
  itemOwnerName: {
    fontSize: 10,
    opacity: 0.7,
  },
  description: { fontSize: 12 },
});

export default CarouselInfoPanel;
