import React from 'react';
import { StyleSheet, View } from 'react-native';
import TextWrapper from '../../genericComponents/TextWrapper';

export default function Credits() {
  return (
    <View style={styles.container}>
      <TextWrapper>Not implemented yet...</TextWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
