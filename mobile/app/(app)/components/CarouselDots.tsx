import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WHITE_COLOR } from '../constants';

const CarouselDots = ({
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
            style={[styles.dot, { backgroundColor: index === imageIndex ? WHITE_COLOR : 'grey' }]}
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
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsWrapper: {
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'rgba(0,0,0, 0.7)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 5,
  },
});

export default CarouselDots;
