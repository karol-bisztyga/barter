import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GOLD_COLOR_1, GOLD_COLOR_2 } from '../constants';

export const INDICATOR_HEIGHT = 2;
const OFFSET = 8;
const COLOR_ACTIVE = GOLD_COLOR_2;
const COLOR_INACTIVE = GOLD_COLOR_1;

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
            style={[
              styles.indicator,
              { backgroundColor: index === imageIndex ? COLOR_ACTIVE : COLOR_INACTIVE },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: OFFSET,
    left: OFFSET,
    right: OFFSET,
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
