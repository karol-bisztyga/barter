import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import ButtonWrapper from '../genericComponents/ButtonWrapper';

export default function Onboarding() {
  return (
    <View style={styles.container}>
      <Text>Onboarding not implemented yet stage 3...</Text>
      <ButtonWrapper
        title="proceed"
        onPress={() => {
          router.replace('/swipe');
        }}
      />
      <ButtonWrapper
        title="skip onboarding"
        onPress={() => {
          router.replace('/swipe');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
