import React from 'react';
import { View, StyleSheet } from 'react-native';

export const SEPARATOR_HEIGHT = 1;

export default function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  separator: {
    height: SEPARATOR_HEIGHT,
    backgroundColor: 'black',
    marginRight: 20,
    marginLeft: 20,
  },
});
