import React from 'react';
import { StyleSheet, View } from 'react-native';
import TextWrapper from '../../genericComponents/TextWrapper';
import Background from '../../components/Background';

export default function Credits() {
  return (
    <View style={styles.container}>
      <Background tile="sword" forceFullScreen />
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
