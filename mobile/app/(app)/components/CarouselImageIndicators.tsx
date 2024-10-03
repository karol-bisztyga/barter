import React from 'react';
import { View, StyleSheet } from 'react-native';

export const INDICATOR_HEIGHT = 5;

const CarouselImageIndicators = ({
  images,
  actionPanelVisible,
  imageIndex,
}: {
  images: string[];
  actionPanelVisible: boolean;
  imageIndex: number;
}) => {
  return (
    <View style={[styles.container, { bottom: actionPanelVisible ? 90 : 20 }]}>
      <View style={styles.dotsWrapper}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[styles.indicator, { backgroundColor: index === imageIndex ? 'white' : 'grey' }]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    top: 0,
    justifyContent: 'center',
    height: INDICATOR_HEIGHT * 2,
  },
  dotsWrapper: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 20,
  },
  indicator: {
    flex: 1,
    height: INDICATOR_HEIGHT,
    margin: 3,
    borderRadius: 200,
  },
});

export default CarouselImageIndicators;
