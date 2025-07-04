import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GoldGradient } from '../../../../genericComponents/gradients/GoldGradient';
import { SvgProps } from 'react-native-svg';

const SQUARE_SIZE = 16;
const SQUARE_STROKE_WIDTH = 2;
const ICON_SIZE = 24;

type SeparatorProps = {
  marginTop: number;
  Icon?: React.FC<SvgProps>;
};

export const Separator = ({ marginTop, Icon }: SeparatorProps) => {
  return (
    <View style={[styles.container, { marginTop: marginTop + 11 }]}>
      <View style={styles.line}>
        <GoldGradient />

        <View style={styles.squareBorder}>
          <GoldGradient />
          <View style={styles.squareFill} />
        </View>
        {Icon && <Icon width={ICON_SIZE} height={ICON_SIZE} style={styles.icon} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  line: {
    height: 2,
    alignItems: 'center',
    width: 185,
  },
  squareBorder: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    transform: [{ rotate: '45deg' }],
    top: -SQUARE_SIZE / 2 + 1,
  },
  icon: {
    position: 'absolute',
    top: -ICON_SIZE / 2,
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
