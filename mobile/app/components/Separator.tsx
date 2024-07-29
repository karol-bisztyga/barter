import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

export const SEPARATOR_HEIGHT = 1;

export default function Separator({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.separator, style]} />;
}

const styles = StyleSheet.create({
  separator: {
    height: SEPARATOR_HEIGHT,
    backgroundColor: 'black',
    marginRight: 20,
    marginLeft: 20,
  },
});
