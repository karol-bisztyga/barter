import React from 'react';
import { StyleSheet, View } from 'react-native';
import TextWrapper from '../genericComponents/TextWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { ItemData } from '../types';

const CarouselInfoPanel = ({ itemData }: { itemData: ItemData }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        style={styles.container}
        colors={['transparent', 'rgba(0, 0, 0, .5)', 'black']}
        locations={[0, 0.3, 1]}
      />
      <TextWrapper style={[styles.text, styles.itemName]}>{itemData.name}</TextWrapper>
      <TextWrapper style={[styles.text, styles.description]} numberOfLines={2} ellipsizeMode="tail">
        {itemData.description}
      </TextWrapper>
      <TextWrapper style={[styles.text, styles.itemOwnerName]}>{itemData.userName}</TextWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: 100,
    bottom: 0,
    left: 0,
    flexDirection: 'column',
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: 100,
    bottom: 0,
    left: 0,
    flexDirection: 'column',
  },
  text: { color: 'white', textAlign: 'center' },
  itemName: {
    fontSize: 24,
  },
  itemOwnerName: {
    fontSize: 14,
    opacity: 0.7,
  },
  description: { fontSize: 12 },
});

export default CarouselInfoPanel;
