import React from 'react';
import { StyleSheet } from 'react-native';
import TextWrapper from '../genericComponents/TextWrapper';
import { LinearGradient } from 'expo-linear-gradient';

export type CarouselInfoPanelData = {
  itemName: string;
  itemOwnerName?: string;
  description: string;
};

type CarouselInfoPanelProps = {
  data: CarouselInfoPanelData;
};

const CarouselInfoPanel = ({ data }: CarouselInfoPanelProps) => {
  return (
    <LinearGradient style={styles.container} colors={['transparent', 'black']}>
      <TextWrapper style={[styles.text, styles.itemName]}>{data.itemName}</TextWrapper>
      <TextWrapper style={[styles.text, styles.description]} numberOfLines={2} ellipsizeMode="tail">
        {data.description}
      </TextWrapper>
      <TextWrapper style={[styles.text, styles.itemOwnerName]}>{data.itemOwnerName}</TextWrapper>
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
