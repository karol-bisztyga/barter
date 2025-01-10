import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GoldGradient } from '../../../genericComponents/gradients/GoldGradient';
import { SwordsIcon } from '../../../utils/icons';
import { convertFigmaShadowToReactNative } from '../../../utils/reusableStuff';

const SQUARE_SIZE = 24;
const SQUARE_STROKE_WIDTH = 2;
const ICON_SIZE = 24;

export const SeparatorVertical = () => {
  return (
    <View style={styles.container}>
      <View style={styles.line}>
        <GoldGradient />
        <View style={styles.squareBorder}>
          <GoldGradient />
          <View style={styles.squareFill} />
        </View>
        <SwordsIcon
          width={ICON_SIZE}
          height={ICON_SIZE}
          style={[
            styles.icon,
            {
              ...convertFigmaShadowToReactNative({
                x: 0,
                y: 4,
                blur: 12,
                color: '#FFFFFF',
                opacity: 1,
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
  },
  line: {
    flex: 1,
    width: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareBorder: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    transform: [{ rotate: '45deg' }],
  },
  icon: {
    position: 'absolute',
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
