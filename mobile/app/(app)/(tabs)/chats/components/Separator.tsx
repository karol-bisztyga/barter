import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GoldGradient } from '../../../genericComponents/gradients/GoldGradient';
import { SwordsIcon } from '../../../utils/icons';

const SQUARE_SIZE = 24;
const SQUARE_STROKE_WIDTH = 2;
const ICON_SIZE = 24;

export const Separator = () => {
  return (
    <View style={styles.container}>
      <View style={styles.line}>
        <GoldGradient />

        <View style={styles.squareBorder}>
          <GoldGradient />
          <View style={styles.squareFill} />
        </View>
        <SwordsIcon width={ICON_SIZE} height={ICON_SIZE} style={styles.icon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 2,
  },
  line: {
    height: 2,
    alignItems: 'center',
    marginHorizontal: 14,
  },
  squareBorder: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    transform: [{ rotate: '45deg' }],
    top: -SQUARE_SIZE / 2 + 1,
  },
  icon: {
    position: 'absolute',
    top: -ICON_SIZE / 2 + 1,
  },
  squareFill: {
    position: 'absolute',
    top: SQUARE_STROKE_WIDTH / 2,
    left: SQUARE_STROKE_WIDTH / 2,
    backgroundColor: 'black',
    width: SQUARE_SIZE - SQUARE_STROKE_WIDTH,
    height: SQUARE_SIZE - SQUARE_STROKE_WIDTH,
  },
});
