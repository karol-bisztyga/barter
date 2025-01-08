import React, { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { GOLD_COLOR_1, GOLD_COLOR_2 } from '../../constants';
import { StyleSheet, ViewStyle } from 'react-native';

interface GoldGradientProps {
  children?: ReactNode;
  style?: ViewStyle;
}

export const GoldGradient = ({ children = null, style }: GoldGradientProps) => {
  return (
    <LinearGradient
      colors={[GOLD_COLOR_1, GOLD_COLOR_2, GOLD_COLOR_1]}
      locations={[0, 0.47, 1]}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
