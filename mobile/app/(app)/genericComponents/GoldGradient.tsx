import React, { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { GOLD_COLOR_1, GOLD_COLOR_2 } from '../constants';
import { StyleSheet } from 'react-native';

export const GoldGradient = ({ children = null }: { children?: ReactNode }) => {
  return (
    <LinearGradient
      colors={[GOLD_COLOR_1, GOLD_COLOR_2, GOLD_COLOR_1]}
      locations={[0, 0.47, 1]}
      style={styles.gradient}
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
