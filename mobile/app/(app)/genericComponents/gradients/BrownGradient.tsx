import React, { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BROWN_COLOR_2 } from '../../constants';
import { StyleSheet, ViewStyle } from 'react-native';

interface BrownGradientProps {
  children?: ReactNode;
  style?: ViewStyle;
}

export const BrownGradient = ({ children = null, style }: BrownGradientProps) => {
  return (
    <LinearGradient
      colors={['#000', BROWN_COLOR_2, '#000']}
      locations={[0, 0.38, 1]}
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
